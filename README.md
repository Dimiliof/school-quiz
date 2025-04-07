# School Quiz Platform

A full-stack application for teachers to create quizzes and students to take them. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication with JWT
- Different roles for teachers and students
- Teachers can create, edit, and manage quizzes
- Students can browse available quizzes and take them
- Real-time quiz taking with timer
- Dashboard for viewing results
- User profile management

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for styling
- React Router for navigation
- Axios for API requests
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Dimiliof/school-quiz.git
   cd school-quiz
   ```

2. Install dependencies for both frontend and backend
   ```
   npm run install-all
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Run the application in development mode
   ```
   npm run dev
   ```

   This will start both the backend server and frontend development server concurrently.

5. Open your browser and navigate to `http://localhost:3000`

### Running in Production

1. Build the frontend
   ```
   npm run build
   ```

2. Start the server
   ```
   npm start
   ```

## Application Structure

### Frontend

- `/frontend/src/components` - Reusable UI components
- `/frontend/src/contexts` - Context providers for state management
- `/frontend/src/pages` - Page components for each route
- `/frontend/src/services` - API service files
- `/frontend/src/types` - TypeScript type definitions

### Backend

- `/backend/src/config` - Configuration files
- `/backend/src/controllers` - Request handlers
- `/backend/src/middleware` - Express middleware
- `/backend/src/models` - Mongoose models
- `/backend/src/routes` - API routes

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user information

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/results` - Get user quiz results
- `GET /api/users/results/:id` - Get specific quiz result

### Quiz Routes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/active` - Get active quizzes (for students)
- `GET /api/quizzes/:id` - Get a specific quiz
- `POST /api/quizzes` - Create a new quiz (teachers only)
- `PUT /api/quizzes/:id` - Update a quiz (teachers only)
- `DELETE /api/quizzes/:id` - Delete a quiz (teachers only)
- `POST /api/quizzes/:id/submit` - Submit a quiz attempt

## License

This project is licensed under the MIT License. 