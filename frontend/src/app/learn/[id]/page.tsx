'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactPlayer from 'react-player';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

type Lesson = {
  _id: string;
  title: string;
  duration: number;
  isPreview: boolean;
  videoUrl?: string;
};

type Module = {
  _id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  _id: string;
  title: string;
  description: string;
  instructor: { name: string };
  thumbnail: string;
  modules: Module[];
  enrolledStudents: string[];
};

export default function LearnCourse() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);

  const isEnrolled = !!course && !!user && course.enrolledStudents?.includes(user.id);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data.data);
      } catch {
        toast.error('Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!id || !isAuthenticated) return;
      try {
        const res = await api.get(`/progress/${id}`);
        setProgressPercent(res.data.data?.progressPercent || 0);
      } catch {
        setProgressPercent(0);
      }
    };
    fetchProgress();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (course?.modules?.length) {
      const firstLesson = course.modules[0].lessons?.[0];
      setActiveLesson(firstLesson || null);
    }
  }, [course]);

  const handleSelectLesson = (lesson: Lesson) => {
    if (!isEnrolled && !lesson.isPreview) {
      toast.info('Enroll to access this lesson.');
      return;
    }
    setActiveLesson(lesson);
  };

  const handleProgressUpdate = async (lessonId?: string) => {
    if (!isAuthenticated || !lessonId) return;
    try {
      const res = await api.post(`/progress/${id}`, { lessonId, completed: true });
      setProgressPercent(res.data.data?.progressPercent || 0);
    } catch {
      toast.error('Unable to save progress.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Course not found.</div>;
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden">
              <div className="aspect-video bg-black">
                {activeLesson?.videoUrl ? (
                  <ReactPlayer
                    url={activeLesson.videoUrl}
                    width="100%"
                    height="100%"
                    controls
                    onEnded={() => handleProgressUpdate(activeLesson._id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    No lesson selected
                  </div>
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-semibold">{course.title}</h1>
                <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>Instructor: {course.instructor?.name || 'Instructor'}</span>
                  <span>Progress: {progressPercent}%</span>
                </div>
                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 h-fit">
            <h2 className="text-lg font-semibold">Course Lessons</h2>
            <div className="mt-4 space-y-4 max-h-[70vh] overflow-auto pr-2">
              {course.modules.map((module) => (
                <div key={module._id} className="border border-slate-200 rounded-xl">
                  <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">
                    {module.title}
                  </div>
                  <div className="divide-y divide-slate-200">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson._id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 ${
                          activeLesson?._id === lesson._id ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-900">{lesson.title}</span>
                          <span className="text-xs text-slate-500">{lesson.duration} min</span>
                        </div>
                        {!lesson.isPreview && !isEnrolled && (
                          <div className="text-xs text-slate-500 mt-1">Locked</div>
                        )}
                        {lesson.isPreview && (
                          <div className="text-xs text-teal-700 mt-1">Preview</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!isEnrolled && (
              <div className="mt-6 text-sm text-slate-600">
                Enroll to unlock all lessons.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
