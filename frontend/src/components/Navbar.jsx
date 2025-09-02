import React from 'react';

function Navbar({ user, onLogout, navigate }) {
  const isInstructor = user?.role === 'instructor';
  const isStudent = user?.role === 'student';

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('home')}>
        E-Learning
      </h1>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="font-semibold">Welcome, {user.name}</span>
            {isStudent && <button onClick={() => navigate('student-dashboard')} className="text-blue-500 hover:underline">My Courses</button>}
            {isInstructor && <button onClick={() => navigate('instructor-dashboard')} className="text-blue-500 hover:underline">My Dashboard</button>}
            <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('login')} className="text-blue-500 hover:underline">Login</button>
            <button onClick={() => navigate('register')} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
