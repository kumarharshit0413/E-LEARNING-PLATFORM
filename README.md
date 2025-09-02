# Full-Stack E-Learning Platform

This is a complete MERN stack (MongoDB, Express, React, Node.js) application that provides a platform for instructors to create courses and for students to enroll and learn.

## Features

- **User Authentication:** Secure JWT-based authentication with password hashing.
- **Role-Based Access Control:** Distinct roles for 'student' and 'instructor' with different permissions.
- **Course Management (CRUD):** Instructors can create, read, update, and delete their own courses.
- **Lesson Management:** Instructors can add lessons (with optional video uploads) to their courses.
- **Student Enrollment:** Students can browse courses, view details, and enroll.
- **Social Features:** Logged-in users can like courses and post comments.
- **Instructor Dashboard:** A dedicated dashboard for instructors to view their courses and see student enrollment counts.
- **Student Dashboard:** A dedicated dashboard for students to view their enrolled courses.

## Tech Stack

### Backend
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web framework for Node.js.
- **MongoDB:** NoSQL database for storing all data.
- **JSON Web Tokens (JWT):** For secure user authentication.
- **Bcrypt:** For hashing user passwords.
- **Multer & Cloudinary:** For handling file uploads to the cloud.

### Frontend
- **React.js:** JavaScript library for building user interfaces.
- **Vite:** Modern frontend build tool.
- **Tailwind CSS:** For styling the user interface.

## How to Run This Project

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or a local MongoDB instance)
- Cloudinary account for file uploads

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
cd YOUR_REPOSITORY_NAME
```

### 2. Backend Setup
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create a .env file and add your secret keys
# (See .env.example for required variables)
cp .env.example .env

# Start the server
npm start
```
The backend will be running at `http://localhost:5000`.

### 3. Frontend Setup
```bash
# Navigate to the frontend folder from the root
cd frontend

# Install dependencies
npm install

# Start the client
npm run dev
```
The frontend will be running at `http://localhost:5173`.
