# Environment Setup Instructions

## 1. Update .env.local with your Neon database URL:

```bash
# Replace this line in .env.local:
DATABASE_URL="postgresql://username:password@ep-host.neon.tech/database?sslmode=require"

# With your actual Neon connection string from the dashboard
```

## 2. Set your admin email:

```bash
# Replace this line in .env.local:
ADMIN_EMAIL="your-email@example.com"

# With your actual email address (the one you'll use to sign in)
```

## 3. After updating .env.local, run these commands:

```bash
npm run db:push
npm run admin:create
```

Let me know when you've updated the DATABASE_URL and ADMIN_EMAIL in .env.local!