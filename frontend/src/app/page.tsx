'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import api from '@/utils/api';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  instructor: {
    name: string;
  };
  category: string;
  level: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setError('');
      const res = await api.get('/courses');
      setCourses(res.data.data.slice(0, 6)); // Show first 6 courses
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Unable to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900">
      <Script
        id="ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'Kalchakra Learning Academy',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://frontend-chi-eosin-36.vercel.app',
            description: 'Career-ready learning platform with expert-led courses.',
          }),
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900 text-white py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Learn. Build. Grow.
              </span>
              <h1 className="mt-6 text-3xl sm:text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                Master programming with
                <span className="block text-amber-300">Kalchakra Learning Academy</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0">
                Industry mentors, career-ready projects, and a learning path that scales from
                beginner to advanced. Build confidence through real products.
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col gap-4 sm:max-w-lg sm:mx-auto sm:flex-row sm:justify-center lg:mx-0 lg:justify-start">
                <Link
                  href="/courses"
                  className="w-full sm:w-auto sm:min-w-[180px] text-center bg-white text-slate-900 px-8 py-3 rounded-full font-semibold whitespace-nowrap shadow-lg hover:bg-slate-100 transition duration-300"
                >
                  Browse Courses
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto sm:min-w-[180px] text-center border border-white/40 text-white px-8 py-3 rounded-full font-semibold whitespace-nowrap hover:bg-white hover:text-slate-900 transition duration-300"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70 lg:justify-start">
                <span className="rounded-full border border-white/20 px-3 py-1">Live projects</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Career tracks</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Mentor support</span>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    Course Preview
                  </span>
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                    New
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="text-lg font-semibold">Full Stack Bootcamp</div>
                    <div className="text-sm text-white/70">HTML, CSS, React, Node, MongoDB</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                      <span>8 Weeks</span>
                      <span>Beginner Friendly</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-lg font-semibold">Data Science Track</div>
                    <div className="text-sm text-white/70">Python, Pandas, ML, Deployment</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                      <span>6 Weeks</span>
                      <span>Project Based</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                    <div className="text-xl font-semibold">120+</div>
                    <div className="text-[10px] uppercase tracking-wide text-white/60">Courses</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                    <div className="text-xl font-semibold">12k</div>
                    <div className="text-[10px] uppercase tracking-wide text-white/60">Learners</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                    <div className="text-xl font-semibold">4.8</div>
                    <div className="text-[10px] uppercase tracking-wide text-white/60">Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Featured
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Top Courses, Built for Real Jobs</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Curated courses with step-by-step projects, mentorship, and a clear learning path.
            </p>
          </div>

          {loading ? (
            <div className="text-center">Loading courses...</div>
          ) : error ? (
            <div className="text-center text-slate-600">
              {error}
              <button
                onClick={fetchCourses}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-6 py-2 text-sm font-semibold hover:bg-slate-800 transition duration-300"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-2xl transition duration-300"
                >
                  <img
                    src={course.thumbnail || '/placeholder-course.jpg'}
                    alt={course.title}
                    className="w-full h-48 object-cover transition duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wide text-teal-700 font-semibold">{course.category}</span>
                      <span className="text-xs text-slate-500">{course.level}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{course.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-slate-900">INR {course.price}</span>
                      </div>
                      <Link
                        href={`/courses/${course._id}`}
                        className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center bg-slate-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-800 transition duration-300"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm ring-1 ring-black/5">
              Testimonials
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">What Our Students Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg ring-1 ring-black/5">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                &ldquo;Kalchakra Learning Academy helped me transition from a beginner to a professional developer. The courses are comprehensive and the instructors are amazing!&rdquo;
              </p>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-slate-500 text-sm">Full Stack Developer</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg ring-1 ring-black/5">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                &ldquo;The React course was exactly what I needed. Clear explanations, practical projects, and great support from the community.&rdquo;
              </p>
              <div className="font-semibold">Mike Chen</div>
              <div className="text-slate-500 text-sm">Frontend Developer</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg ring-1 ring-black/5">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                &ldquo;Best investment I&apos;ve made in my career. The Python course opened up so many opportunities for me.&rdquo;
              </p>
              <div className="font-semibold">Emily Davis</div>
              <div className="text-slate-500 text-sm">Data Scientist</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white px-6 py-12 sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-6 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />
              <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            </div>
            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
                Join thousands of students who are already learning and growing with Kalchakra Learning Academy.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-8 py-3 font-semibold hover:bg-slate-100 transition duration-300"
                >
                  Start Learning Today
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 font-semibold text-white hover:bg-white hover:text-slate-900 transition duration-300"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

