import React, { useState, useEffect } from 'react';
import { enrollmentService } from '../services/api';
import CourseCard from '../components/CourseCard';

function StudentDashboard({ navigate }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    enrollmentService.getEnrolled()
      .then(setEnrolledCourses)
      .catch(err => setError(err.message || "Failed to fetch your courses."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-xl">Loading your courses...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">My Enrolled Courses</h2>
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map(course => (
            <CourseCard key={course._id} course={course} onClick={() => navigate('course', course._id)} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-700">You are not enrolled in any courses yet.</p>
          <button onClick={() => navigate('home')} className="mt-4 text-blue-500 cursor-pointer hover:underline font-semibold">
            Browse courses to get started!
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
