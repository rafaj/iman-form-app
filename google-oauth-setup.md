# Google OAuth Setup - Step by Step

## 1. Google Cloud Console
- Go to: https://console.cloud.google.com
- Create new project: "IMAN Network"

## 2. Enable APIs
- APIs & Services → Library
- Search "Google+ API" or "People API"
- Enable it

## 3. OAuth Consent Screen
- APIs & Services → OAuth consent screen
- Choose "External"
- App name: "IMAN Professional Network"
- User support email: your email
- Developer contact: your email
- Save and continue through all steps

## 4. Create OAuth Client
- APIs & Services → Credentials
- Create Credentials → OAuth 2.0 Client ID
- Application type: "Web application"
- Name: "IMAN Network Local Development"
- Authorized redirect URIs: 
  `http://localhost:3000/api/auth/callback/google`
- Create

## 5. Copy Credentials
You'll get:
- Client ID (ends with .apps.googleusercontent.com)
- Client Secret (starts with GOCSPX-)

Paste them here when ready!