'use client';

import { useEffect, useState } from 'react';
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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Online courses
              </span>
              <h1 className="mt-6 text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
                Learn Coding and Tech Skills Easily
              </h1>
              <p className="mt-4 text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto lg:mx-0">
                Beginner to advanced courses with real projects for students, beginners, and job seekers.
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
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <div className="text-sm font-semibold">500+ students</div>
                  <div className="text-xs text-white/70">Active learners</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <div className="text-sm font-semibold">4.8 rating</div>
                  <div className="text-xs text-white/70">Based on reviews</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <div className="text-sm font-semibold">Job ready</div>
                  <div className="text-xs text-white/70">Real projects</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl bg-white/10 border border-white/20 p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/15 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">Featured</div>
                    <div className="mt-2 text-lg font-semibold">Full Stack Web Development</div>
                    <div className="mt-1 text-sm text-white/70">Beginner to advanced in 12 weeks</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">Outcomes</div>
                    <div className="mt-2 text-sm text-white/80">Build 5 projects and a portfolio</div>
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

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Features
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">A clear learning path</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Simple lessons, real projects, and consistent progress so you never feel lost.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition duration-300">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">01</div>
              <h3 className="mt-3 text-lg font-semibold">Project based</h3>
              <p className="mt-2 text-sm text-slate-600">Learn by building real projects and portfolios.</p>
              <Link href="/courses" className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">
                Start Learning
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition duration-300">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">02</div>
              <h3 className="mt-3 text-lg font-semibold">Beginner friendly</h3>
              <p className="mt-2 text-sm text-slate-600">Step by step lessons designed for zero to hero.</p>
              <Link href="/courses" className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">
                Start Learning
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition duration-300">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">03</div>
              <h3 className="mt-3 text-lg font-semibold">Career focused</h3>
              <p className="mt-2 text-sm text-slate-600">Skills aligned with current job requirements.</p>
              <Link href="/courses" className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Courses
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Choose your course</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Each course includes level, duration, projects, and a clear learning path.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading courses...</div>
          ) : error ? (
            <div className="text-center py-12 text-slate-600">{error}</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition duration-300">
                  <div className="aspect-[4/3] bg-slate-100">
                    <img
                      src={course.thumbnail || '/placeholder-course.jpg'}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{course.level || 'Beginner'}</span>
                      <span>{course.duration ? `${course.duration} hours` : 'Self-paced'}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">
                        {course.price > 0 ? `INR ${course.price}` : 'Free'}
                      </div>
                      <Link
                        href={`/courses/${course._id}`}
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition duration-300"
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
              className="inline-flex items-center justify-center rounded-full border border-blue-600 px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition duration-300"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Why choose us
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Focused on clarity and outcomes</h2>
              <p className="mt-4 text-slate-600">
                We keep learning simple and goal driven so you can finish courses and build real skills.
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold">Expert designed curriculum</div>
                  <div className="text-sm text-slate-600">Updated content aligned with industry demand.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold">Progress tracking</div>
                  <div className="text-sm text-slate-600">Stay consistent and see your improvement.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold">Community support</div>
                  <div className="text-sm text-slate-600">Get answers quickly and stay motivated.</div>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition duration-300"
                >
                  Start Learning
                </Link>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Testimonials</div>
                <div className="mt-4 grid gap-4">
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-700">Clear explanations and real projects. I finally understand web dev.</div>
                    <div className="mt-2 text-xs text-slate-500">Ankita, Beginner</div>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-700">Great structure and support. I feel ready for interviews.</div>
                    <div className="mt-2 text-xs text-slate-500">Rahul, Job seeker</div>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-700">Best value for money. The roadmap kept me consistent.</div>
                    <div className="mt-2 text-xs text-slate-500">Neha, Student</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
                <div className="text-sm font-semibold text-blue-900">Trusted by learners</div>
                <div className="mt-2 text-sm text-blue-700">500+ students and a 4.8 rating.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Contact
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Talk to our team</h2>
              <p className="mt-3 text-slate-600">We reply quickly on phone or WhatsApp.</p>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <div>Phone: +91 90000 00000</div>
                <div>WhatsApp: +91 90000 00000</div>
                <div>Email: support@kalchakra.academy</div>
              </div>
              <div className="mt-6">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition duration-300"
                >
                  Start Learning
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
                <textarea
                  placeholder="How can we help?"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
                <button
                  type="button"
                  className="w-full rounded-full bg-purple-600 text-white px-6 py-3 font-semibold hover:bg-purple-700 transition duration-300"
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
