# Deployment Guide

## Prerequisites

1. **Database Setup**: Set up a PostgreSQL database (recommended: Neon.tech)
2. **Update Environment Variables**: Update `.env` with your actual database URL
3. **Push Database Schema**: Run the database setup commands

## Database Setup Steps

1. **Create your database** (using Neon, Supabase, or Railway)
2. **Update `.env` file** with your actual DATABASE_URL
3. **Generate Prisma client and push schema**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

## Google OAuth Setup for Production

Follow the instructions in `google-oauth-setup.md` to create Google OAuth credentials. For production, you will need to create a new OAuth 2.0 Client ID with the following authorized redirect URI:

`https://your-domain.com/api/auth/callback/google`

Replace `your-domain.com` with your actual production domain.

## File Uploads with Vercel Blob

This application uses Vercel Blob for file uploads. To set up Vercel Blob, you will need to create a new Blob store in your Vercel project dashboard.

1. Go to the "Storage" tab in your Vercel project.
2. Create a new Blob store.
3. Copy the `BLOB_READ_WRITE_TOKEN` and add it to your environment variables.

## Deploy to Vercel

### Method 1: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add BLOB_READ_WRITE_TOKEN
   ```
   Then paste your production values.

### Method 2: Using Vercel Dashboard

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
3. **Import your GitHub repository**
4. **Add environment variables**:
   - Go to Settings > Environment Variables
   - Add `DATABASE_URL` with your production database URL
   - Add `GOOGLE_CLIENT_ID` with your production Google Client ID
   - Add `GOOGLE_CLIENT_SECRET` with your production Google Client Secret
   - Add `BLOB_READ_WRITE_TOKEN` with your Vercel Blob token
5. **Deploy**

## Environment Variables for Production

Make sure to set these in your Vercel project:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NODE_ENV`: Set to "production" (Vercel sets this automatically)
- `EVENTBRITE_API_KEY`: Your Eventbrite API key for fetching event details
- `EVENTBRITE_ORGANIZATION_ID`: Your Eventbrite organization ID for fetching event details
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob read-write token.

## Post-Deployment

1. **Verify database connection**: Check that your app can connect to the database
2. **Test the form**: Submit a test application
3. **Check logs**: Monitor Vercel function logs for any issues

## Alternative Deployment Options

### Railway
1. Connect your GitHub repo to Railway
2. Add DATABASE_URL environment variable
3. Deploy

### AWS (using SST or Amplify)
1. Set up AWS credentials
2. Configure your deployment tool
3. Add environment variables
4. Deploy

### DigitalOcean App Platform
1. Connect your GitHub repo
2. Configure build settings
3. Add environment variables
4. Deploy

## Monitoring and Maintenance

- **Database**: Monitor your database usage and performance
- **Logs**: Check application logs regularly
- **Backups**: Ensure your database has automated backups
- **Updates**: Keep dependencies updated
