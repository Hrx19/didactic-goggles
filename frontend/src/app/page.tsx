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
  duration?: number;
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
      setCourses(res.data.data.slice(0, 6));
    } catch (err) {
      console.error('Error fetching courses:', err);
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
            description: 'Learn job-ready skills online with expert-led courses.',
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
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
                Learn Job-Ready Skills Online
              </h1>
              <p className="mt-4 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0">
                For students, beginners, and job seekers who want clear lessons, real projects, and career-ready outcomes.
              </p>
              <div className="mt-8">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:bg-slate-100 transition duration-300"
                >
                  Start Learning
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <div className="text-sm font-semibold">500+ students</div>
                  <div className="text-xs text-white/70">Active learners</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <div className="text-sm font-semibold">4.8 rating</div>
                  <div className="text-xs text-white/70">From verified reviews</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <div className="text-sm font-semibold">Job-ready</div>
                  <div className="text-xs text-white/70">Project-focused learning</div>
                </div>
              </div>
            </motion.div>
            <div className="relative">
              <div className="rounded-3xl bg-white/10 border border-white/20 p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/15 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">Featured</div>
                    <div className="mt-2 text-lg font-semibold">Full Stack Web Development</div>
                    <div className="mt-1 text-sm text-white/70">Beginner to Advanced in 12 weeks</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">Outcome</div>
                    <div className="mt-2 text-sm text-white/80">Build 5 real projects and a portfolio website</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">Support</div>
                    <div className="mt-2 text-sm text-white/80">Mentor guidance and doubt clearing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Benefits
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">A clear path from learning to earning</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Structured lessons, hands-on projects, and progress tracking so you stay on track and finish strong.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">01</div>
              <h3 className="mt-3 text-lg font-semibold">Project-based learning</h3>
              <p className="mt-2 text-sm text-slate-600">Build real projects you can show in interviews.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">02</div>
              <h3 className="mt-3 text-lg font-semibold">Beginner friendly</h3>
              <p className="mt-2 text-sm text-slate-600">Start from zero and move step by step with clarity.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">03</div>
              <h3 className="mt-3 text-lg font-semibold">Career focused</h3>
              <p className="mt-2 text-sm text-slate-600">Learn the exact skills companies expect.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Courses
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Explore our courses</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Choose a learning path that fits your goals and start today.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading courses...</div>
          ) : error ? (
            <div className="text-center py-12 text-slate-600">{error}</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="aspect-[4/3] bg-slate-100">
                    <img
                      src={course.thumbnail || '/placeholder-course.jpg'}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{course.level || 'Beginner'}</span>
                      <span>{course.duration ? `${course.duration} hours` : 'Self-paced'}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{course.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">
                        {course.price > 0 ? `INR ${course.price}` : 'Free'}
                      </div>
                      <Link
                        href={`/courses/${course._id}`}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition duration-300"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition duration-300"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Why us
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Learn faster with a guided plan</h2>
              <p className="mt-4 text-slate-600">
                We focus on clarity, practice, and results. Every lesson is structured to remove confusion and build confidence.
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold">Expert-led curriculum</div>
                  <div className="text-sm text-slate-600">Updated content aligned with industry needs.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold">Progress tracking</div>
                  <div className="text-sm text-slate-600">See your growth and stay motivated.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold">Community support</div>
                  <div className="text-sm text-slate-600">Get answers and feedback when you need it.</div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 text-white p-8 shadow-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Career outcomes</div>
              <h3 className="mt-4 text-2xl font-semibold">Build a portfolio that recruiters notice</h3>
              <p className="mt-3 text-sm text-white/70">
                Complete real projects and publish them to your portfolio to showcase your skills.
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">Frontend + Backend projects</div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">Resume review tips</div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">Interview preparation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Testimonials
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">What learners say</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Real feedback from students who improved their skills with us.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl shadow-lg ring-1 ring-black/5">
              <div className="flex items-center mb-4 text-amber-400">* * * * *</div>
              <p className="text-slate-600 mb-4">
                The lessons are clear and practical. I built my first real project in two weeks.
              </p>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-slate-500 text-sm">Beginner Developer</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg ring-1 ring-black/5">
              <div className="flex items-center mb-4 text-amber-400">* * * * *</div>
              <p className="text-slate-600 mb-4">
                The course structure kept me consistent. I feel ready for interviews now.
              </p>
              <div className="font-semibold">Mike Chen</div>
              <div className="text-slate-500 text-sm">Job Seeker</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg ring-1 ring-black/5">
              <div className="flex items-center mb-4 text-amber-400">* * * * *</div>
              <p className="text-slate-600 mb-4">
                Mentor feedback was super helpful. I finally understood backend fundamentals.
              </p>
              <div className="font-semibold">Emily Davis</div>
              <div className="text-slate-500 text-sm">College Student</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Contact
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Need help choosing a course?</h2>
              <p className="mt-3 text-slate-600">
                Send us your question and we will reply quickly.
              </p>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <div>Phone: +91 90000 00000</div>
                <div>WhatsApp: +91 90000 00000</div>
                <div>Email: support@kalchakra.academy</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900"
                />
                <textarea
                  placeholder="How can we help?"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900"
                />
                <button
                  type="button"
                  className="w-full rounded-full bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition duration-300"
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Start learning today</h2>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            Join hundreds of learners and build skills that help you get hired.
          </p>
          <div className="mt-6">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition duration-300"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
