import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

const courses = [
  {
    title: 'Web Development Bootcamp',
    description: 'Master modern frontend and backend workflows with a portfolio of production-ready apps.',
    duration: '14 weeks',
    level: 'Beginner → Advanced',
    students: '1280+',
    rating: '4.9⭐',
    tag: 'Bestseller',
    accent: 'blue',
  },
  {
    title: 'AI & Machine Learning',
    description: 'Build intelligent systems, automate insights, and launch AI products with hands-on labs.',
    duration: '10 weeks',
    level: 'Intermediate',
    students: '940+',
    rating: '4.8⭐',
    tag: 'Most Popular',
    accent: 'cyan',
  },
  {
    title: 'Data Science Mastery',
    description: 'Learn analytics, ML pipelines, and storytelling from real data challenges.',
    duration: '12 weeks',
    level: 'Beginner → Intermediate',
    students: '1100+',
    rating: '4.9⭐',
    tag: 'Premium',
    accent: 'yellow',
  },
]

const testimonials = [
  {
    name: 'Ananya Rao',
    role: 'Frontend Developer',
    quote:
      'Kalchakra gave me a structured roadmap and direct mentor feedback. I landed interviews within six weeks.',
  },
  {
    name: 'Rohit Mehta',
    role: 'Data Analyst',
    quote:
      'The projects felt like real client work. My portfolio finally looks professional.',
  },
  {
    name: 'Sana Khan',
    role: 'Product Designer',
    quote:
      'The mix of live sessions and self-paced content kept me consistent. The community is strong.',
  },
]

const features = [
  {
    title: 'Beginner Friendly',
    description: 'Start from scratch with clear pathways and supportive coaching.',
    icon: '🪄',
  },
  {
    title: 'Real Projects',
    description: 'Build portfolio-grade work that shows what you can do.',
    icon: '🧩',
  },
  {
    title: 'Career Focused',
    description: 'Interview prep, resume coaching, and job-ready outcomes.',
    icon: '🚀',
  },
  {
    title: 'Simple Learning',
    description: 'Short lessons, repeatable practice, and fewer distractions.',
    icon: '🧠',
  },
  {
    title: 'Affordable Courses',
    description: 'Premium support without premium complexity or hidden fees.',
    icon: '💎',
  },
]

