# IMAN Professional Network

A comprehensive professional networking platform built for the Islamic Medical Association of North America (IMAN) community. The platform features member directory, forum discussions, mentorship matching, event integration, and a comprehensive membership application system.

## 🌟 Features

### Core Platform
- **OAuth Authentication** - Google, Apple, GitHub sign-in with magic link support
- **Professional Directory** - Searchable member directory with real-time activity tracking
- **Community Forum** - Hacker News-style discussion platform with voting and comments
- **Mentorship System** - Connect mentors and mentees within the professional community
- **Event Integration** - Eventbrite integration for community events
- **Membership Applications** - Complete application workflow with sponsor approval

### Advanced Features
- **Real-time Activity Tracking** - Last seen timestamps and activity monitoring with 5-minute throttling
- **Community Spotlight** - Featured member profiles with company information
- **Mobile-Responsive Design** - Optimized layouts for all device sizes with stack navigation
- **Admin Dashboard** - Comprehensive management tools for all platform features
- **Email Notifications** - Branded email templates for all communications
- **Audit Logging** - Complete activity tracking for security and compliance

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router, TypeScript, React 19
- **Database**: PostgreSQL with Prisma ORM (Neon for hosting)
- **Authentication**: NextAuth.js with OAuth providers and database session strategy
- **UI**: Tailwind CSS with Shadcn/ui components
- **Email**: Resend service for transactional emails
- **Deployment**: Vercel with automatic deployments
- **File Storage**: Vercel Blob Storage for images and assets
- **Caching**: In-memory caching for database optimization
- **Performance**: Connection pooling and query optimization for Neon free tier

## 🏗️ Architecture

### Database Models
- **User** - Authentication and role management (ADMIN/MEMBER) with activity tracking
- **Member** - Professional profiles with qualifications and interests
- **Application** - Membership applications with approval workflow
- **Post/Comment** - Forum content with voting system
- **MentorshipRequest** - Mentor/mentee connection requests with approval workflow
- **Sponsor** - Community spotlight organizations
- **AuditLog** - Comprehensive activity tracking

### Security Features
- **Multi-layer Rate Limiting** - IP, email, and action-based limits
- **Role-based Access Control** - Admin and member permission systems
- **Input Validation** - Zod schemas for all user input
- **Audit Trail** - Complete logging of all platform activities
- **Edge Runtime Middleware** - Cookie-based authentication for optimal performance

### Performance Features
- **In-Memory Caching** - Reduces database queries by 70-80%
  - Member status checks (1-minute TTL)
  - Recent members data (10-minute TTL)
  - Forum posts (3-minute TTL)
- **Connection Pool Optimization** - Limited to 3 connections with 30s timeout
- **Query Optimization** - Optimized Prisma queries with proper includes
- **Neon Free Tier Optimized** - Configured for minimal compute usage

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- Environment variables (see below)

### Installation
```bash
# Clone repository
git clone https://github.com/rafaj/iman-form-app.git
cd iman-form-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your environment variables

# Set up database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables
```bash
# Database (with connection pooling optimization)
DATABASE_URL="postgresql://...?sslmode=require&pool_timeout=30&connection_limit=3"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_ID="your-apple-id"
APPLE_SECRET="your-apple-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# Admin Setup
ADMIN_EMAIL="admin@example.com"

# Event Integration
EVENTBRITE_API_KEY="your-eventbrite-key"
EVENTBRITE_ORGANIZATION_ID="your-org-id"

# File Storage (Production)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

## 📋 Available Scripts

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Database Operations
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio for database GUI

### Deployment
- `npm run deploy:prepare` - Full database setup for deployment
- `npm run deploy:setup` - Create production members
- `npm run deploy:verify` - Verify deployment configuration
- `npm run admin:create` - Create admin user (set ADMIN_EMAIL env var first)

## 🚨 Critical Architecture Constraints

### Edge Runtime Compatibility (middleware.ts)
- **NEVER import `@/auth` in middleware** - causes 500 MIDDLEWARE_INVOCATION_FAILED errors
- **NEVER import files with `"server-only"` directive** - incompatible with Edge Runtime
- **NEVER import Prisma or database files** - not available in Edge Runtime
- **ONLY use cookie-based authentication checking** - check for session tokens in cookies

