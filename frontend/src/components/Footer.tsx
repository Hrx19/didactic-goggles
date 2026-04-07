import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div>
            <div className="text-lg font-semibold text-slate-900">Kalchakra Learning Academy</div>
            <p className="mt-3 text-sm text-slate-600">
              Learn practical skills with structured programs, mentorship, and real-world projects.
            </p>
            <div className="mt-4 text-sm text-slate-600">
              <div>Phone: +91 90000 00000</div>
              <div>Email: support@kalchakra.academy</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Platform</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-slate-900">Home</Link></li>
              <li><Link href="/courses" className="hover:text-slate-900">Courses</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
              <li><Link href="/instructor" className="hover:text-slate-900">Instructor</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/about" className="hover:text-slate-900">About</Link></li>
              <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-slate-900">Terms</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Support</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/forgot-password" className="hover:text-slate-900">Reset Password</Link></li>
              <li><Link href="/login" className="hover:text-slate-900">Login</Link></li>
              <li><Link href="/register" className="hover:text-slate-900">Signup</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Social</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">YouTube</a></li>
              <li>
                <a
                  href="https://www.instagram.com/iamharish__rana?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  className="hover:text-slate-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li><a href="#" className="hover:text-slate-900">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 text-xs text-slate-500">
          (c) {new Date().getFullYear()} Kalchakra Learning Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
