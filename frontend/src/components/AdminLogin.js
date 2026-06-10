import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function AdminLogin({ onLogin, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/login`, { username, password });
      if (res.data && res.data.user) {
        onLogin(res.data.user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold mb-2">Username</label>
          <input className="w-full px-4 py-2 border rounded mb-4" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label className="block text-sm font-semibold mb-2">Password</label>
          <input type="password" className="w-full px-4 py-2 border rounded mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="flex gap-3">
            <button type="submit" className="flex-1 px-4 py-2 bg-ey-yellow text-ey-black rounded font-semibold">Login</button>
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-200 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
