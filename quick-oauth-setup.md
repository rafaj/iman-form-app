# Quick OAuth Setup for Testing

## Option 1: GitHub OAuth (Fastest - 2 minutes)

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `IMAN Network Local`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Register and copy Client ID + Secret

## Option 2: Google OAuth (5 minutes)

1. Go to: https://console.cloud.google.com/
2. Create/select project
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`

## After getting credentials, update .env:

```bash
# For GitHub:
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# For Google:
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

Let me know which credentials you set up and I'll help you test the authentication!