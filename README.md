# StudyHub - AI Powered Learning Platform

## Setup Instructions

### 1. Get FREE Groq API Key (No Credit Card Required)
1. Go to: https://console.groq.com/keys
2. Sign up with email (completely free)
3. Create API key (starts with `gsk_...`)
4. Copy the key

### 2. Add Environment Variable to Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `GROQ_API_KEY`
   - **Value:** your_groq_api_key_here
5. Click **Save**

### 3. Deploy
```bash
vercel --prod
