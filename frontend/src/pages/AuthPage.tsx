
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Email tidak valid');
      return;
    }
    if (!password) {
      setError('Password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${axios.defaults.baseURL}/login`, { email, password });
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Email tidak valid');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`forgot-password`, { email });
      setSuccess('Link reset password telah dikirim ke email Anda.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mengirim email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800">
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-teal-700 text-3xl font-extrabold tracking-widest select-none mb-2">PudjaSera</span>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {mode === 'login' ? 'Login' : 'Lupa Password'}
          </h2>
          <p className="text-gray-400 text-sm mb-2">
            {mode === 'login' ? 'Masuk ke akun Anda' : 'Masukkan email untuk reset password'}
          </p>
        </div>
        <form onSubmit={mode === 'login' ? handleLogin : handleForgot} className="space-y-4">
          <div>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 placeholder-gray-400 bg-gray-50"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          {mode === 'login' && (
            <div>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 placeholder-gray-400 bg-gray-50"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Memproses...' : mode === 'login' ? 'Login' : 'Kirim Link Reset'}
          </button>
        </form>
        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <button
              className="text-teal-600 hover:underline text-sm"
              onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            >
              Lupa password?
            </button>
          ) : (
            <button
              className="text-teal-600 hover:underline text-sm"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            >
              Kembali ke login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
