import React, { useState, useEffect, useCallback } from 'react';
import { authService } from './services/api';

import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCoursePage from './pages/CreateCoursePage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [page, setPage] = useState('home');
  const [pageId, setPageId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = await authService.getProfile();
        setUser(data.user);
      } catch (error) {
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPage('home');
  };

  const navigate = (newPage, id = null) => {
    setPage(newPage);
    setPageId(id);
  };

  const handleLoginSuccess = () => {
    setLoading(true);
    fetchUser().then(() => {
        navigate('home');
    });
  };

  const renderPage = () => {
    // A simple router
    switch (page) {
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} navigate={navigate}/>;
      case 'register':
        return <RegisterPage navigate={navigate} />;
      case 'instructor-dashboard':
        return <InstructorDashboard navigate={navigate} />;
      case 'create-course':
        return <CreateCoursePage navigate={navigate} />;  
      case 'course':
        return <CourseDetailPage courseId={pageId} user={user} navigate={navigate} />;
      case 'student-dashboard':
        return <StudentDashboard navigate={navigate}/>
      case 'home':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Navbar user={user} onLogout={handleLogout} navigate={navigate} />
      <main className="p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
