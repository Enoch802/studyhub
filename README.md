# StudyHub — AI-Powered Learning Platform

A full-featured student learning platform powered by BrainX AI (Groq), with Firebase authentication and Firestore database.

---

## 🗂 Project Structure

```
/
├── public/
│   └── index.html        # Full frontend (single-file app)
├── api/
│   └── chat.js           # Vercel serverless backend — calls Groq AI
├── vercel.json           # Vercel deployment config
└── README.md
```

---

## 🚀 Setup & Deployment

### 1. Get a FREE Groq API Key (No Credit Card Required)
1. Go to: https://console.groq.com/keys
2. Sign up with your email (completely free)
3. Click **Create API Key**
4. Copy the key — it starts with `gsk_...`

### 2. Add Environment Variable to Vercel
1. Go to your Vercel dashboard → select your project
2. Go to **Settings** → **Environment Variables**
3. Add:
   - **Name:** `GROQ_API_KEY`
   - **Value:** `your_gsk_...key_here`
   - **Environments:** Production, Preview, Development (check all)
4. Click **Save**
5. **Redeploy** your project after saving the variable

### 3. Firebase Setup
The Firebase config is already embedded in `index.html`. Your project:
- **Project ID:** `studyhub-87ac9`
- **Auth:** Email/Password (enabled in Firebase Console)
- **Database:** Firestore (make sure rules allow authenticated reads/writes)

Recommended Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Deploy to Vercel
```bash
vercel --prod
```
Or push to your connected GitHub repo and Vercel auto-deploys.

---

## 🤖 AI Models Used (Groq — all free)

| Feature | Model | Why |
|---|---|---|
| BrainX Chat | `llama-3.3-70b-versatile` | Most intelligent, thorough answers |
| BrainX Insights | `llama-3.3-70b-versatile` | Strong structured JSON output |
| Word Scramble Game | `llama-3.1-8b-instant` | Fast word generation |
| AI Test Generator | `llama-3.1-8b-instant` | Fast question generation |

> All models are available on the Groq free tier. Your API key works with all of them — no extra setup needed.

---

## ✨ Features

- **Authentication** — Sign up / Login with Firebase Auth
- **Courses** — Create courses, drill into notes, read full note content
- **BrainX Chat** — ChatGPT-style AI chat with full history (24h), new chat, clear history
- **BrainX Insights** — Generate detailed notes on any topic OR explain your uploaded notes
- **AI Test Generator** — Auto-generate MCQ/short answer tests from your notes
- **Word Scramble Game** — AI-powered game with Easy / Intermediate / Hard difficulty
- **Learning Streak** — Daily streak tracker with 7-day calendar on the overview
- **Dark / Light Theme** — Persisted across sessions
- **Fully responsive** — Works on desktop and mobile

---

## 🔧 Backend API

**Endpoint:** `POST /api/chat`

**Request body:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "max_tokens": 2000,
  "temperature": 0.7,
  "json_mode": false
}
```

**Response:**
```json
{
  "text": "AI response here",
  "model": "llama-3.3-70b-versatile",
  "usage": { "prompt_tokens": 120, "completion_tokens": 340 }
}
```

- Set `json_mode: true` for Insights — forces valid JSON output and uses the 70b model
- `max_tokens` is capped at 4000 for json_mode, 2000 for chat
- BrainX system prompt is injected server-side automatically

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| AI not responding | Check `GROQ_API_KEY` is set in Vercel env vars and redeploy |
| "API error 401" | Your Groq key is invalid or expired — regenerate at console.groq.com |
| Firebase auth errors | Make sure Email/Password auth is enabled in Firebase Console |
| Notes not saving | Check Firestore rules allow authenticated writes |
| Vercel function timeout | The `maxDuration: 30` in vercel.json handles slow AI responses |
