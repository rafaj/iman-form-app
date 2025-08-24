# IMAN Professional Network - Complete Community Platform

<!-- Deployment trigger: Environment variables updated -->

A comprehensive, secure community platform for the IMAN Professional Network, featuring membership management, professional networking, community discussions, and event coordination. Built with Next.js 15, TypeScript, and enterprise-level security practices.

## 🌟 **Features Overview**

### **🎯 Core Functionality**
- **Professional Application Form** - Clean, user-friendly membership application interface with sponsor-based approval
- **Dual Authentication System** - Magic link email authentication + Google OAuth for maximum accessibility
- **Professional Directory** - Complete member directory with employer view and recently joined professionals
- **Community Forum System** - Hacker News-style discussion platform with posts, comments, and voting
- **Welcome New Professionals** - Homepage spotlight showcasing newest network members
- **Weekly Meetup Integration** - Eventbrite-powered event management with responsive displays
- **Mentorship System** - Connect professionals for guidance and career development
- **Community Spotlight** - Highlighting key community members and partner organizations
- **Advanced Post Management** - Users can create, edit, and delete their own posts with real-time updates
- **Admin Forum Controls** - Comprehensive forum moderation with bulk post management capabilities
- **Automated Email Workflows** - Sponsors receive approval requests, welcome emails via Resend
- **WhatsApp Community Integration** - Automatic group invites for approved members
- **Comprehensive Admin Dashboard** - Full member, application, forum, and sponsor management

### **🔐 Enterprise Security Features**
- **Multi-Layer Rate Limiting** - IP-based (3/15min), email-based (2/day), admin-specific (10/5min), forum actions (5 edits/15min, 3 deletes/15min)
- **Advanced Input Validation** - Comprehensive data validation and sanitization with Zod
- **Forum Content Protection** - Users can only edit/delete their own posts with permission validation
- **Suspicious Activity Detection** - Automated pattern recognition and security logging
- **Session-Based Admin Authentication** - Secure HTTP-only cookies with 24-hour expiration
- **CSRF Protection** - SameSite cookies and secure session management
- **Cryptographic Security** - Secure verification codes and UUID token generation
- **Comprehensive Security Logging** - Full audit trail with IP tracking and user agent monitoring

### **📧 Professional Email & Authentication System**
- **Magic Link Authentication** - Secure, password-free sign-in with any email address
- **Multi-Provider OAuth** - Google authentication for quick access
- **Universal Email Support** - Works with Gmail, Outlook, work emails, any provider
- **Resend Integration** - Enterprise email delivery service with high deliverability
- **Branded Email Templates** - Professional HTML templates with IMAN styling
- **Automated Workflows** - Sponsor notifications, welcome emails, magic link delivery
- **Email Delivery Monitoring** - Success/failure tracking and error handling

### **👥 Advanced Professional Network Management**
- **Professional Directory** - Comprehensive member profiles with employer information
- **Multiple Directory Views** - Alphabetical, by employer, and recently joined sorting
- **New Member Spotlight** - Homepage showcase of recently joined professionals
- **Sponsor Verification** - Only active members can sponsor new applicants
- **Complete Application History** - Full audit trail of all membership applications
- **Multi-Status Management** - Pending, approved, rejected, expired application states
- **Admin Bulk Operations** - Efficient tools for member and application management

### **💬 Community Forum System**
- **Hacker News-Style Interface** - Modern discussion platform with voting and threaded comments
- **Multiple Post Types** - Support for Discussions, Announcements, and Job Postings
- **User Post Management** - Members can create, edit, and delete their own posts
- **Admin Moderation Tools** - Complete forum management with bulk post operations
- **Real-Time Updates** - Live post feeds with engagement metrics and time tracking
- **Integrated Navigation** - Seamless connection between homepage and forum sections
- **Mobile-Optimized Design** - Full forum functionality across all devices

### **📅 Weekly Meetup System**
- **Eventbrite Integration** - Automated fetching of upcoming IMAN meetups
- **Responsive Event Display** - Beautiful event cards with images and details
- **Registration Links** - Direct links to Eventbrite registration
- **Event Details** - Date, time, location, and description display
- **Mobile-Optimized** - Perfect meetup browsing on all devices
- **Homepage Integration** - Featured upcoming meetups on main page

### **📱 WhatsApp Community Integration**
- **Automatic Group Invites** - Seamless onboarding to IMAN community group
- **Professional Welcome Messages** - Branded email templates with group access links
- **Configurable Group Management** - Easy invite link updates and administration
- **Community Onboarding** - Streamlined process from approval to group membership

