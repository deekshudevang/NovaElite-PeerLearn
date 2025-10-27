# PeerLearn - Educational Platform

A modern educational platform connecting students and tutors through peer-to-peer learning with beautiful animations and responsive design.

## Features

- User authentication with JWT
- Profile management
- Subject selection (teaching and learning)
- Peer discovery and connection
- Tutoring requests
- Clean, responsive UI with shadcn/ui components

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Axios** for API communication
- **React Query** for data fetching
- **React Router** for navigation

### Backend (Required)
You need to create a backend server with:
- **Node.js** with Express
- **MongoDB** for database
- **JWT** for authentication
- **bcrypt** for password hashing

## Project Structure

```
src/
├── components/         # UI components (shadcn/ui)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and API client
├── pages/             # Page components
├── services/          # API service layer
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── subject.service.ts
│   └── tutoring.service.ts
└── App.tsx
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Backend API server (see Backend Setup below)

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. **Run development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

You need to create a backend API server that implements the following endpoints:

#### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

#### Profile Endpoints
- `GET /api/profiles/:userId` - Get user profile
- `GET /api/profiles` - Get all profiles (with optional limit)
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/:userId` - Update profile

#### Subject Endpoints
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/user/:userId` - Get user subjects
- `POST /api/subjects/user/:userId` - Update user subjects
- `DELETE /api/subjects/user/:userId` - Delete user subjects

#### Tutoring Request Endpoints
- `POST /api/tutoring-requests` - Create tutoring request
- `GET /api/tutoring-requests/user/:userId` - Get user's requests
- `PATCH /api/tutoring-requests/:requestId` - Update request status

### MongoDB Collections

Your MongoDB database should have the following collections:

#### users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  full_name: String,
  created_at: Date,
  updated_at: Date
}
```

#### profiles
```javascript
{
  _id: String (same as user _id),
  full_name: String,
  bio: String,
  avatar_url: String,
  year_of_study: String,
  major: String,
  created_at: Date,
  updated_at: Date
}
```

#### subjects
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  created_at: Date
}
```

#### user_subjects
```javascript
{
  _id: ObjectId,
  user_id: String (ref: profiles),
  subject_id: ObjectId (ref: subjects),
  can_teach: Boolean,
  can_learn: Boolean,
  proficiency_level: String,
  created_at: Date
}
```

#### tutoring_requests
```javascript
{
  _id: ObjectId,
  from_user_id: String (ref: profiles),
  to_user_id: String (ref: profiles),
  subject_id: ObjectId (ref: subjects),
  message: String,
  status: String (pending/accepted/rejected),
  created_at: Date,
  updated_at: Date
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Changes from Supabase

1. **Removed Supabase SDK** - Replaced with custom API service layer using Axios
2. **JWT Authentication** - Token-based auth stored in localStorage
3. **RESTful API** - All database operations through backend API
4. **Service Layer** - Clean separation of concerns with service files
5. **Error Handling** - Improved error handling with try-catch blocks

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:5000/api)

## License

MIT
