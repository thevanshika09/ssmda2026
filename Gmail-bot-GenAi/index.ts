import summarize from "./summarize";
import send from "./send";
import fetchEmailSubjects from "./fetchSubjects";
import dotenv from "dotenv"
dotenv.config()

// For Summarization & Sending
async function SummarizeAndSend(): Promise<void> {
  const prompt = `
  Summarize the following discussion for email format:
  "Team discussed Q1 budget. Expenses exceeded by 12%. Plan to reduce overhead. John's proposal to optimize marketing was accepted."
  Make it formal and brief.
  `;

  const aiContent: string = await summarize(prompt);
  console.log("Generated Email Content:\n", aiContent);
  send(aiContent);
}

// For Fetching Subjects
async function fetchEmails(): Promise<void> {
  const subjects: string[] = await fetchEmailSubjects();
  console.log("📨 Subjects fetched from Gmail:");
  subjects.forEach((subject: string, index: number) => {
    console.log(`${index + 1}. ${subject}`);
  });
}

// Uncomment the one you want to run
//SummarizeAndSend();
fetchEmails();
