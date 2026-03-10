# StudyHub - 100% Free with Groq

## Setup (No Credit Card Required)

### 1. Get Free Groq API Key
- Go to: https://console.groq.com/keys
- Sign up with email (free, no payment)
- Create API key
- Copy the key

### 2. Add to Vercel
- Project Settings → Environment Variables
- Name: `GROQ_API_KEY`
- Value: your_groq_key (starts with gsk_...)

### 3. Deploy
```bash
vercel --prod
