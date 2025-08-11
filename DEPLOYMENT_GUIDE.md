# Production Deployment Guide

## 🚀 **Step-by-Step Deployment**

### **Step 1: WhatsApp Group Setup**
1. **Open your IMAN WhatsApp group**
2. **Tap the group name** at the top
3. **Tap "Invite to Group via Link"**
4. **Tap "Share Link"** and copy the link
5. **Update the configuration** in `/lib/whatsapp.ts`:

```typescript
export const WHATSAPP_GROUP = {
  name: "IMAN Professional Network",
  inviteLink: "https://chat.whatsapp.com/YOUR_ACTUAL_GROUP_CODE", // Replace this!
  description: "Main community group for all IMAN members"
}
```

### **Step 2: Environment Variables**
Set these environment variables in your production environment:

```bash
# Database - Use PostgreSQL for production
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Email Service - Your Resend API key
RESEND_API_KEY="re_your_actual_resend_api_key"

# Admin Authentication - CHANGE THESE!
ADMIN_USERNAME="your_secure_admin_username"
ADMIN_PASSWORD="your_very_secure_password_123!"

# Next.js
NEXTAUTH_SECRET="your_random_32_character_secret_key"
NEXTAUTH_URL="https://yourdomain.com"
```

### **Step 3: Database Setup**
For production, switch to PostgreSQL:

1. **Update `prisma/schema.prisma`**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Run database migrations**:
```bash
npx prisma db push
npx prisma generate
```

3. **Seed initial member data** (your existing members):
```bash
npx tsx scripts/seed-production-members.ts
```

### **Step 4: Deployment Platforms**

#### **Option A: Vercel (Recommended)**
1. **Connect GitHub repo** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

#### **Option B: Railway**
1. **Connect GitHub repo** to Railway
2. **Set environment variables** in Railway dashboard
3. **Deploy with PostgreSQL addon**

#### **Option C: DigitalOcean App Platform**
1. **Create new app** from GitHub
2. **Add PostgreSQL database**
3. **Configure environment variables**

### **Step 5: DNS & Domain**
1. **Point your domain** to deployment platform
2. **Enable HTTPS** (automatic on most platforms)
3. **Update NEXTAUTH_URL** to your domain

### **Step 6: Email Configuration**
1. **Verify Resend API key** works
2. **Set up custom domain** in Resend (optional)
3. **Test email delivery**

### **Step 7: Security Configuration**
1. **Change admin credentials** from defaults
2. **Verify HTTPS** is enabled
3. **Test admin authentication**
4. **Review security logs**

## 🧪 **Testing Checklist**

After deployment, test these features:

### **Public Features**
- [ ] Main application form loads
- [ ] Form validation works
- [ ] Application submission succeeds
- [ ] Sponsor receives email with approval link
- [ ] Approval link works correctly

### **Admin Features**
- [ ] Admin login page works
- [ ] Admin authentication required
- [ ] Admin dashboard loads member data
- [ ] Application approval works
- [ ] Welcome email with WhatsApp invite sent
- [ ] Admin logout works

### **Security Features**
- [ ] Rate limiting prevents spam
- [ ] Invalid inputs rejected
- [ ] Unauthorized admin access blocked
- [ ] Security logging works

## 🔧 **Quick Setup Commands**

### **Local to Production Migration**
```bash
# 1. Update database schema for PostgreSQL
# Edit prisma/schema.prisma to use postgresql

# 2. Generate new Prisma client
npx prisma generate

# 3. Push schema to production database
npx prisma db push

# 4. Create production member data
npx tsx scripts/create-production-members.ts
```

### **Environment Variables Template**
Create `.env.production`:
```bash
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
RESEND_API_KEY="re_your_key_here"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="secure_password_123!"
NEXTAUTH_SECRET="random_32_char_secret"
NEXTAUTH_URL="https://yourdomain.com"
```

## 🚨 **Important Security Notes**

### **Before Going Live**
1. **Change admin password** from `iman-admin-2024`
2. **Use strong password** (12+ characters, mixed case, symbols)
3. **Enable HTTPS** (required for secure cookies)
4. **Test all authentication flows**
5. **Verify email delivery works**

### **After Going Live**
1. **Monitor security logs** regularly
2. **Check application submissions** for spam
3. **Review member approvals** periodically
4. **Keep admin credentials secure**
5. **Update dependencies** regularly

## 📞 **Support & Troubleshooting**

### **Common Issues**
- **Database connection**: Check DATABASE_URL format
- **Email not sending**: Verify RESEND_API_KEY
- **Admin can't login**: Check ADMIN_USERNAME/PASSWORD
- **WhatsApp invite not working**: Update invite link in code

### **Monitoring**
- Check application logs for errors
- Monitor email delivery rates
- Watch for suspicious activity patterns
- Review admin access logs

## 🎉 **You're Ready!**

Once you complete these steps:
1. **Members can apply** through your website
2. **Sponsors get email notifications** with approval links
3. **Admin can manage** applications through dashboard
4. **Approved members get** WhatsApp group invites automatically
5. **Security protections** prevent abuse and spam

Your IMAN Professional Network membership system is ready for production! 🚀
