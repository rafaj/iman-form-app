# IMAN Professional Network - Deployment Guide

This guide provides step-by-step instructions for deploying the IMAN Professional Network platform to production.

## 🚨 Critical Prerequisites

Before beginning deployment, ensure you understand these critical architecture constraints:

### Edge Runtime Compatibility
- **NEVER import `@/auth` in middleware** - causes 500 MIDDLEWARE_INVOCATION_FAILED errors
- **NEVER import files with `"server-only"` directive** in middleware or client components
- The current middleware uses cookie-based authentication and must remain this way

### Server-Only Protection
- All files importing from `@prisma/client` MUST have `"server-only"` directive
- Client components MUST use local enums instead of Prisma types
- Webpack configuration automatically excludes Prisma from client bundles

## 🎯 Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments.

#### Step 1: Repository Setup
```bash
# Push your code to GitHub
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

#### Step 2: Vercel Configuration
1. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project" and import your repository
   - Select the repository: `iman-form-app`

2. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install`

#### Step 3: Environment Variables
Add these environment variables in the Vercel dashboard:

**Required Variables:**
```bash
# Database
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require

# NextAuth Configuration
NEXTAUTH_SECRET=your-production-secret-32-chars-minimum
NEXTAUTH_URL=https://your-domain.vercel.app

# Email Service
RESEND_API_KEY=re_your_resend_api_key

# Admin Setup
ADMIN_EMAIL=your-admin@email.com

# File Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token_here
```

**Optional OAuth Providers:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
APPLE_ID=your-apple-id
APPLE_SECRET=your-apple-secret

# GitHub OAuth
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Event Integration
EVENTBRITE_API_KEY=your-eventbrite-key
EVENTBRITE_ORGANIZATION_ID=your-org-id
```

#### Step 4: Deploy
1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete (usually 2-3 minutes)
3. Verify deployment at the provided URL

### Option 2: Manual Server Deployment

For VPS or dedicated server deployment:

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install PostgreSQL (or use managed service)
sudo apt-get install postgresql postgresql-contrib
```

#### Step 2: Application Setup
```bash
# Clone repository
git clone https://github.com/your-username/iman-form-app.git
cd iman-form-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your production values

# Build application
npm run build

# Set up database
npm run deploy:prepare

# Create admin user
npm run admin:create
```

#### Step 3: Process Management
```bash
# Start with PM2
pm2 start npm --name "iman-app" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🗄️ Database Setup

### Option 1: Neon (Recommended)

Neon provides serverless PostgreSQL with automatic scaling.

1. **Create Account**
   - Visit [neon.tech](https://neon.tech) and sign up
   - Create a new project: "IMAN Professional Network"

2. **Get Connection String**
   - Copy the connection string from your Neon dashboard
   - Use it as your `DATABASE_URL`

3. **Initialize Database**
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

### Option 2: Managed PostgreSQL

For providers like DigitalOcean, AWS RDS, or Google Cloud SQL:

1. Create PostgreSQL instance (minimum: 1GB RAM, 10GB storage)
2. Note connection details (host, port, database, username, password)
3. Construct connection string:
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

## 📧 Email Service Setup

### Resend Configuration

1. **Create Account**
   - Visit [resend.com](https://resend.com) and sign up
   - Verify your email address

2. **Get API Key**
   - Go to API Keys section
   - Create new key: "IMAN Professional Network"
   - Copy the key (starts with `re_`)

3. **Domain Setup (Optional)**
   - Add your domain in Domains section
   - Configure DNS records for better deliverability
   - Verify domain ownership

## 🔐 Authentication Setup

### NextAuth Configuration

1. **Generate Secret**
   ```bash
   openssl rand -base64 32
   ```
   Use output as `NEXTAUTH_SECRET`

2. **OAuth Providers (Optional)**

   **Google OAuth:**
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create project and enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized origins: `https://your-domain.com`
   - Add redirect URIs: `https://your-domain.com/api/auth/callback/google`

   **GitHub OAuth:**
   - Visit GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set callback URL: `https://your-domain.com/api/auth/callback/github`

## 🎯 Post-Deployment Setup

### Step 1: Verify Deployment
```bash
# Check all endpoints are working
curl https://your-domain.com/api/health
curl https://your-domain.com/api/auth/providers

# Test database connection
npm run deploy:verify
```

