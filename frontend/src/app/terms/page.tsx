export const metadata = {
  title: 'Terms of Service | Kalchakra Learning Academy',
  description: 'Terms of service for Kalchakra Learning Academy.',
};

export default function Terms() {
  return (
    <div className="min-h-screen text-slate-900">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="mt-4 text-slate-600">
            By using this platform you agree to follow our community guidelines and respect intellectual property.
          </p>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <p>Course content is licensed for personal learning use only.</p>
            <p>Payment refunds follow the policy listed at checkout.</p>
            <p>We reserve the right to suspend accounts that violate our terms.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
