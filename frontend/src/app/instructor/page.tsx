'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  previewVideo?: string;
  modules?: Array<{ _id: string; title: string }>;
};

export default function InstructorPanel() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    level: 'beginner',
    duration: 1,
    thumbnail: '',
    previewVideo: '',
  });

  const [moduleForm, setModuleForm] = useState({ title: '', order: 1 });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoUrl: '',
    duration: 5,
    order: 1,
    isPreview: false,
  });
  const [quizForm, setQuizForm] = useState({
    title: '',
    passingScore: 70,
    questionsJson: '',
  });

  const fetchInstructorCourses = async () => {
    if (!user) return;
    const res = await api.get(`/courses/instructor/${user.id}`);
    setCourses(res.data.data || []);
  };

  const fetchCourseDetail = async (courseId: string) => {
    if (!courseId) return;
    const res = await api.get(`/courses/${courseId}`);
    setCourseDetail(res.data.data);
    setSelectedModuleId('');
  };

  useEffect(() => {
    if (user) {
      fetchInstructorCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseDetail(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleCreateCourse = async () => {
    setLoading(true);
    try {
      await api.post('/courses', { ...courseForm, isPublished: false });
      await fetchInstructorCourses();
      setCourseForm({
        title: '',
        description: '',
        price: 0,
        category: '',
        level: 'beginner',
        duration: 1,
        thumbnail: '',
        previewVideo: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      await api.post('/modules', {
        courseId: selectedCourseId,
        title: moduleForm.title,
        order: moduleForm.order,
      });
      await fetchCourseDetail(selectedCourseId);
      setModuleForm({ title: '', order: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedModuleId) return;
    setLoading(true);
    try {
      await api.post('/lessons', {
        moduleId: selectedModuleId,
        ...lessonForm,
      });
      if (selectedCourseId) {
        await fetchCourseDetail(selectedCourseId);
      }
      setLessonForm({
        title: '',
        videoUrl: '',
        duration: 5,
        order: 1,
        isPreview: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const questions = quizForm.questionsJson ? JSON.parse(quizForm.questionsJson) : [];
      await api.post('/quizzes', {
        courseId: selectedCourseId,
        title: quizForm.title,
        passingScore: quizForm.passingScore,
        questions,
      });
      setQuizForm({ title: '', passingScore: 70, questionsJson: '' });
    } catch {
      // Invalid JSON or server error
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Please login to access instructor tools.
      </div>
    );
  }

  if (user.role !== 'instructor' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Instructor access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Instructor Panel</h1>
            <p className="text-slate-600">Create courses, upload lessons, and manage content.</p>
          </div>
          <div className="text-sm text-slate-500">Signed in as {user.email}</div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold">Create a new course</h2>
            <div className="mt-4 grid gap-3">
              <input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Course title"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Course description"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  placeholder="Price"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                />
                <input
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: Number(e.target.value) })}
                  placeholder="Duration (hours)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  placeholder="Category"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                />
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <input
                value={courseForm.thumbnail}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                placeholder="Thumbnail URL"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <input
                value={courseForm.previewVideo}
                onChange={(e) => setCourseForm({ ...courseForm, previewVideo: e.target.value })}
                placeholder="Preview video URL"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <button
                onClick={handleCreateCourse}
                disabled={loading}
                className="w-full rounded-full bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition duration-300"
              >
                {loading ? 'Saving...' : 'Create course'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold">Manage course content</h2>
            <div className="mt-4 space-y-4">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              {courseDetail && (
                <>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="font-semibold">Add module</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        placeholder="Module title"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                      />
                      <input
                        type="number"
                        value={moduleForm.order}
                        onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })}
                        placeholder="Order"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <button
                      onClick={handleCreateModule}
                      className="mt-3 w-full rounded-full bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 transition duration-300"
                    >
                      Add module
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="font-semibold">Add lesson</h3>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="mt-3 w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="">Select module</option>
                      {courseDetail.modules?.map((module) => (
                        <option key={module._id} value={module._id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3 grid gap-3">
                      <input
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="Lesson title"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                      />
                      <input
                        value={lessonForm.videoUrl}
                        onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                        placeholder="Video URL"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="number"
                          value={lessonForm.duration}
                          onChange={(e) => setLessonForm({ ...lessonForm, duration: Number(e.target.value) })}
                          placeholder="Duration (min)"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                        />
                        <input
                          type="number"
                          value={lessonForm.order}
                          onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                          placeholder="Order"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={lessonForm.isPreview}
                          onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                        />
                        Preview lesson
                      </label>
                      <button
                        onClick={handleCreateLesson}
                        className="w-full rounded-full bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 transition duration-300"
                      >
                        Add lesson
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="font-semibold">Add quiz</h3>
                    <div className="mt-3 grid gap-3">
                      <input
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        placeholder="Quiz title"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                      />
                      <input
                        type="number"
                        value={quizForm.passingScore}
                        onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
                        placeholder="Passing score"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                      />
                      <textarea
                        value={quizForm.questionsJson}
                        onChange={(e) => setQuizForm({ ...quizForm, questionsJson: e.target.value })}
                        placeholder='Questions JSON: [{"prompt":"Q?","options":["A","B"],"correctIndex":0}]'
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                        rows={4}
                      />
                      <button
                        onClick={handleCreateQuiz}
                        className="w-full rounded-full bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 transition duration-300"
                      >
                        Add quiz
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
