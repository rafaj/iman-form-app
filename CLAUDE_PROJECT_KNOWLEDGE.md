# IMAN Backend Project Knowledge Base
*Auto-generated documentation for future Claude Code sessions*

## Project Overview
This is the **backend web application** for IMAN Professional Network - a Next.js app serving both web interface and mobile API endpoints.

## Key Locations

### **Project Root**
- **Path**: `/Users/jafar/Code/iman-form-app/`
- **Repository**: `https://github.com/rafaj/iman-form-app`
- **Live URL**: `https://iman-form-app.vercel.app`
- **Auto-Deploy**: GitHub main branch → Vercel

### **Important Directories**
- `app/` - Next.js 13+ app router pages and API routes
- `app/api/` - Backend API endpoints
- `app/api/mobile/` - Mobile-specific API endpoints
- `components/` - Reusable React components
- `lib/` - Utility functions and services
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## Mobile App Integration

### **iOS App Location**
- **Companion iOS App**: `/Users/jafar/Code/iman-ios-app/ImanApp/`
- **Authentication Flow**: iOS app ↔ This backend via magic links
- **API Communication**: iOS app calls `/api/mobile/*` endpoints

### **Magic Link Authentication System**
**Recent Fix Applied**: Resolved "address is invalid" error in mobile magic links

**Flow**:
1. iOS app sends: `POST /api/auth/send-magic-link`
   ```json
   {
     "to": "user@email.com", 
     "redirectUrl": "iman-auth://auth",
     "callbackUrl": "/"
   }
   ```

2. Backend generates secure token and emails link to `/mobile-auth`

3. `/mobile-auth` page detects mobile device and creates deep link:
   ```
   iman-auth://auth?token=SECURE_TOKEN&email=user@email.com
   ```

4. Deep link opens iOS app for authentication

## API Architecture

### **Mobile Endpoints** (`/api/mobile/`)
- `directory/` - Member directory with professional info
- `events/` - Community events and workshops  
- `forum/` - Forum posts and comments
- `mentorship/` - Mentor/mentee requests and matching

### **Authentication** (`/api/auth/`)
- `send-magic-link/` - Passwordless authentication via email
- `[...nextauth]/` - NextAuth.js configuration
- `callback/resend` - Magic link token validation

### **Admin Endpoints** (`/api/admin/`)
- Various admin functionality for content management

## Database
- **Provider**: PostgreSQL via Neon
- **ORM**: Prisma
- **Schema**: `/prisma/schema.prisma`
- **Auto-migration**: Runs on deployment

## Environment Configuration
```bash
# Key environment variables
NEXTAUTH_URL=https://iman-form-app.vercel.app
RESEND_API_KEY=re_xxx  # Email service
DATABASE_URL=postgresql://xxx  # Neon PostgreSQL
```

## Recent Changes (Latest Session)

### **Files Modified**:
1. **`app/api/auth/send-magic-link/route.ts`**
   - Added support for mobile app request format
   - Generate secure crypto tokens (vs PLACEHOLDER)
   - Maintained backward compatibility

2. **`app/mobile-auth/page.tsx`**
   - Fixed deep link scheme: `iman-auth://auth` (vs authenticate)
   - Mobile device detection and app launching

### **Deployment Status**
- ✅ **Successfully deployed** after fixing ESLint error
- ✅ **Auto-deployment working** from GitHub
- ✅ **Magic links now functional** for iOS app

## Development Workflow

### **Local Development**
```bash
cd /Users/jafar/Code/iman-form-app
npm run dev  # Start development server
npm run build  # Test production build
```

### **Deployment**
```bash
git add .
git commit -m "description"
git push  # Auto-deploys to Vercel
```

### **Database Changes**
```bash
npx prisma db push  # Push schema changes
npx prisma generate  # Regenerate client
```

## Technology Stack
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js + Magic Links
- **Email**: Resend API
- **Deployment**: Vercel
- **Repository**: GitHub

## Key Features
1. **Member Directory** - Professional networking profiles
2. **Community Forum** - Discussion posts and comments
3. **Event Management** - Workshop and meetup listings
4. **Mentorship Platform** - Mentor/mentee matching system
5. **Admin Dashboard** - Content and member management
6. **Mobile API** - iOS app backend services

## Troubleshooting

### **Build Errors**
- Run `npm run build` locally to catch TypeScript/ESLint issues
- Check unused variables (recent fix: removed unused `redirectUrl`)

### **Mobile Integration Issues**
- Verify magic link generation in `/api/auth/send-magic-link/`
- Test deep link creation in `/mobile-auth`
- Check iOS app URL schemes match backend expectations

### **Database Issues**
- Check Prisma schema for model definitions
- Verify environment variables for database connection
- Use `npx prisma studio` for database inspection

---
*Last Updated: September 10, 2025*
*Backend companion to iOS app at `/Users/jafar/Code/iman-ios-app/ImanApp/`*