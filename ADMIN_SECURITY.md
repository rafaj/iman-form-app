# Admin Security Setup

This document explains the admin authentication system and security measures.

## 🔐 Admin Authentication

The admin dashboard is now protected with session-based authentication.

### Default Credentials (Development)
- **Username**: `admin`
- **Password**: `iman-admin-2024`

⚠️ **IMPORTANT**: Change these credentials before deploying to production!

## 🛡️ Security Features

### Authentication System
- **Session-based authentication** with secure HTTP-only cookies
- **24-hour session duration** with automatic expiration
- **Brute force protection** with login delays
- **Secure cookie settings** (HttpOnly, Secure in production, SameSite)

### Protected Endpoints
All admin endpoints now require authentication:
- `/api/admin/applications/[token]/approve`
- `/api/admin/applications/[token]/reject`
- `/api/list-sponsors` (member data)
- `/api/list-applications` (application data)

### Admin Pages
- `/admin` - Main dashboard (protected)
- `/admin/login` - Login page (public)
- `/admin/application/[token]` - Application review (protected)

## 🚀 Production Setup

### 1. Set Environment Variables

Create a `.env.production` file or set environment variables:

```bash
# Strong admin credentials
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="your_very_secure_password_123!"

# Other required variables
DATABASE_URL="your_production_database_url"
RESEND_API_KEY="your_resend_api_key"
NEXTAUTH_SECRET="your_random_secret_key"
NEXTAUTH_URL="https://yourdomain.com"
```

### 2. Password Requirements

For production, use a strong password with:
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not easily guessable
- Unique to this application

### 3. Additional Security Measures

Consider implementing:
- **Two-factor authentication** (future enhancement)
- **IP whitelisting** for admin access
- **Rate limiting** on login attempts
- **Audit logging** for admin actions
- **Regular password rotation**

## 🔧 How It Works

### Login Flow
1. Admin visits `/admin`
2. System checks for valid session cookie
3. If not authenticated, redirects to `/admin/login`
4. Admin enters credentials
5. System validates and creates session
6. Session cookie set with 24-hour expiration
7. Admin can access protected dashboard

### Session Management
- **Automatic expiration** after 24 hours
- **Secure cookie storage** (HttpOnly, encrypted)
- **Session validation** on each admin API request
- **Clean logout** with cookie clearing

### API Protection
- All admin endpoints check for valid session
- Returns 401 Unauthorized if not authenticated
- Graceful error handling and redirects

## 🧪 Testing

### Development Testing
1. Start the application: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. Should redirect to login page
4. Use credentials: `admin` / `iman-admin-2024`
5. Should access dashboard successfully

### Production Testing
1. Verify environment variables are set
2. Test login with production credentials
3. Verify session persistence across page reloads
4. Test logout functionality
5. Verify unauthorized access is blocked

## 🚨 Security Checklist

Before production deployment:

- [ ] Change default admin credentials
- [ ] Set strong ADMIN_PASSWORD in environment
- [ ] Verify HTTPS is enabled (required for secure cookies)
- [ ] Test login/logout functionality
- [ ] Verify unauthorized access is blocked
- [ ] Check session expiration works correctly
- [ ] Ensure sensitive data is not logged
- [ ] Review and update password regularly

## 🔄 Future Enhancements

Potential security improvements:
- Multi-factor authentication (MFA)
- Role-based access control (multiple admin levels)
- IP address restrictions
- Login attempt monitoring and alerting
- Password complexity requirements
- Session activity logging
- Automated security scanning

The current system provides solid security for a single admin user with session-based authentication and proper cookie security.
