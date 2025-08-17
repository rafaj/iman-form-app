# OAuth Setup Instructions

## Update these lines in .env.local:

```bash
# Replace these lines:
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# With your actual Google OAuth credentials from Google Cloud Console
```

## Optional: GitHub OAuth (for additional login option)

1. Go to GitHub.com → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Application name: "IMAN Network Local"
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Click "Register application"
7. Copy Client ID and generate Client Secret

```bash
# Add to .env.local:
GITHUB_ID="your_github_client_id" 
GITHUB_SECRET="your_github_client_secret"
```