### **🤝 Mentorship System**
- **Find Mentors & Mentees** - Browse profiles of members available for mentorship or seeking guidance.
- **Detailed Profiles** - Members can specify their mentorship offerings and needs in their profiles.
- **Facilitated Connections** - While direct connection buttons have been removed to encourage more thoughtful interactions, users can easily access member profiles and contact information to connect.

## 🛠️ **Technology Stack**

### **Frontend Technologies**
- **Next.js 15** - Latest React framework with App Router and server components
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework for consistent styling
- **Shadcn/ui** - Modern, accessible component library
- **React Hook Form** - Performant form handling with validation
- **Lucide Icons** - Professional icon set for consistent UI

### **Backend & API**
- **Next.js API Routes** - Serverless API endpoints with TypeScript
- **NextAuth.js** - Authentication with magic links and OAuth providers
- **Resend Email Provider** - Secure magic link delivery for authentication
- **Prisma ORM** - Type-safe database operations and schema management
- **Zod Validation** - Runtime type validation and data sanitization
- **Custom Security Middleware** - Rate limiting, authentication, and protection layers

### **Database & Storage**
- **PostgreSQL** - Robust relational database via Neon serverless (development and production)
- **Prisma Schema** - Type-safe database modeling and automated migrations
- **Vercel Blob** - For file uploads and storage.

### **External Services**
- **Resend** - Professional email delivery service with high deliverability rates
- **Neon** - Serverless PostgreSQL hosting with automatic scaling
- **Vercel** - Recommended deployment platform with automatic CI/CD
- **Eventbrite** - Event management and ticketing platform for event details

### **Security Infrastructure**
- **Session-Based Authentication** - Secure admin access with HTTP-only cookies
- **Multi-Layer Rate Limiting** - IP, email, and admin-specific abuse prevention
- **Comprehensive Input Validation** - XSS and injection attack prevention
- **Security Event Logging** - Real-time monitoring and incident response

## 🚀 **Quick Start Guide**

### **Prerequisites**
- **Node.js 18+** and npm package manager
- **PostgreSQL database** (Neon recommended for both development and production)
- **Resend API key** for email delivery service
- **Eventbrite API Key and Organization ID** for fetching event details
- **WhatsApp group** for member community invitations
- **Google OAuth Credentials** (optional) for quick authentication

### **Development Setup**
```bash
# Clone the repository
git clone https://github.com/your-username/iman-form-app.git
cd iman-form-app

# Install all dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Neon PostgreSQL DATABASE_URL and other config

# Use the setup scripts for a streamlined experience
./github-setup.sh
./run-after-setup.sh

# Initialize database and generate Prisma client
npm run db:push
npm run db:generate

# Seed with sample data for development
npm run db:seed

# Start development server with hot reload
npm run dev
```

### **Dual Authentication System**
This application uses NextAuth.js with dual authentication options:

**Magic Link Authentication (Primary):**
- Works with any email address (Gmail, Outlook, work emails, etc.)
- Secure, password-free authentication via email links
- Powered by Resend email service

**Google OAuth (Optional):**
- Quick sign-in for users with Google accounts
- Setup instructions in `google-oauth-setup.md` file

