import fs from "fs";
import readline from "readline";
import { google, gmail_v1 } from "googleapis";
import { SCOPES, TOKEN_PATH, CREDENTIALS_PATH } from "./config";

// Type for OAuth2 client
import { OAuth2Client } from "google-auth-library";

// Get authenticated OAuth2 client
function getOAuthClient(callback: (auth: OAuth2Client) => void): void {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client);
  });
}

// Prompt user to authorize and store token
function getNewToken(oAuth2Client: OAuth2Client, callback: (auth: OAuth2Client) => void): void {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("🔐 Authorize this app by visiting this URL:\n", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code: string) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err || !token) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("✅ Token stored to", TOKEN_PATH);
      callback(oAuth2Client);
    });
  });
}

// Fetch subjects using Gmail API
async function fetchEmailSubjects(): Promise<string[]> {
  return new Promise((resolve) => {
    getOAuthClient(async (auth: OAuth2Client) => {
      try {
        const gmail = google.gmail({ version: "v1", auth });

        const query = "after:2025/03/24 before:2025/03/29";
        const res = await gmail.users.messages.list({
          userId: "me",
          q: query,
          maxResults: 20,
        });

        const messages = res.data.messages;
        if (!messages || messages.length === 0) {
          console.log("No emails found for the given date range.");
          return resolve([]);
        }

        const subjectList: string[] = [];

        for (const msg of messages) {
          const msgData = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "metadata",
            metadataHeaders: ["Subject"],
          });

          const headers = msgData.data.payload?.headers || [];
          const subjectHeader = headers.find(h => h.name === "Subject");
          subjectList.push(subjectHeader?.value || "(No Subject)");
        }

        resolve(subjectList);
      } catch (err) {
        console.error("API Error:", err);
        resolve([]);
      }
    });
  });
}

export default fetchEmailSubjects;
