import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    org_slug: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/employee/login', formData);
      localStorage.setItem('token', res.data.data.tokens.accessToken);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-brand-accent">Employee Login</h2>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-2 bg-slate-900 border border-slate-700 rounded" type="text" name="org_slug" placeholder="Organization Slug (e.g. acme-corp)" onChange={handleChange} required />
          <input className="w-full p-2 bg-slate-900 border border-slate-700 rounded" type="email" name="email" placeholder="Your Email" onChange={handleChange} required />
          <input className="w-full p-2 bg-slate-900 border border-slate-700 rounded" type="password" name="password" placeholder="Password" onChange={handleChange} required />
          
          <button type="submit" className="w-full bg-brand-accent text-white p-2 rounded hover:bg-opacity-90 font-bold">Log In</button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-400">
          <Link to="/login" className="text-brand-accent hover:underline">Go to Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
