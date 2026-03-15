'use client';

import { useState, useEffect, useCallback } from 'react';
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

    try {
      // Create order
      const orderRes = await api.post('/payment/create-order', {
        courseId: course!._id,
      });

      const { order, key } = orderRes.data;

      // Initialize Razorpay
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Kalchakra Learning Academy',
        description: `Purchase ${course!.title}`,
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
          color: '#3B82F6',
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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm">
                  {course.category}
                </span>
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                  {course.level}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-lg sm:text-xl mb-6 text-white/80">{course.description}</p>
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👨‍🏫</span>
                  <span>{course.instructor.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">⏱️</span>
                  <span>{course.duration} hours</span>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-6">₹{course.price}</div>
              {enrolled ? (
                <Link
                  href="/dashboard"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
                >
                  Go to Course
                </Link>
              ) : (
                <button
                  onClick={handlePayment}
                  className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition duration-300"
                >
                  Enroll Now
                </button>
              )}
            </div>
            <div>
              <img
                src={course.thumbnail || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full rounded-lg shadow-lg"
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
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Course Preview</h2>
                <div className="aspect-video">
                  <iframe
                    src={toEmbedUrl(course.previewVideo)}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module._id} className="border border-slate-200 rounded-lg">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-semibold">Module {moduleIndex + 1}: {module.title}</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
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
                            <span className="mr-4">⏱️ {lesson.duration} min</span>
                            {enrolled || lesson.isPreview ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-slate-400">🔒</span>
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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Course Includes</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  <span>{course.duration} hours of video content</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  <span>Downloadable resources</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  <span>Certificate of completion</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  <span>Lifetime access</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  <span>Mobile and TV access</span>
                </li>
              </ul>

              {!enrolled && (
                <button
                  onClick={handlePayment}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold mt-6 hover:bg-slate-800 transition duration-300"
                >
                  Enroll for ₹{course.price}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


