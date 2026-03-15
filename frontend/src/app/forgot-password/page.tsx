'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setResetUrl('');
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      setMessage(res.data.message || 'Check your inbox for the reset link.');
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (error: unknown) {
      setMessage('Unable to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your email and we will send a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur py-8 px-4 shadow-xl rounded-2xl ring-1 ring-black/5 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                />
              </div>
            </div>

            {message && (
              <div className="text-sm text-slate-600">
                {message}
                {resetUrl && (
                  <div className="mt-2 break-all text-xs text-slate-500">
                    Reset link: {resetUrl}
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link href="/login" className="font-medium text-teal-700 hover:text-teal-600">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
