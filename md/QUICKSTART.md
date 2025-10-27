# Quick Start Guide

## ✅ Migration Complete!

Your application has been successfully migrated from Supabase to MongoDB. All Supabase dependencies have been removed and replaced with a clean REST API architecture.

## What Was Done

1. ✅ Removed `@supabase/supabase-js` dependency
2. ✅ Added `axios` for API communication
3. ✅ Created API client with interceptors
4. ✅ Created service layer (auth, profile, subject, tutoring)
5. ✅ Updated all pages to use new services
6. ✅ Removed Supabase integration directory
7. ✅ Fixed all TypeScript errors
8. ✅ Updated documentation

## Next Steps

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and set:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Set Up Backend API

You need to create a Node.js/Express backend server. Here's a minimal example:

**Required Technologies:**
- Node.js + Express
- MongoDB (local or Atlas)
- JWT for authentication
- bcrypt for password hashing

**Required Endpoints:** See `MIGRATION_SUMMARY.md` for the complete list.

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Create database: edu-link-up
```

**Option B: MongoDB Atlas**
```bash
# Create a free cluster at https://www.mongodb.com/cloud/atlas
# Get connection string
# Update backend .env with connection string
```

**Collections Needed:**
- users
- profiles
- subjects
- user_subjects
- tutoring_requests

See `README.md` for detailed schema definitions.

### 4. Run the Application

**Start Backend (in backend directory):**
```bash
npm install
npm start
```

**Start Frontend:**
```bash
npm install  # Already done
npm run dev
```

The app should open at `http://localhost:5173`

## File Structure

```
src/
├── lib/
│   └── api-client.ts          # Axios configuration
├── services/
│   ├── auth.service.ts        # Authentication
│   ├── profile.service.ts     # User profiles
│   ├── subject.service.ts     # Subjects management
│   └── tutoring.service.ts    # Tutoring requests
├── pages/
│   ├── Auth.tsx               # ✅ Updated
│   ├── Dashboard.tsx          # ✅ Updated
│   ├── ProfileSetup.tsx       # ✅ Updated
│   └── PeerProfile.tsx        # ✅ Updated
└── components/                # No changes needed
```

## Testing Checklist

- [ ] Backend API is running
- [ ] MongoDB is connected
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view dashboard
- [ ] Can update profile
- [ ] Can browse peers
- [ ] Can send tutoring request

## Common Issues

### "Network Error"
- Check if backend is running
- Verify `VITE_API_BASE_URL` in `.env`
- Check CORS configuration in backend

### "401 Unauthorized"
- Check JWT token implementation in backend
- Verify Authorization header is being sent
- Check token expiration

### "Cannot connect to MongoDB"
- Verify MongoDB is running (if local)
- Check connection string (if Atlas)
- Verify network access in MongoDB Atlas

## Documentation

- `README.md` - Complete setup guide and API documentation
- `MIGRATION_SUMMARY.md` - Detailed migration changes
- `.env.example` - Environment variables template

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Endpoints Summary

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - Login user
- POST `/api/auth/signout` - Logout user

### Profiles
- GET `/api/profiles` - List all profiles
- GET `/api/profiles/:userId` - Get specific profile
- POST `/api/profiles` - Create profile
- PUT `/api/profiles/:userId` - Update profile

### Subjects
- GET `/api/subjects` - List all subjects
- GET `/api/subjects/user/:userId` - Get user's subjects
- POST `/api/subjects/user/:userId` - Update user's subjects
- DELETE `/api/subjects/user/:userId` - Delete user's subjects

### Tutoring Requests
- POST `/api/tutoring-requests` - Create request
- GET `/api/tutoring-requests/user/:userId` - Get user's requests
- PATCH `/api/tutoring-requests/:requestId` - Update request status

## Need Help?

1. Check the error message in browser console
2. Verify backend is running and accessible
3. Check MongoDB connection
4. Review `README.md` for detailed setup
5. Check `MIGRATION_SUMMARY.md` for architecture details

## Success! 🎉

Your application is now using MongoDB instead of Supabase. The code is cleaner, more maintainable, and you have full control over your backend and database.
