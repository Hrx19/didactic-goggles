import { useState } from 'react'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1E1B4B]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        <a href="#home" className="flex items-center gap-3 text-white">
          <div className="grid h-12 w-12 place-items-center rounded-3xl bg-[#3B82F6]/15 text-2xl font-semibold text-[#3B82F6] shadow-glow">
            K
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Kalchakra</p>
            <p className="text-lg font-semibold">Learning Academy</p>
          </div>
        </a>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-white/15 p-3 text-white transition hover:border-white/30 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>

        <nav className={`absolute left-0 right-0 top-full z-40 overflow-hidden bg-[#1E1B4B]/95 transition-all duration-300 md:static md:mx-6 md:flex md:max-w-none md:items-center md:gap-8 md:bg-transparent md:p-0 ${isOpen ? 'max-h-80 border-b border-white/10 py-4' : 'max-h-0'}`}>
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 md:flex-row md:px-0">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-white/80 transition hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="#contact" className="btn-secondary w-full text-center md:w-auto">
              Contact us
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
