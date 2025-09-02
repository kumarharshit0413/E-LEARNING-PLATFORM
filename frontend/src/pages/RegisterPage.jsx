import React, { useState } from 'react';
import { authService } from '../services/api';

function RegisterPage({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
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
      await authService.register(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 mt-10 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" name="name" onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" onChange={handleChange} className="w-full p-3 mt-1 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">I am a...</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 mt-1 border rounded-md bg-white">
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
         <p className="text-center text-sm">
          Already have an account?{' '}
          <span onClick={() => navigate('login')} className="text-blue-500 cursor-pointer hover:underline">
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
