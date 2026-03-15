'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        router.push('/login?error=oauth_failed');
        return;
      }

      if (token) {
        try {
          // Decode token to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user = {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role,
          };

          // Use the loginWithToken function from context
          loginWithToken(user, token);

          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          router.push('/login?error=token_invalid');
        }
      } else {
        router.push('/login?error=no_token');
      }
    };

    handleCallback();
  }, [searchParams, router, loginWithToken]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-lg font-medium text-slate-900">
              Completing sign in...
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Please wait while we redirect you to your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="mt-4 text-lg font-medium text-slate-900">
                Loading...
              </h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
