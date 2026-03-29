require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/auth/callback"
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  res.redirect(url);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    req.session.tokens = tokens;
    req.session.user = {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };

    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}?error=auth_failed`
    );
  }
});

app.get("/auth/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session.tokens) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  oauth2Client.setCredentials(req.session.tokens);
  next();
}

// ─── GMAIL ROUTES ─────────────────────────────────────────────────────────────

app.get("/api/emails", requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      q: "is:unread",
    });

    const messages = response.data.messages || [];
    const emails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });
        const headers = detail.data.payload.headers;
        const get = (name) =>
          headers.find((h) => h.name === name)?.value || "";
        return {
          id: msg.id,
          subject: get("Subject"),
          from: get("From"),
          date: get("Date"),
          snippet: detail.data.snippet,
        };
      })
    );

    res.json({ emails });
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// ─── SUMMARIZE using Gemini 1.5 Flash ────────────────────────────────────────

app.get("/api/emails/:id/summarize", requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: req.params.id,
      format: "full",
    });

    // Extract plain text body
    let body = "";
    const parts = detail.data.payload.parts || [];
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
        break;
      }
    }
    if (!body && detail.data.payload.body?.data) {
      body = Buffer.from(detail.data.payload.body.data, "base64").toString(
        "utf-8"
      );
    }

    if (!body) {
      return res.json({ summary: "No readable content found in this email." });
    }

    // ✅ Fixed: use gemini-1.5-flash instead of deprecated gemini-pro
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


    const result = await model.generateContent(
      `Summarize this email in 2-3 sentences:\n\n${body.substring(0, 3000)}`
    );
    const summary = result.response.text();

    res.json({ summary });
  } catch (err) {
    console.error("Summarize error:", err);
    res.status(500).json({ error: "Failed to summarize email" });
  }
});

// ─── REPLY ────────────────────────────────────────────────────────────────────

app.post("/api/emails/:id/reply", requireAuth, async (req, res) => {
  try {
    const { replyText } = req.body;
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const original = await gmail.users.messages.get({
      userId: "me",
      id: req.params.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Message-ID"],
    });
    const headers = original.data.payload.headers;
    const get = (name) => headers.find((h) => h.name === name)?.value || "";
    const to = get("From");
    const subject = get("Subject").startsWith("Re:")
      ? get("Subject")
      : `Re: ${get("Subject")}`;
    const messageId = get("Message-ID");

    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${messageId}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      replyText,
    ];
    const raw = Buffer.from(emailLines.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
        threadId: original.data.threadId,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Reply error:", err);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});