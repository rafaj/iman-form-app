# Authentication Flow Test Plan

## After adding Google OAuth credentials:

### 1. Test Sign-In Flow
1. Go to: http://localhost:3000
2. Should redirect to: http://localhost:3000/auth/signin
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. Should redirect back to homepage as authenticated user

### 2. Test Admin Access
1. After signing in with jafar@jafar.com
2. Should see "Admin" badge in navigation
3. Can access: http://localhost:3000/admin
4. Should see admin dashboard

### 3. Test Application Form
1. Go to: http://localhost:3000/apply
2. Form should be pre-populated with your Google account info
3. Can submit membership application

### 4. Test Database Connection
1. Homepage should show Community Spotlight data
2. No more database connection errors
3. Admin panel should show real data

Let me know when you have your Google OAuth credentials!