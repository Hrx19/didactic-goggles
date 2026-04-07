import Link from 'next/link';

export default function FloatingSocial() {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Link
        href="https://www.instagram.com/iamharish__rana?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition duration-300"
      >
        IG
      </Link>
    </div>
  );
}
