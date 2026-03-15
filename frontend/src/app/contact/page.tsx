export const metadata = {
  title: 'Contact | Kalchakra Learning Academy',
  description: 'Get in touch with Kalchakra Learning Academy.',
};

export default function Contact() {
  return (
    <div className="min-h-screen text-slate-900">
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Contact
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold">We are here to help</h1>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Have questions about courses, instructors, or partnerships? Reach out and we will reply quickly.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
              <h3 className="text-lg font-semibold">Contact details</h3>
              <p className="mt-2 text-sm text-slate-600">Email: support@kalchakra.academy</p>
              <p className="mt-1 text-sm text-slate-600">Phone: +91 90000 00000</p>
              <p className="mt-1 text-sm text-slate-600">Hours: Mon–Sat, 9:00 AM – 7:00 PM</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6">
              <h3 className="text-lg font-semibold">Send a message</h3>
              <form className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900"
                />
                <textarea
                  placeholder="How can we help?"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-slate-900 focus:border-slate-900"
                />
                <button
                  type="button"
                  className="w-full rounded-full bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition duration-300"
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
