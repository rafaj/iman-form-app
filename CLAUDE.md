# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

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

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router, TypeScript, and React 19
- **Database**: PostgreSQL with Prisma ORM (via Neon for both dev/prod)
- **Authentication**: NextAuth.js with OAuth providers (Google, Apple, GitHub)
- **UI**: Tailwind CSS with Shadcn/ui components
- **Email**: Resend service for professional email delivery
- **Security**: Multi-layer rate limiting, role-based access control

### Core Application Structure

**Main Application Flow:**
1. OAuth authentication required for all access (`/auth/signin`)
2. Authenticated home page (`app/page.tsx`) with Community Spotlight and forum post preview integration
3. Community forum (`app/forum/page.tsx`) - Hacker News-style discussion platform
4. Individual post pages (`app/forum/posts/[id]/page.tsx`) with comment system and voting
5. Membership application form (`app/apply/page.tsx`) pre-populated with user data
6. Admin dashboard (`app/admin/`) for managing members, applications, sponsors, and forum moderation (admin role required)
7. Events page (`app/events/page.tsx`) with Eventbrite integration

**Key Database Models:**
- `User` - Authenticated users with role-based access (ADMIN/MEMBER)
- `Member` - Active members who can sponsor applications
- `Application` - Membership applications with approval workflow
- `Post` - Forum posts with type (DISCUSSION/ANNOUNCEMENT/JOB_POSTING), content, voting, and engagement tracking
- `Comment` - Threaded comment system with nested replies and voting capabilities
- `PostVote/CommentVote` - User voting system for posts and comments
- `Sponsor` - Community spotlight organizations with logos/websites
- `AuditLog` - Complete audit trail for all actions
- `Account/Session` - NextAuth.js OAuth account and session management

**Security Layer (`lib/security.ts`):**
- IP-based rate limiting (3 requests/15min)
- Email-based rate limiting (2 applications/day)
- Admin rate limiting (10 actions/5min)
- Forum action rate limiting (5 edits/15min, 3 deletes/15min per user)
- User permission validation (users can only edit/delete their own posts)
- Suspicious activity detection and logging

**Authentication (`auth.ts` & `lib/auth-utils.ts`):**
- NextAuth.js with OAuth providers (Google, Apple, GitHub)
- Role-based access control (ADMIN/MEMBER)
- Middleware protection for all routes except auth pages
- Admin role checking utilities for protected operations

### API Route Structure
- **Auth APIs**: `/api/auth/` for NextAuth.js OAuth and admin checking
- **Application APIs**: `/api/applications/` for form submission and approval
- **Forum APIs**: `/api/forum/posts/` for public forum access, `/api/posts/[id]/` for user CRUD operations
- **Admin APIs**: `/api/admin/` for role-protected management functions including forum moderation
- **Security**: Rate limiting and validation on all endpoints with permission-based access control

### Key Configuration Files
- `auth.ts` - NextAuth.js configuration with OAuth providers
- `middleware.ts` - Route protection middleware
- `prisma/schema.prisma` - Database schema with PostgreSQL and user roles
- `next.config.ts` - Basic Next.js configuration
- `tsconfig.json` - TypeScript config with `@/*` path mapping

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `NEXTAUTH_SECRET` & `NEXTAUTH_URL` - NextAuth.js configuration
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth
- `APPLE_ID` & `APPLE_SECRET` - Apple OAuth (optional)
- `GITHUB_ID` & `GITHUB_SECRET` - GitHub OAuth (optional)
- `ADMIN_EMAIL` - Email address to make admin user
- `RESEND_API_KEY` - Email service API key
- `EVENTBRITE_API_KEY` & `EVENTBRITE_ORGANIZATION_ID` - Event integration

### Development Notes
- All routes protected by authentication middleware except auth pages
- Application form pre-populated with authenticated user data
- Admin access controlled by user role in database
- OAuth providers handle user registration and login automatically
- Run `npm run admin:create` with ADMIN_EMAIL set to create first admin
- Uses Prisma for type-safe database operations
- Email templates are in `lib/email.ts` with branded HTML formatting
- WhatsApp integration configured in `lib/whatsapp.ts`
- All user input is validated and sanitized through Zod schemas
- Comprehensive security logging for audit and monitoring