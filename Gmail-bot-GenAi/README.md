# Natural Language Bridge to Legacy Email (Powered by Generative AI)

🚀 A Rocket.Chat app that enables users to interact with their legacy email systems (like Gmail) using natural language commands — powered by Gemini Pro and integrated with Gmail APIs.

---

## 📌 Overview

Despite decades of evolution in real-time messaging, email still remains an indispensable part of global communication. This project bridges the gap by allowing Rocket.Chat users to manage, summarize, and interact with their emails directly from the chat interface using natural language.

With powerful LLM capabilities and intuitive slash commands like `/xuebot`, users can fetch emails, generate summaries, extract attachments, and even send emails — all through simple conversational instructions.

---

## ✨ Features

- ✅ **Natural Language Slash Commands**
  - `/xuebot summarize my inbox for today`
  - `/xuebot fetch emails with "invoice" from March 2025`
  - `/xuebot send this thread to john@example.com as email`
  
- 🧠 **LLM-Powered Smart Actions**
  - Email summarization using Gemini Pro
  - Sentiment analysis (future scope)
  - Context-aware reply generation (future scope)

- 📩 **Gmail API Integration**
  - Fetch, search, and parse emails using Gmail API (OAuth secured)
  - Supports date and keyword filters
  - Attachment extraction and upload to Rocket.Chat

- 🔐 **Secure User Authentication**
  - OAuth 2.0 flow for connecting Gmail accounts per user
  - Data access limited to authorized user scope

- ⚙️ **Dynamic AI Settings**
  - Users can bring their own API key for Gemini
  - Workspace-level or personal-level AI configuration

---

## 📚 Technologies Used

- `TypeScript`
- `Gmail API + OAuth 2.0`
- `Gemini-flash-2.0 model (via Gemini API)`
- `Node.js`
- `Express (for external OAuth backend)`

---

