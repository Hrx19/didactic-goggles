'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  duration: number;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setError('');
      const res = await api.get('/courses');
      setCourses(res.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Unable to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(courses.map(course => course.category))];

  return (
    <div className="min-h-screen py-12 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">All Courses</h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Explore our comprehensive collection of programming courses designed for all skill levels
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 border border-slate-200 rounded-full bg-white text-slate-900 placeholder-slate-500 shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-5 py-3 border border-slate-200 rounded-full bg-white text-slate-900 shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : error ? (
          <div className="text-center py-12 text-slate-600">
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
            {filteredCourses.map((course) => (
              <div key={course._id} className="group bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-2xl transition duration-300">
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-slate-500">
                      <span>Instructor: {course.instructor.name}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {course.duration} hours
                    </div>
                  </div>
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
              </div>
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}