### **Environment Configuration**
```bash
# Database Connection
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

# Email Service (Get from https://resend.com)
RESEND_API_KEY="re_your_resend_api_key_here"

# Eventbrite API (Get from https://www.eventbrite.com/platform/api)
EVENTBRITE_API_KEY="YOUR_EVENTBRITE_API_KEY"
EVENTBRITE_ORGANIZATION_ID="YOUR_EVENTBRITE_ORGANIZATION_ID"

# Admin Authentication (Change for production!)
ADMIN_USERNAME="your_secure_admin_username"
ADMIN_PASSWORD="your_very_secure_password_123!"

# Next.js Configuration
NEXTAUTH_SECRET="your_random_32_character_secret_key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

## 📋 **User Workflows**

### **New Professional Journey**
1. **Visit Application Form** - Professional interface at your domain
2. **Complete Membership Details** - Personal info, qualifications, sponsor email
3. **Submit Application** - Automatic validation and sponsor notification
4. **Await Sponsor Approval** - Sponsor receives email with approval link
5. **Receive Welcome Email** - Automatic WhatsApp group invite upon approval
6. **Sign In** - Use magic link or Google OAuth to access platform
7. **Welcome Spotlight** - Featured in "Welcome New Professionals at IMAN" section

### **Sponsor Approval Process**
1. **Receive Email Notification** - When listed as sponsor by applicant
2. **Click Secure Approval Link** - Unique, time-limited approval URL
3. **Verify Identity** - Member email, ID, and verification code required
4. **Approve or Decline** - One-click decision with automatic notifications
5. **Automatic Processing** - Welcome email sent to approved applicants

### **Professional Member Experience**
1. **Flexible Sign-In** - Use magic link email or Google OAuth
2. **Welcome Dashboard** - View new professionals, upcoming meetups, forum activity
3. **Professional Directory** - Browse all members, search by employer, view recently joined
4. **Weekly Meetups** - View and register for Thursday meetups at IMAN Center
5. **Community Forum** - Participate in discussions, announcements, job postings
6. **Mentorship Network** - Connect with mentors and mentees in your field
7. **Manage Profile** - Update professional information and contact details

### **Mentorship Journey**
1. **Discover Mentors/Mentees** - Navigate to the `/mentorship` page to browse member profiles.
2. **Filter and Search** - Find suitable mentors or mentees based on professional qualifications, industry, or mentorship goals.
3. **Review Profiles** - View detailed profiles to learn more about a member's experience and what they're looking for in a mentorship relationship.
4. **Initiate Contact** - Reach out to potential mentors or mentees using the contact information on their profile.

### **Administrator Management**
1. **Secure Admin Access** - Login at `/admin` with session authentication
2. **Dashboard Overview** - Complete member, application, and forum statistics
3. **Review Applications** - Detailed applicant profiles and sponsor information
4. **Moderate Forum Content** - Manage all forum posts with delete capabilities
5. **One-Click Actions** - Approve/reject with automatic email notifications
6. **Security Monitoring** - Real-time activity logs and suspicious pattern alerts

## 🔐 **Comprehensive Security Features**

### **Multi-Layer Rate Limiting**
- **IP-Based Protection**: 3 applications per 15 minutes per IP address
- **Email-Based Limits**: 2 applications per day per email address
- **Admin Rate Limiting**: 10 approval actions per 5 minutes
- **Automatic Cleanup**: Expired rate limit entries automatically removed

### **Advanced Input Protection**
- **Email Validation**: Format validation with length and domain checks
- **Name Validation**: Letters, spaces, hyphens, apostrophes only
- **Input Sanitization**: All user input sanitized and length-limited
- **URL Validation**: LinkedIn profile URL format verification
- **Disposable Email Detection**: Blocks temporary email services

### **Suspicious Activity Detection**
- **Disposable Email Monitoring**: Automatic detection of temporary email services
- **Domain Analysis**: Same domain applicant/sponsor relationship detection
- **Response Quality**: Short response detection (< 10 characters)
- **Spam Pattern Recognition**: Repeated character and pattern detection
- **Comprehensive Logging**: All suspicious patterns logged for admin review

### **Admin Security Infrastructure**
- **Session-Based Authentication**: Secure HTTP-only cookies with encryption
- **24-Hour Session Expiration**: Automatic logout for security
- **Brute Force Protection**: Progressive delays for failed login attempts
- **CSRF Protection**: SameSite cookies prevent cross-site attacks
- **Secure Logout**: Complete session clearing and cookie removal

### **Data Protection Measures**
- **Email Masking**: Sensitive data masked in admin interfaces
- **No Client-Side Secrets**: All sensitive data server-side only
- **Secure Database Connections**: Encrypted connections with SSL/TLS
- **Input Sanitization**: All user data sanitized before storage

## 📊 **Admin Dashboard Features**

### **Member Management System**
- **Active Member Directory**: Complete list of members who can sponsor
- **Member Profile Details**: Contact information and membership status
- **Sponsorship Activity**: History of sponsored applications and approvals
- **Member Status Controls**: Activate/deactivate member sponsorship abilities

### **Application Review Interface**
- **Pending Application Queue**: All applications awaiting review
- **Detailed Applicant Profiles**: Complete submitted information and qualifications
- **One-Click Approval System**: Instant approve/reject with automatic notifications
- **Application Status Tracking**: Complete history and current status
- **Bulk Management Tools**: Efficient handling of multiple applications

### **Forum Management Dashboard**
- **Complete Post Overview**: View all forum posts with author, type, and engagement metrics
- **Bulk Moderation Tools**: Delete inappropriate posts with confirmation dialogs
- **Post Analytics**: Track comment counts, vote scores, and post creation dates
- **Content Organization**: Filter posts by type (Discussion, Announcement, Job Posting)
- **Author Management**: View post authors with email addresses and user details

### **Member Spotlight and Sponsors**
- **Member Spotlight**: Feature and manage members in a dedicated spotlight section.
- **Sponsors**: Manage and display sponsors of the organization.
- **File Uploads**: Upload logos for sponsors and images for member spotlights.

### **Security Monitoring Dashboard**
- **Real-Time Security Logs**: Live feed of all security events
- **Rate Limit Violation Alerts**: Immediate notification of abuse attempts
- **Suspicious Activity Patterns**: Automated detection and alerting
- **Admin Action Audit Trail**: Complete log of all administrative actions
- **IP and User Agent Tracking**: Detailed request information for security analysis

## 🎨 **Professional Design & UX**

### **IMAN Brand Integration**
- **Emerald Color Scheme**: Consistent IMAN branding throughout application
- **Professional Typography**: Clean, readable fonts with proper hierarchy
- **Branded Email Templates**: Professional HTML emails with IMAN styling
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility Compliance**: WCAG guidelines with proper ARIA labels

### **User Experience Excellence**
- **Intuitive Application Flow**: Clear, step-by-step application process
- **Real-Time Validation**: Immediate feedback on form inputs
- **Loading States**: Professional loading indicators and progress feedback
- **Toast Notifications**: Success/error messages with clear communication
- **Mobile Optimization**: Full functionality on all screen sizes

## 🔧 **Development Architecture**

### **Project Structure**
```
iman-form-app/
├── app/                    # Next.js App Router pages and layouts
│   ├── admin/             # Admin dashboard and authentication
│   ├── api/               # API routes and endpoints
│   ├── approve/           # Sponsor approval interface
│   └── globals.css        # Global styles and Tailwind imports
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui component library
├── lib/                   # Utility functions and configurations
│   ├── admin-auth.ts     # Admin authentication system
│   ├── database.ts       # Prisma client and database utilities
│   ├── email.ts          # Resend email service integration
│   ├── security.ts       # Security utilities and rate limiting
│   └── whatsapp.ts       # WhatsApp group configuration
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema definition
│   └── seed.ts           # Database seeding scripts
├── scripts/              # Deployment and maintenance scripts
└── docs/                 # Comprehensive documentation
```

### **Key System Components**
- **Homepage** (`app/page.tsx`) - Main dashboard with new professional spotlight, meetups, forum preview
- **Professional Directory** (`app/directory/page.tsx`) - Complete member directory with multiple view modes
- **Meetups Page** (`app/events/page.tsx`) - Weekly meetup listings with Eventbrite integration
- **Community Forum** (`app/forum/page.tsx`) - Hacker News-style discussion platform
- **Individual Posts** (`app/forum/posts/[id]/page.tsx`) - Detailed post view with comments and interactions
- **Authentication System** (`app/auth/signin/page.tsx`) - Magic link + Google OAuth sign-in
- **Admin Dashboard** (`app/admin/page.tsx`) - Complete management system with forum moderation
- **Application Form** (embedded in homepage) - Professional membership application interface
- **Forum APIs** (`app/api/posts/`, `app/api/admin/posts/`) - RESTful endpoints for post CRUD operations
- **Directory APIs** (`app/api/directory/`) - Professional directory and search functionality
- **Security Layer** (`lib/security.ts`) - Rate limiting and protection utilities
- **Email Service** (`lib/email.ts`) - Resend integration with magic links and templates
- **Authentication** (`auth.ts`) - NextAuth.js configuration with dual auth providers

### **Database Schema Design**
- **Members Table** - Active members with sponsorship capabilities
- **Applications Table** - Complete membership applications with full details
- **Forum Tables** - Complete forum system with posts, comments, votes, and user relationships
  - **Posts** - Forum posts with type, content, voting, and author relationships
  - **Comments** - Threaded comment system with nested replies and voting
  - **Votes** - Post and comment voting system with user tracking
- **Users Table** - OAuth user accounts with role-based access (ADMIN/MEMBER)
- **Audit Trail** - Comprehensive history of all system actions and changes
- **Sponsor Table** - Stores information about sponsors and member spotlights

### **API Endpoint Architecture**
- **Public APIs**: Application submission, sponsor approval, and forum access
- **Forum APIs**: Post CRUD operations with user permission validation
  - `GET /api/forum/posts` - List all forum posts with filtering and sorting
  - `POST /api/posts` - Create new posts (authenticated users only)
  - `PATCH /api/posts/[id]` - Edit user's own posts with validation
  - `DELETE /api/posts/[id]` - Delete user's own posts with confirmation
- **Admin APIs**: Enhanced management with forum moderation capabilities
  - `GET /api/admin/posts` - List all posts for admin moderation
  - `DELETE /api/admin/posts/[id]` - Admin delete any post with audit logging
- **Security APIs**: Authentication, logout, and session management
- **Data APIs**: Member and application management with proper authorization

### **Environment-Specific Middleware**
The application uses different middleware for development and production.
- `middleware.dev.ts`: Used for local development.
- `middleware.prod.ts`: Used for production deployments.
The `middleware.ts` file dynamically selects the appropriate middleware based on the `NODE_ENV` environment variable.

## 🚀 **Production Deployment**

### **Deployment Platforms**
- **Vercel (Recommended)** - Automatic deployments with PostgreSQL integration
- **Railway** - Full-stack deployment with managed database services
- **DigitalOcean App Platform** - Scalable hosting with managed PostgreSQL

### **Production Configuration**
1. **Environment Variables** - Secure configuration for production
2. **PostgreSQL Database** - Neon serverless PostgreSQL recommended
3. **Resend Email Service** - Professional email delivery setup
4. **WhatsApp Group Integration** - Community group invite configuration
5. **Admin Security** - Strong credentials and session configuration
6. **Google OAuth Credentials** - Production Google OAuth credentials.

### **Automated Deployment Scripts**
```bash
npm run deploy:prepare    # Database setup and Prisma client generation
npm run deploy:setup      # Production member data creation
npm run deploy:verify     # Complete deployment configuration verification
```

### **Production Checklist**
- ✅ **Environment variables** configured securely
- ✅ **PostgreSQL database** set up with proper credentials
- ✅ **Resend API key** configured and tested
- ✅ **Admin credentials** changed from defaults
- ✅ **WhatsApp group link** updated in configuration
- ✅ **Google OAuth credentials** configured for production.
- ✅ **HTTPS enabled** for secure cookie operation
- ✅ **Domain configured** with proper DNS settings

## 📚 **Comprehensive Documentation**

- **DEPLOYMENT_GUIDE.md** - Step-by-step production deployment instructions
- **SECURITY_ANALYSIS.md** - Complete security features and risk assessment
- **ADMIN_SECURITY.md** - Admin authentication and session management
- **google-oauth-setup.md** - Instructions for setting up Google OAuth.
- **.env.example** - Environment variable template with descriptions

## 🎯 **System Capabilities**

### **Enterprise-Level Features**
- **Scalable Architecture** - Built to handle growing membership
- **Security-First Design** - Multiple protection layers against attacks
- **Professional User Experience** - Modern, intuitive interface design
- **Automated Workflows** - Reduces manual administration overhead
- **Comprehensive Monitoring** - Full audit trail and security logging

### **Production-Ready Infrastructure**
- **High Availability** - Serverless architecture with automatic scaling
- **Email Deliverability** - Professional email service with high success rates
- **Database Reliability** - Managed PostgreSQL with automatic backups
- **Security Compliance** - Enterprise-level security practices
- **Monitoring & Alerting** - Real-time security event detection

### **Maintainable Codebase**
- **TypeScript Throughout** - Complete type safety and developer experience
- **Modern React Patterns** - Hooks, components, and server components
- **Comprehensive Testing** - Built-in validation and error handling
- **Automated Deployment** - CI/CD with verification and rollback capabilities

---

## 🏆 **Production Status**

**The IMAN Professional Network platform is production-ready with:**

✅ **Dual Authentication System** - Magic link email + Google OAuth for universal accessibility  
✅ **Professional Directory** - Complete member profiles with employer and recently joined views  
✅ **Welcome New Professionals** - Homepage spotlight showcasing newest network members  
✅ **Weekly Meetup Integration** - Eventbrite-powered event management with responsive displays  
✅ **Community Forum Platform** - Full-featured discussion system with user post management  
✅ **Enterprise Security** - Multi-layer protection with magic link and OAuth security  
✅ **Professional Design** - Modern, branded interface optimized for professional networking  
✅ **Admin Management Tools** - Comprehensive dashboard for members, applications, and content  
✅ **Automated Workflows** - Email notifications, magic links, and WhatsApp integration  
✅ **Scalable Architecture** - Built for growth with serverless infrastructure  
✅ **Complete Documentation** - Deployment guides and security analysis  
✅ **Community Spotlight** - Highlighting key community members and organizations  
✅ **Mobile-Optimized** - Perfect experience across all devices and screen sizes  

**Ready for immediate deployment to serve the complete IMAN Professional Network community.** 🚀

## 📞 **Support**

For technical support or questions about the IMAN Professional Network membership system, contact the system administrator.

---

*Built with ❤️ for the IMAN Professional Network community*
