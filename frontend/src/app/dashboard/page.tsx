'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    name: string;
  };
  progress?: number; // For enrolled courses
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      // This would need a backend endpoint to get user's enrolled courses with progress
      // For now, we'll use the user's enrolledCourses array
      if (user?.enrolledCourses && user.enrolledCourses.length > 0) {
        const coursePromises = user.enrolledCourses.map((courseId: string) =>
          api.get(`/courses/${courseId}`)
        );
        const courseResponses = await Promise.all(coursePromises);
        const courses = courseResponses.map(res => res.data.data);
        const progressResponses = await Promise.all(
          courses.map((course) => api.get(`/progress/${course._id}`).catch(() => ({ data: { data: { progressPercent: 0 } } })))
        );
        const coursesWithProgress = courses.map((course, index) => ({
          ...course,
          progress: progressResponses[index].data.data?.progressPercent || 0,
        }));
        setEnrolledCourses(coursesWithProgress);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">Please login to access dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Enrolled Courses</p>
                <p className="text-2xl font-semibold text-slate-900">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-semibold text-slate-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-semibold text-slate-900">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">My Courses</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading your courses...</div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <div key={course._id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition duration-300">
                    <img
                      src={course.thumbnail || '/placeholder-course.jpg'}
                      alt={course.title}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">👨‍🏫 {course.instructor.name}</span>
                        <Link
                          href={`/learn/${course._id}`}
                          className="bg-slate-900 text-white px-3 py-1 rounded text-sm hover:bg-slate-800 transition duration-300"
                        >
                          Continue Learning
                        </Link>
                      </div>
                      {/* Progress bar would go here */}
                      <div className="mt-3">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-slate-900 h-2 rounded-full"
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{course.progress || 0}% complete</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses yet</h3>
                <p className="text-slate-600 mb-6">Start your learning journey by enrolling in a course</p>
                <Link
                  href="/courses"
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition duration-300"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

