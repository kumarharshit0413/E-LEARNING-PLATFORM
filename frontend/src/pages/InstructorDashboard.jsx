import React, { useState, useEffect } from 'react';
import { courseService } from '../services/api';
import CourseCard from '../components/CourseCard';

function InstructorDashboard({ navigate }) {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getInstructorCourses()
      .then(setMyCourses)
      .catch(error => console.error("Failed to fetch instructor courses", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-xl">Loading your dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Instructor Dashboard</h2>
        <button 
          onClick={() => navigate('create-course')} 
          className="bg-green-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-600"
        >
          Create New Course
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Your Courses</h3>
        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map(course => (
              <CourseCard key={course._id} course={course} enrollmentCount={course.enrollmentCount}
              onClick={() => navigate('course', course._id)} />
            ))}
          </div>
        ) : (
          <p>You haven't created any courses yet. Click "Create New Course" to get started!</p>
        )}
      </div>
    </div>
  );
}

export default InstructorDashboard;
