'use client';

import Link from 'next/link';
import Script from 'next/script';

const popularCourses = [
  {
    title: 'Web Development',
    description: 'Learn HTML, CSS, JavaScript and build real websites',
    duration: '2 Months',
    level: 'Beginner',
    students: '1200+ Students',
    rating: '4.8 Rating',
    tag: 'Most Popular',
  },
  {
    title: 'Python Programming',
    description: 'Master Python from basics to advanced with real projects',
    duration: '1.5 Months',
    level: 'Beginner to Intermediate',
    students: '900+ Students',
    rating: '4.7 Rating',
    tag: '',
  },
  {
    title: 'Data Science Basics',
    description: 'Start your journey into data analysis and AI',
    duration: '2 Months',
    level: 'Intermediate',
    students: '700+ Students',
    rating: '4.6 Rating',
    tag: '',
  },
];

export default function Home() {
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
            description: 'Learn practical coding and tech skills with real projects.',
          }),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Learn Coding and Tech Skills
          </span>
          <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Get Job-Ready Skills, Not Just Certificates
          </h1>
          <p className="mt-5 text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
            Learn practical coding and tech skills with real-world projects, step by step.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-purple-700 hover:scale-[1.02] transition duration-300"
            >
              Start Learning Free
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-9 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-blue-900 transition duration-300"
            >
              Explore Courses
            </Link>
          </div>
          <div className="mt-6 text-sm text-white/85">
            1000+ Students • 4.8 Rating
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Courses
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Our Popular Courses</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Clear, practical courses designed to get you hired faster.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popularCourses.map((course) => (
              <div key={course.title} className="group bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(15,23,42,0.6)] transition duration-300">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {course.tag ? (
                    <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
                      {course.tag}
                    </span>
                  ) : null}
                  <div className="h-full w-full bg-gradient-to-br from-blue-50 to-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-slate-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-700">
                    <div><span className="font-semibold text-slate-900">Duration:</span> {course.duration}</div>
                    <div><span className="font-semibold text-slate-900">Level:</span> {course.level}</div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{course.students}</span>
                    <span>{course.rating}</span>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/courses"
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition duration-300"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition duration-300"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Us?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md">
              <div className="text-sm font-semibold">Beginner Friendly Learning</div>
              <div className="text-sm text-slate-600">Step-by-step guidance for absolute beginners.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md">
              <div className="text-sm font-semibold">Real-World Projects</div>
              <div className="text-sm text-slate-600">Build practical projects used in real jobs.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md">
              <div className="text-sm font-semibold">Simple and Easy Explanation</div>
              <div className="text-sm text-slate-600">Learn without confusion or overload.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md">
              <div className="text-sm font-semibold">Career-Focused Skills</div>
              <div className="text-sm text-slate-600">Skills aligned with hiring requirements.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md">
              <div className="text-sm font-semibold">Affordable Courses</div>
              <div className="text-sm text-slate-600">High value learning at a fair price.</div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition duration-300"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Emotional Line */}
      <section className="py-10 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-700 text-lg">
          We do not just teach skills - we help you build your future.
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">What Our Students Say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md">
              <p className="text-slate-600">
                "This platform made coding so easy for me. I got my first freelance project within 2 months!"
              </p>
              <div className="mt-3 text-sm font-semibold">Rahul Sharma</div>
              <div className="text-xs text-slate-500">Rating: 5/5</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md">
              <p className="text-slate-600">
                "Best learning experience! Simple explanation and practical projects helped me a lot."
              </p>
              <div className="mt-3 text-sm font-semibold">Aman Verma</div>
              <div className="text-xs text-slate-500">Rating: 5/5</div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition duration-300"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Get in Touch</h2>
            <p className="mt-3 text-slate-600">
              Have questions? We are here to help you start your journey.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
                <button
                  type="button"
                  className="w-full rounded-full bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md bg-white">
              <h3 className="text-lg font-semibold text-slate-900">Quick support</h3>
              <p className="mt-2 text-sm text-slate-600">Or contact us on WhatsApp for quick support.</p>
              <div className="mt-4 text-sm text-slate-600">
                WhatsApp: +91 90000 00000
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Email: support@kalchakra.academy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Your Career Starts Here</h2>
          <p className="mt-3 text-white/85">
            Do not wait. Start learning today and build your future.
          </p>
          <div className="mt-6">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition duration-300"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
