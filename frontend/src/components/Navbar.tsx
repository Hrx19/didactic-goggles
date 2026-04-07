'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-base sm:text-xl md:text-2xl font-semibold text-slate-900 leading-tight max-w-[160px] sm:max-w-[260px] md:max-w-none">
                <span className="block bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text">
                  Kalchakra
                </span>
                <span className="block text-slate-800">Learning Academy</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-700 hover:text-slate-900 transition duration-300 font-medium">
              Home
            </Link>
            <Link href="/courses" className="text-slate-700 hover:text-slate-900 transition duration-300 font-medium">
              Courses
            </Link>
            <Link href="/about" className="text-slate-700 hover:text-slate-900 transition duration-300 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-slate-700 hover:text-slate-900 transition duration-300 font-medium">
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-slate-700 hover:text-slate-900 transition duration-300 font-medium">
                  Dashboard
                </Link>
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                  <Link href="/instructor" className="text-slate-700 hover:text-slate-900 transition duration-300 font-medium">
                    Instructor
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link href="/admin" className="text-teal-700 hover:text-teal-800 transition duration-300 font-medium">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 text-white px-4 py-2 rounded-full hover:bg-slate-900 transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
              >
                Login
              </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700 hover:text-slate-900 focus:outline-none focus:text-slate-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/90 backdrop-blur-md">
              <Link
                href="/"
                className="block px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/courses"
                className="block px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {(user?.role === 'instructor' || user?.role === 'admin') && (
                    <Link
                      href="/instructor"
                      className="block px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Instructor
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-teal-700 hover:text-teal-800 transition duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-slate-700 hover:text-slate-900 transition duration-300 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 bg-slate-900 text-white rounded-full mx-3 my-2 text-center hover:bg-slate-800 transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
