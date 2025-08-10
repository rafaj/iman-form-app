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
   ```
   Then paste your production database URL.

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
5. **Deploy**

## Environment Variables for Production

Make sure to set these in your Vercel project:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NODE_ENV`: Set to "production" (Vercel sets this automatically)

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
