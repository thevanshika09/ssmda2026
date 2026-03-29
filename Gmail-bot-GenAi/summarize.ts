import generateSummary from "./gemini";

async function summarize(prompt: string): Promise<string> {
  const aiContent: string = await generateSummary(prompt);
  return aiContent;
}

export default summarize;