### Step 2: Create Admin User
```bash
# Set admin email and create user
ADMIN_EMAIL="admin@yourdomain.com" npm run admin:create
```

### Step 3: Test Core Features

1. **Authentication Test**
   - Visit `/auth/signin`
   - Test magic link authentication
   - Test OAuth providers (if configured)

2. **Application Flow Test**
   - Submit test application
   - Check sponsor email delivery
   - Test approval process

3. **Admin Dashboard Test**
   - Login to `/admin`
   - Verify member management
   - Test forum moderation

## 🔧 Production Optimizations

### Performance Settings

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

2. **Build Optimizations**
   ```bash
   # Enable static optimization
   npm run build
   
   # Analyze bundle size
   npm install -g @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

### Security Hardening

1. **HTTPS Configuration**
   - Use SSL certificate (Let's Encrypt recommended)
   - Enable HSTS headers
   - Configure secure cookie settings

2. **Rate Limiting**
   - Current limits are optimized for production
   - Monitor logs for abuse patterns
   - Adjust limits if needed in `lib/security.ts`

### Monitoring Setup

1. **Health Checks**
   ```bash
   # Add to cron for monitoring
   */5 * * * * curl -f https://your-domain.com/api/health || alert
   ```

2. **Log Monitoring**
   - Monitor Vercel function logs
   - Set up alerts for 500 errors
   - Track rate limit violations

## 🚨 Troubleshooting

### Common Issues

1. **500 MIDDLEWARE_INVOCATION_FAILED**
   - Check middleware doesn't import server-only files
   - Verify cookie-based authentication is used
   - Ensure no Prisma imports in middleware

2. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check SSL mode requirement
   - Test connection manually

3. **Email Delivery Issues**
   - Verify Resend API key
   - Check domain configuration
   - Test with different email providers

4. **Build Failures**
   - Check TypeScript errors
   - Verify environment variables
   - Review dependency versions

### Debug Commands
```bash
# Check database connection
npm run db:studio

# Test email service
npm run test:email

# Verify environment
npm run deploy:verify

# Check build output
npm run build -- --debug
```

## 📊 Monitoring & Maintenance

### Regular Tasks

1. **Weekly**
   - Check application logs
   - Monitor database performance
   - Review security alerts

2. **Monthly**
   - Update dependencies
   - Review user feedback
   - Optimize database queries

3. **Quarterly**
   - Security audit
   - Performance review
   - Backup verification

### Backup Strategy

1. **Database Backups**
   - Neon provides automatic backups
   - Configure retention period
   - Test restore process

2. **Application Backups**
   - Code is in Git repository
   - Document configuration changes
   - Maintain environment variable backup

## 🔄 Updates & Deployments

### Continuous Deployment

1. **Vercel (Automatic)**
   - Push to main branch triggers deployment
   - Preview deployments for feature branches
   - Automatic rollback on errors

2. **Manual Updates**
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Install new dependencies
   npm install
   
   # Run database migrations
   npm run db:migrate
   
   # Restart application
   pm2 restart iman-app
   ```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration-name

# Deploy migration
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## ✅ Production Checklist

Before going live:

- [ ] **Environment variables** - All required variables set
- [ ] **Database** - Connected and seeded with initial data
- [ ] **Email service** - Resend configured and tested
- [ ] **Authentication** - Magic links and OAuth working
- [ ] **Admin access** - Admin user created and tested
- [ ] **SSL certificate** - HTTPS enabled and working
- [ ] **Domain** - Custom domain configured (if applicable)
- [ ] **Monitoring** - Health checks and logging set up
- [ ] **Backups** - Database backup strategy implemented
- [ ] **Documentation** - Team trained on admin functions
- [ ] **Testing** - All core features verified in production
- [ ] **Mobile optimization** - Directory buttons stack correctly on mobile
- [ ] **Activity tracking** - Real-time user activity working
- [ ] **Critical constraints** - Middleware remains Edge Runtime compatible

## 📞 Support

For deployment issues:
- Check logs first (Vercel dashboard or server logs)
- Verify environment variables
- Test database connection
- Review the critical architecture constraints in CLAUDE.md
- Contact technical support if needed

---

**Deployment completed successfully! Your IMAN Professional Network is ready to serve the community.** 🚀
