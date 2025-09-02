import React, { useState, useEffect } from 'react';
import { courseService } from '../services/api';
import CourseCard from '../components/CourseCard';

function HomePage({ navigate }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    courseService.getAll()
      .then(setCourses)
      .catch(err => setError(err.message || "Failed to load courses."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-xl">Loading courses...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center">Available Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <CourseCard key={course._id} course={course} onClick={() => navigate('course', course._id)} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
