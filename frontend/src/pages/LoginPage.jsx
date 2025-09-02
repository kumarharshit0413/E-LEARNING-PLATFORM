import React, { useState } from 'react';
import { authService } from '../services/api';


function LoginPage({ onLoginSuccess, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 mt-10 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-3 mt-1 border rounded-md" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 mt-1 border rounded-md" 
            required 
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-center text-sm">
          Don't have an account?{' '}
          <span onClick={() => navigate('register')} className="text-blue-500 cursor-pointer hover:underline">
            Register here
          </span>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
