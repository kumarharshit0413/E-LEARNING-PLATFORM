import React from 'react';

function CourseCard({ course, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-bold text-blue-700 truncate">{course.title}</h3>
        <p className="text-gray-600 mt-2 h-20 overflow-hidden text-ellipsis">{course.description}</p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500 font-semibold">Category: {course.category}</p>
        {typeof enrollmentCount !== 'undefined' && (
          <p className="text-sm font-bold text-blue-600">{enrollmentCount} Student(s)</p>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
