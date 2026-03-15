export const metadata = {
  title: 'Privacy Policy | Kalchakra Learning Academy',
  description: 'Privacy policy for Kalchakra Learning Academy.',
};

export default function Privacy() {
  return (
    <div className="min-h-screen text-slate-900">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-slate-600">
            We respect your privacy. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <p>We collect basic account information to deliver courses and improve the learning experience.</p>
            <p>We do not sell your personal data to third parties.</p>
            <p>You can request deletion of your account by contacting support.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
