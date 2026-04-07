import Link from 'next/link';

export default function FloatingSocial() {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Link
        href="https://www.instagram.com/iamharish__rana?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-800 transition duration-300"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M7 3c-2.2 0-4 1.8-4 4v10c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V7c0-2.2-1.8-4-4-4H7zm10 2c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h10zm-5 3.5A3.5 3.5 0 1 0 12 19a3.5 3.5 0 0 0 0-7zm0 2A1.5 1.5 0 1 1 10.5 12 1.5 1.5 0 0 1 12 10.5zm4.3-.9a.8.8 0 1 0 .8-.8.8.8 0 0 0-.8.8z" />
        </svg>
      </Link>
    </div>
  );
}