### Server-Only Protection (Prisma & Database)
- **ALL Prisma imports MUST have `"server-only"` at top of file** - prevents client-side bundling errors
- **Files with Prisma: `auth.ts`, `lib/auth-adapter.ts`, `lib/database.ts`** - all protected with "server-only"
- **Client components MUST NOT import from `@prisma/client`** - use local enums/types instead
- **Webpack config excludes Prisma from client bundles** - configured in `next.config.ts`

### Performance Optimization (Database)
- **Use in-memory cache (`lib/cache.ts`)** for frequently accessed data
- **Connection pool limits enforced** - maximum 3 connections with 30s timeout
- **Cache TTLs configured** - 1min for auth, 3min for forum, 10min for members
- **Database URL must include pooling parameters** for Neon optimization

## 📱 Mobile Optimization

The platform is fully optimized for mobile devices with:
- **Responsive Navigation** - Mobile-friendly menu system
- **Touch-Optimized Controls** - Full-width buttons and proper spacing
- **Adaptive Layouts** - Stack layouts vertically on mobile
- **Shortened Text** - Context-aware text truncation for small screens
- **Directory Filter Buttons** - Stack vertically on mobile to prevent horizontal scrolling

## 🔐 Security Features

### Authentication & Authorization
- OAuth integration with major providers
- Magic link email authentication
- Role-based access control (Admin/Member)
- Session management with secure cookies
- Database session strategy with Prisma adapter

### Rate Limiting
- IP-based: 3 requests per 15 minutes
- Email-based: 2 applications per day
- Admin actions: 10 actions per 5 minutes
- Forum actions: 5 edits/3 deletes per 15 minutes

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with Prisma
- XSS protection with proper sanitization
- Comprehensive audit logging

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build application
npm run build

# Set up production database
npm run deploy:prepare

# Create admin user
ADMIN_EMAIL="admin@example.com" npm run admin:create

# Start production server
npm run start
```

## 🧪 Testing

### Development Testing
- Run `npm run dev` and test locally
- Use Prisma Studio to inspect database
- Check browser console for any errors

### Production Testing
- Verify all OAuth providers work
- Test email delivery
- Confirm mobile responsiveness
- Validate admin functions

## 📚 API Documentation

### Public APIs
- `GET /api/directory` - Member directory
- `GET /api/forum/posts` - Forum posts
- `POST /api/applications` - Submit application
- `GET /api/mentorship/browse` - Browse available mentors

### Member APIs (Authentication Required)
- `POST /api/mentorship/request` - Send mentorship request
- `GET /api/mentorship/requests` - View mentorship requests
- `POST /api/mentorship/respond` - Respond to mentorship request

### Admin APIs (Authentication Required)
- `GET /api/admin/members` - Member management
- `DELETE /api/admin/posts/[id]` - Content moderation
- `POST /api/admin/cleanup-database` - Database maintenance

### Authentication APIs
- `GET /api/auth/check-admin` - Role verification
- `POST /api/auth/update-activity` - Activity tracking (5-minute throttling)

## 🏗️ Key System Components

### Authentication System
- **NextAuth.js Configuration** (`auth.ts`) - Server-only with Prisma adapter
- **Edge-Compatible Middleware** (`middleware.ts`) - Cookie-based authentication
- **Activity Tracking** (`/api/auth/update-activity`) - Client-side activity updates

### Frontend Components
- **Activity Tracker** (`components/activity-tracker.tsx`) - Global activity monitoring
- **Welcome Professionals** (`components/welcome-professionals.tsx`) - Modal-based user profiles
- **Mobile Navigation** (`components/mobile-navigation.tsx`) - Responsive navigation

### Database Layer
- **Server-Only Protection** - All Prisma imports protected with "server-only"
- **Client-Side Exclusion** - Webpack configuration prevents client bundling
- **Activity Tracking** - lastSeenAt field with 5-minute update throttling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the architecture constraints (especially server-only rules)
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for the Islamic Medical Association of North America (IMAN).

## 🆘 Support

For technical issues or questions:
- Check the CLAUDE.md file for development guidance
- Review the architecture constraints
- Contact the development team

---

**Built with ❤️ for the IMAN Professional Community**