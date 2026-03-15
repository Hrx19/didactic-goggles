'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import { toast } from 'react-toastify';

type Quiz = {
  _id: string;
  title: string;
  passingScore: number;
  questions: Array<{
    prompt: string;
    options: string[];
  }>;
};

export default function CourseQuiz() {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/course/${courseId}`);
        setQuiz(res.data.data);
      } catch {
        toast.error('Unable to load quiz');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) loadQuiz();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      const res = await api.post(`/quizzes/${quiz._id}/submit`, { answers });
      const attempt = res.data.data.attempt;
      setResult({ score: attempt.score, passed: attempt.passed });
      if (attempt.passed) {
        toast.success('You passed the quiz and earned a certificate.');
      } else {
        toast.info('Try again to reach the passing score.');
      }
    } catch {
      toast.error('Unable to submit quiz');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>;
  }

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Quiz not available.</div>;
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
          <h1 className="text-2xl font-semibold">{quiz.title}</h1>
          <p className="mt-2 text-sm text-slate-600">Passing score: {quiz.passingScore}%</p>

          <div className="mt-6 space-y-6">
            {quiz.questions.map((q, idx) => (
              <div key={`${q.prompt}-${idx}`}>
                <div className="font-medium">{idx + 1}. {q.prompt}</div>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt, optIndex) => (
                    <label key={`${idx}-${optIndex}`} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name={`question-${idx}`}
                        checked={answers[idx] === optIndex}
                        onChange={() => {
                          const next = [...answers];
                          next[idx] = optIndex;
                          setAnswers(next);
                        }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full rounded-full bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition duration-300"
          >
            Submit quiz
          </button>

          {result && (
            <div className="mt-6 text-sm text-slate-600">
              Score: {result.score}% — {result.passed ? 'Passed' : 'Not passed'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
