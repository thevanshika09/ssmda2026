import fs from "fs";
import readline from "readline";
import { google, gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { SCOPES, TOKEN_PATH, CREDENTIALS_PATH } from "./config";

// Authorize and send
function authorize(
  credentials: any,
  callback: (auth: OAuth2Client, emailContent: string) => void,
  emailContent: string
): void {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback, emailContent);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client, emailContent);
  });
}

// Token flow
function getNewToken(
  oAuth2Client: OAuth2Client,
  callback: (auth: OAuth2Client, emailContent: string) => void,
  emailContent: string
): void {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code: string) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err || !token)
        return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      callback(oAuth2Client, emailContent);
    });
  });
}

// Send email
function sendEmail(auth: OAuth2Client, content: string): void {
  const gmail: gmail_v1.Gmail = google.gmail({ version: "v1", auth });

  const email = [
    "To: felixjoseph51@gmail.com",
    "Subject: Summary from gmailBot",
    "",
    content,
  ].join("\n");

  const encodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  gmail.users.messages.send(
    {
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    },
    (err) => {
      if (err) return console.log("The API returned an error: " + err);
      console.log("✅ Email sent successfully!");
    }
  );
}

// Entrypoint function
function send(content: string): void {
  fs.readFile(CREDENTIALS_PATH, (err, data) => {
    if (err) return console.log("Error loading credentials file", err);
    authorize(JSON.parse(data.toString()), sendEmail, content);
  });
}

export default send;