function App() {
  const [formStatus, setFormStatus] = useState(null)

  return (
    <div className="relative overflow-hidden bg-[#1E1B4B] text-slate-100">
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3B82F6]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-64 h-72 w-72 rounded-full bg-[#FACC15]/10 blur-3xl" />
      <div className="pointer-events-none absolute left-10 top-[520px] h-40 w-40 rounded-full bg-[#8b5cf6]/15 blur-3xl" />

      <Navbar />

      <main>
        <section id="home" className="section pt-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 shadow-soft backdrop-blur">
                  <span className="rounded-full bg-[#3B82F6]/15 px-3 py-1 text-[#3B82F6]">Futuristic learning</span>
                  <span>Premium experiences for future-ready careers</span>
                </div>
                <div className="space-y-6">
                  <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                    From Beginner to Future-Ready 🚀
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-200/90 sm:text-xl">
                    Learn real skills with simple, practical, step-by-step learning designed for modern careers.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a href="#contact" className="btn-primary w-full sm:w-auto">Start Learning Now</a>
                  <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 shadow-soft">
                    1000+ Students • 4.8⭐ Rating
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#16123a]/80 p-8 shadow-soft">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.18),_transparent_34%)]" />
                <div className="relative space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-[#0f0b2b]/90 p-6 shadow-soft">
                    <p className="text-sm uppercase tracking-[0.35em] text-[#FACC15]">Premium experience</p>
                    <h2 className="mt-4 text-3xl font-semibold text-white">Kalchakra Learning Academy</h2>
                    <p className="mt-3 text-slate-200/80">
                      A cosmic-styled learning platform with modern workflows, live support, and career acceleration for ambitious learners.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Live classes', value: 'Weekly' },
                      { label: 'Mentorship', value: 'Expert led' },
                      { label: 'Projects', value: 'Real world' },
                      { label: 'Support', value: '24/7' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl bg-[#140f2e]/90 p-4 border border-white/5">
                        <p className="text-sm text-slate-400">{item.label}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="courses" className="section">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="section-kicker">Courses</p>
              <h2 className="section-title">Future-ready learning tracks</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300/80">
                Choose a modern course path built around real projects, industry insights, and career growth.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <div key={course.title} className="card overflow-hidden border-white/10 bg-[#191540]/90 transition duration-500 hover:-translate-y-2 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-[#93c5fd]">{course.tag}</p>
                      <h3 className="mt-4 text-2xl font-semibold text-white">{course.title}</h3>
                    </div>
                    <div className={`rounded-3xl px-3 py-2 text-sm ${
                      course.accent === 'blue'
                        ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                        : course.accent === 'cyan'
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                        : 'bg-[#FACC15]/15 text-[#FACC15]'
                    }`}>
                      {course.tag}
                    </div>
                  </div>
                  <p className="mt-5 text-slate-300/80">{course.description}</p>
                  <div className="mt-6 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                    <span>Duration: {course.duration}</span>
                    <span>Level: {course.level}</span>
                    <span>Students: {course.students}</span>
                    <span>Rating: {course.rating}</span>
                  </div>
                  <button className="btn-primary mt-8 w-full">Enroll Now</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="section-kicker">Why choose us</p>
              <h2 className="section-title">Designed for faster career growth</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="card border-white/10 bg-[#16123d]/90 p-6 transition duration-500 hover:-translate-y-1 hover:shadow-soft">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#3B82F6]/10 text-3xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-slate-300/80">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="section">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="section-kicker">Testimonials</p>
                <h2 className="section-title mt-4">What our students say</h2>
              </div>
              <a className="btn-secondary" href="#contact">Talk to an advisor</a>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.name} className="card border-white/10 bg-[#16123d]/95 p-6 transition duration-500 hover:-translate-y-1 hover:shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-slate-400">{item.role}</p>
                    </div>
                    <div className="rounded-3xl bg-[#3B82F6]/10 px-3 py-2 text-sm text-[#3B82F6]">★★★★★</div>
                  </div>
                  <p className="mt-5 text-slate-300/80">“{item.quote}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[#16123d]/95 p-10 shadow-soft text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[#FACC15]">Our promise</p>
            <h2 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              We don’t just teach skills — we help you build your future.
            </h2>
          </div>
        </section>

        <section id="final-cta" className="section">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[#16123d]/95 p-10 shadow-soft">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#3B82F6]">Your future starts now</p>
                <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                  Your Future Starts Now 🚀
                </h2>
              </div>
              <a className="btn-primary w-full sm:w-auto" href="#contact">Join Now</a>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_0.85fr]">
              <div className="rounded-[2rem] border border-white/10 bg-[#16123d]/95 p-8 shadow-soft">
                <p className="section-kicker">Contact</p>
                <h2 className="section-title">Start a conversation with our team</h2>
                <p className="mt-4 text-slate-300/80">
                  Have a question? Send us a message or connect on WhatsApp for a fast response.
                </p>
                <div className="mt-8 space-y-4 text-slate-200/90">
                  <p>📞 WhatsApp: <a className="text-[#3B82F6] hover:text-[#60a5fa]" href="https://wa.me/919999999999?text=Hi%20Kalchakra%20Learning%20Academy">+91 99999 99999</a></p>
                  <p>✉️ Email: <a className="text-[#3B82F6] hover:text-[#60a5fa]" href="mailto:hello@kalchakra.academy">hello@kalchakra.academy</a></p>
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  setFormStatus('success')
                  event.currentTarget.reset()
                }}
                className="rounded-[2rem] border border-white/10 bg-[#110e2f]/95 p-8 shadow-soft"
              >
                <div className="grid gap-5">
                  <label className="block text-sm font-medium text-slate-200">
                    Name
                    <input name="name" required className="input mt-3" placeholder="Enter your name" />
                  </label>
                  <label className="block text-sm font-medium text-slate-200">
                    Email
                    <input type="email" name="email" required className="input mt-3" placeholder="you@example.com" />
                  </label>
                  <label className="block text-sm font-medium text-slate-200">
                    Message
                    <textarea name="message" rows="5" required className="input mt-3 resize-none" placeholder="Tell us what you want to learn" />
                  </label>
                </div>
                <button className="btn-primary mt-7 w-full">Send Message</button>
                {formStatus === 'success' && (
                  <p className="mt-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">Thanks! Your message has been sent.</p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
