# StudyHub — Deployment Guide

## Project Structure
```
studyhub/
├── api/
│   └── chat.js          ← Vercel serverless function (OpenRouter key lives here)
├── public/
│   └── index.html       ← Frontend (Firebase config already embedded)
└── vercel.json          ← Vercel routing config
```

---

## Step 1 — Get your OpenRouter API Key
1. Go to https://openrouter.ai/keys
2. Click **Create Key**
3. Copy the key (starts with `sk-or-v1-...`)

---

## Step 2 — Deploy to Vercel

### Option A: Via GitHub (Recommended)
1. Create a new repo on GitHub and push this entire `studyhub/` folder
2. Go to https://vercel.com → **New Project** → Import your GitHub repo
3. Vercel will auto-detect the config

### Option B: Via Vercel CLI
```bash
npm install -g vercel
cd studyhub
vercel
```

---

## Step 3 — Add your OpenRouter key to Vercel (IMPORTANT)
1. In Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add this variable:
   - **Name:**  `OPENROUTER_API_KEY`
   - **Value:** `sk-or-v1-your-actual-key-here`
   - **Environment:** Production, Preview, Development ✓
3. Click **Save**
4. Go to **Deployments** → click **Redeploy** so the key takes effect

> ✅ Your OpenRouter key is now 100% secure — never visible to users

---

## Step 4 — Enable Firebase Services
In your Firebase Console (https://console.firebase.google.com):

1. **Authentication** → Get Started → Enable **Email/Password**
2. **Firestore Database** → Create Database → Start in **test mode** → choose a region

---

## Step 5 — Done!
Visit your Vercel URL (e.g. `https://studyhub-xyz.vercel.app`) and test:
- Sign up with a new account
- Add a course (with lecturer name)
- Upload a note
- Ask BrainX
- Generate a test

---

## Firestore Security Rules (for production)
Once tested, go to Firestore → Rules and replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /courses/{doc} {
      allow read, write: if request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
    match /notes/{doc} {
      allow read, write: if request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
    match /tests/{doc} {
      allow read, write: if request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
  }
}
```
