import React, { useState } from 'react';
import { courseService } from '../services/api';

function CreateCoursePage({ navigate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await courseService.create(formData);
      setSuccess('Course created successfully! Redirecting to your dashboard...');
      // Clear form
      setFormData({ title: '', description: '', category: '' });
      setTimeout(() => navigate('instructor-dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create a New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Course Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Course Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" rows="4" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" placeholder="e.g., Web Development" required />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-500 text-white p-3 rounded-md font-semibold hover:bg-green-600 disabled:bg-green-300"
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>
        <p className="text-center text-sm">
          <span onClick={() => navigate('instructor-dashboard')} className="text-blue-500 cursor-pointer hover:underline">
            Back to Dashboard
          </span>
        </p>
      </form>
    </div>
  );
}

export default CreateCoursePage;
