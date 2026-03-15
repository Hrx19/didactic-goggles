export const metadata = {
  title: 'About | Kalchakra Learning Academy',
  description: 'Learn about Kalchakra Learning Academy and our mission.',
};

export default function About() {
  return (
    <div className="min-h-screen text-slate-900">
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              About
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold">Kalchakra Learning Academy</h1>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              We are building the most practical learning platform for career-ready skills. Our courses are designed
              by industry experts and structured to help learners build real products, not just watch videos.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
              <h3 className="text-lg font-semibold">Mission</h3>
              <p className="mt-2 text-sm text-slate-600">
                Deliver hands-on education that helps learners build careers and solve real-world problems.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
              <h3 className="text-lg font-semibold">Approach</h3>
              <p className="mt-2 text-sm text-slate-600">
                Structured tracks, mentorship, and projects aligned with current industry demands.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
              <h3 className="text-lg font-semibold">Community</h3>
              <p className="mt-2 text-sm text-slate-600">
                A supportive community of learners, instructors, and builders committed to growth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
