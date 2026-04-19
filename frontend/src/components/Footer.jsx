export default function Footer() {
  return (
    <footer className="section border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-white">Kalchakra Learning Academy</p>
          <p className="mt-2 text-slate-400">Premium ed-tech with cosmic style and career-led learning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a className="transition hover:text-white" href="#home">Home</a>
          <a className="transition hover:text-white" href="#courses">Courses</a>
          <a className="transition hover:text-white" href="#about">About</a>
          <a className="transition hover:text-white" href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  )
}
