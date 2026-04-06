'use client';

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'react-toastify';

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
  duration: number;
  previewVideo: string;
  modules: Array<{
    _id: string;
    title: string;
    lessons: Array<{
      _id: string;
      title: string;
      duration: number;
      isPreview: boolean;
    }>;
  }>;
  enrolledStudents: string[];
}

const toEmbedUrl = (url?: string) => {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    // youtu.be/<id>
    if (parsed.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }

    // youtube.com/watch?v=<id>
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch' && parsed.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`;
      }
      // youtube.com/shorts/<id>
      if (parsed.pathname.startsWith('/shorts/')) {
        return `https://www.youtube.com/embed/${parsed.pathname.split('/').pop()}`;
      }
      // already embed or other path
      if (parsed.pathname.startsWith('/embed/')) {
        return url;
      }
    }

    return url;
  } catch {
    return url;
  }
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export default function CourseDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    if (course && user) {
      setEnrolled(course.enrolledStudents.includes(user.id));
    }
  }, [course, user]);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id, fetchCourse]);

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase courses');
      return;
    }
    if (!course) {
      toast.error('Course details are missing.');
      return;
    }
    if (!razorpayReady || typeof window === 'undefined' || !window.Razorpay) {
      toast.error('Payment system is still loading. Please try again in a moment.');
      return;
    }

    try {
      // Create order
      const orderRes = await api.post('/payment/create-order', {
        courseId: course._id,
      });

      const { order, key } = orderRes.data;

      // Initialize Razorpay
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Kalchakra Learning Academy',
        description: `Purchase ${course.title}`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success('Payment successful! Course unlocked.');
            setEnrolled(true);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#0f172a',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Payment failed';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
        onError={() => setRazorpayReady(false)}
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm border border-white/20">
                  {course.category}
                </span>
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm border border-white/20">
                  {course.level}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-lg sm:text-xl mb-6 text-white/80">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <span className="text-xs uppercase tracking-wide text-white/60 mr-2">Instructor</span>
                  <span className="font-semibold">{course.instructor.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs uppercase tracking-wide text-white/60 mr-2">Duration</span>
                  <span className="font-semibold">{course.duration} hours</span>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-6">INR {course.price}</div>
              {enrolled ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard"
                    className="bg-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-600 transition duration-300"
                  >
                    Go to Course
                  </Link>
                  <Link
                    href={`/quiz/${course._id}`}
                    className="bg-white/10 text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-slate-900 transition duration-300"
                  >
                    Take Quiz
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  className="bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition duration-300"
                >
                  Enroll Now
                </button>
              )}
            </div>
            <div>
              <img
                src={course.thumbnail || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Preview Video */}
            {course.previewVideo && (
              <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Course Preview</h2>
                <div className="aspect-video">
                  <iframe
                    src={toEmbedUrl(course.previewVideo)}
                    className="w-full h-full rounded-xl"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
              <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module._id} className="border border-slate-200 rounded-xl">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-semibold">Module {moduleIndex + 1}: {module.title}</h3>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson._id} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-slate-500 mr-3">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </span>
                            <span className={enrolled || lesson.isPreview ? 'text-slate-900' : 'text-slate-500'}>
                              {lesson.title}
                              {lesson.isPreview && <span className="ml-2 text-teal-700 text-sm">(Preview)</span>}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-slate-500">
                            <span className="mr-4">Duration: {lesson.duration} min</span>
                            {enrolled || lesson.isPreview ? (
                              <span className="text-emerald-600">Available</span>
                            ) : (
                              <span className="text-slate-400">Locked</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Course Includes</h3>
              <ul className="space-y-3 text-slate-700">
                <li>{course.duration} hours of video content</li>
                <li>Downloadable resources</li>
                <li>Certificate of completion</li>
                <li>Lifetime access</li>
                <li>Mobile and TV access</li>
              </ul>

              {!enrolled && (
                <button
                  onClick={handlePayment}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold mt-6 hover:bg-slate-800 transition duration-300"
                >
                  Enroll for INR {course.price}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






