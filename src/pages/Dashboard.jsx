import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        setError('Session expired or unauthorized');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
  if (error) return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-red-500 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/login')} className="bg-brand-accent px-4 py-2 rounded text-white font-bold">Go to Login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-xl border border-slate-700 p-8">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-brand-accent">Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-semibold transition">Logout</button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-2 text-slate-300">Auth Token Payload</h3>
            <pre className="bg-black/50 p-4 rounded overflow-auto text-sm text-green-400">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
