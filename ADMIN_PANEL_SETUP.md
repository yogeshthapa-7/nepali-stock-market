# Admin Panel Setup - Nepali Stock Market

## Overview
This document explains the authentication flow and admin panel structure implemented in the Nepali Stock Market application.

## Changes Made

### 1. Removed Redundant Dashboard Folders
Previously, there were three dashboard locations causing confusion:
- ❌ `frontend/app/dashboard/` - Deleted
- ❌ `frontend/app/(dashboard)/` - Deleted
- ✅ `frontend/app/(admin)/dashboard/` - Kept as the admin panel

### 2. Updated Authentication Flow

#### Login Flow (`frontend/app/(auth)/login/page.tsx`)
After successful login, the application now:
1. Checks the user's role from the database
2. Redirects admin users to `/admin/dashboard`
3. Redirects regular users to `/` (home page)

#### Signup Flow (`frontend/app/(auth)/signup/page.tsx`)
After successful signup, the application:
1. Checks the new user's role
2. Redirects admin users to `/admin/dashboard`
3. Redirects regular users to `/` (home page)

### 3. Admin Panel Protection

#### Admin Layout (`frontend/app/(admin)/layout.tsx`)
The admin layout automatically:
1. Checks if user is authenticated
2. Verifies if user has `admin` role in the database
3. Redirects non-admin users to `/` (home page)
4. Redirects unauthenticated users to `/login`

This ensures **only users with admin role in MongoDB can access the admin panel**.

### 4. User Experience Updates

#### Home Page (`frontend/app/page.tsx`)
The home page now:
- Shows a **landing page** for guests (unauthenticated users)
- Shows a **personalized dashboard** for authenticated regular users
- Provides quick access to Portfolio, Market, Stocks, IPOs, News, and Watchlist

#### Navigation (`frontend/app/components/Navigation.tsx`)
Updated navigation:
- Changed "Dashboard" link to "Home" pointing to `/`
- Logo now links to `/` instead of `/dashboard`
- Cleaner navigation structure for regular users

## Database Setup

### User Roles in MongoDB
Ensure your MongoDB database has users with the correct role field:

```javascript
{
  "_id": ObjectId("..."),
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "hashed_password",
  "role": "admin",  // 👈 Set this to "admin" for admin users
  "isVerified": true,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}

{
  "_id": ObjectId("..."),
  "name": "Regular User",
  "email": "user@example.com",
  "password": "hashed_password",
  "role": "user",  // 👈 Regular users have "user" role
  "isVerified": true,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## Access Control Summary

### Admin Users (`role: "admin"`)
- ✅ Can access `/admin/dashboard` and all admin routes
- ✅ Can manage users, stocks, IPOs, and news
- ✅ Protected by `requireAdmin` middleware on backend
- ✅ Automatically redirected to admin panel after login

### Regular Users (`role: "user"`)
- ❌ Cannot access `/admin/*` routes (redirected to `/`)
- ✅ Can access all public routes (market, stocks, portfolio, etc.)
- ✅ See personalized home page after login
- ✅ Can manage their own portfolio and watchlist

### Guest Users (Not logged in)
- ❌ Cannot access protected routes
- ✅ Can view landing page and public market data
- ✅ Prompted to login when accessing protected features

## Routes Overview

### Public Routes
- `/` - Landing page (guests) / Personalized home (authenticated users)
- `/login` - Login page
- `/signup` - Signup page
- `/market` - Market overview
- `/stocks` - Stock listings
- `/ipos` - IPO listings
- `/news` - News articles

### Protected User Routes (require authentication)
- `/portfolio` - User's portfolio
- `/watchlist` - User's watchlist
- `/transactions` - User's transaction history

### Admin Routes (require admin role)
- `/admin/dashboard` - Admin dashboard with statistics
- `/admin/users` - User management
- `/admin/stocks` - Stock management
- `/admin/ipos` - IPO management
- `/admin/news` - News management

## Testing the Setup

### Test Admin Access
1. Create a user with `role: "admin"` in MongoDB Compass
2. Login with that user's credentials
3. You should be redirected to `/admin/dashboard`
4. Try accessing admin routes - should work
5. Navigate to "View Site" - goes to home page

### Test Regular User Access
1. Create a user with `role: "user"` in MongoDB Compass
2. Login with that user's credentials
3. You should be redirected to `/` (personalized home)
4. Try accessing `/admin/dashboard` - should redirect to `/`
5. Can access portfolio, watchlist, and other user features

### Test Guest Access
1. Logout or use incognito mode
2. Visit `/` - should see landing page with login/signup buttons
3. Try accessing `/admin/dashboard` - should redirect to `/login`
4. Try accessing `/portfolio` - should redirect to `/login`

## Backend Middleware

The backend has proper middleware for role-based access control:

```javascript
// backend/middleware/auth.js
export const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

All admin routes in the backend should use this middleware to ensure database-level protection.

## Security Notes

1. **Role verification happens on both frontend and backend**
   - Frontend checks for better UX (immediate redirects)
   - Backend checks for security (cannot bypass with client-side manipulation)

2. **JWT tokens include role information**
   - Role is encoded in the JWT during login
   - Backend middleware verifies role from token

3. **MongoDB is the source of truth**
   - User roles are stored in MongoDB
   - Changes to roles in database are reflected after re-login

## Troubleshooting

### Admin user redirected to home page
- Check if `role` field in MongoDB is exactly `"admin"` (case-sensitive)
- Clear browser cookies and localStorage
- Check JWT token payload includes role

### Cannot access admin routes
- Verify backend middleware is applied to admin routes
- Check browser console for errors
- Verify JWT token is being sent with requests

### Changes to role not reflecting
- User must logout and login again for role changes to take effect
- JWT token contains cached role information
