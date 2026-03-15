'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Reset token is missing.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/auth/resetpassword', { token, password });
      const jwtToken = res.data.token;
      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
        const me = await api.get('/auth/me');
        loginWithToken(me.data.data, jwtToken);
        router.push('/dashboard');
        return;
      }
      setMessage('Password reset successful. Please login.');
      router.push('/login');
    } catch (error: unknown) {
      setMessage('Reset failed. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Create a new password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your new password to regain access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur py-8 px-4 shadow-xl rounded-2xl ring-1 ring-black/5 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                />
              </div>
            </div>

            {message && <div className="text-sm text-slate-600">{message}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
