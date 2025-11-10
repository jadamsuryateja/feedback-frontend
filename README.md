# Student Feedback Management System

A comprehensive feedback management system for educational institutions with separate dashboards for administrators, coordinators, BSH coordinators, and students.

## Features

### Admin Dashboard
- Create and manage faculty configurations
- View comprehensive feedback summaries with analytics
- Export feedback data to Excel format
- Access to all branches and departments

### Coordinator Dashboard
- Branch-specific faculty configuration management
- Create feedback forms for their respective departments
- Limited to their assigned branch

### BSH Coordinator Dashboard
- Manage faculty configuration for Basic Sciences & Humanities
- Similar functionality to branch coordinators

### Student Feedback
- Anonymous feedback submission
- Progressive 3-step form (Theory → Lab → Comments)
- 10 questions per teacher/subject with 5-point rating scale
- Optional comments for college and department

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- CORS enabled

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Ensure MongoDB is running locally on port 27017

4. Start the backend server:
```bash
npm start
```

Backend will run on http://localhost:5000

### Frontend Setup

1. From the project root, install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Usage

### For Administrators
1. Go to `/login`
2. Select "Admin" role
3. Login with username: `admin`, password: `admin123`
4. Access all features including configuration, summary, and export

### For Coordinators
1. Go to `/login`
2. Select "Coordinator" role
3. Choose your branch
4. Login with credentials (e.g., `cse_coord` / `cse@2024`)
5. Create configurations for your branch

### For BSH Coordinators
1. Go to `/login`
2. Select "BSH" role
3. Login with username: `bsh_coord`, password: `bsh@2024`
4. Manage BSH department configurations

### For Students
1. Go to `/feedback`
2. Enter the form title provided by your coordinator
3. Complete the 3-step feedback form
4. Submit anonymously

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/        # Database and credentials config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   └── server.js      # Main server file
│   └── package.json
├── src/
│   ├── components/        # Reusable components
│   ├── context/           # Auth context
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main app component
└── package.json
```

## Database Collections

### configs
Stores faculty configurations with theory and lab subjects

### feedbackresponses
Stores anonymous student feedback submissions

## Security Features

- JWT-based authentication
- Role-based access control
- Branch-specific data isolation for coordinators
- Anonymous feedback submissions
- Secure password handling

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.
