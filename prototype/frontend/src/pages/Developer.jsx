import useReveal from '../components/useReveal'

// ── Team data — fill in pic, github, linkedin URLs ──────────────────────────
const TEAM = [
  {
    name:      'Rahul Kumar',
    role:      'Founder · Full-Stack, DevOps & Deployment',
    bio:       'Rahul built DeployHub from the ground up — the deployment engine, CI/CD pipelines, container runtime, request tracking, and the small part of frontend UI. He handles both the code and the infrastructure that keeps everything running.',
    pic:       'https://api-devload.cloudcoderhub.in/public/695f91881242b7ee566ffeea/176787154576659db7e7e05eb043d7fee2d91.jpeg',
    github:    'https://github.com/rahulkumar6777',           
    linkedin:  '',       
    skills:    ['Node.js', 'React', 'Docker', 'Nginx', 'CI/CD', 'Linux', 'mongodb', 'Tailwind CSS'],
    isLead:    true,
  },
  {
    name:      'Manjeet Shaw',
    role:      'Backend Developer',
    bio:       'Manjeet builds and maintains the backend APIs and server logic. He loves clean architecture and making sure every endpoint is fast and reliable.',
    pic:       'https://avatars.githubusercontent.com/u/180094698?v=4',
    github:    'https://github.com/ManjeetShaw',
    linkedin:  '',
    skills:    ['Node.js', 'Express', 'mongodb', 'REST APIs'],
    isLead:    false,
  },
  {
    name:      'Karishma Choudhary',
    role:      'Backend Developer',
    bio:       'Karishma owns the auth + user management layer. She ensures that signups, logins, permissions, and security are rock solid.',
    pic:       '',
    github:    'https://github.com/karyshmaa',
    linkedin:  '',
    skills:    ['Spring Boot', 'PostgreSQL', 'API Design'],
    isLead:    false,
  },
  {
    name:      'Kunal Kumar Rajak',
    role:      'Frontend Developer',
    bio:       'Kunal translates designs into clean, responsive React interfaces. He focuses on component architecture and making sure the UI feels fast and smooth.',
    pic:       '',
    github:    'https://github.com/Kunalcoder71',
    linkedin:  '',
    skills:    ['React', 'Tailwind CSS', 'JavaScript', 'Figma'],
    isLead:    false,
  },
  {
    name:      'Divya Das',
    role:      'UI / Frontend Developer',
    bio:       'Divya crafts the visual experience of DeployHub. Every animation, color, and layout decision goes through her eye for design and detail.',
    pic:       '',
    github:    'https://github.com/divya240918',
    linkedin:  '',
    skills:    ['React', 'Tailwind CSS', 'Figma', 'CSS Animations', 'UI Design'],
    isLead:    false,
  },
]

const DEV_STATS = [
  { n: '5',     l: 'Team Members' },
  { n: '2.8k+', l: 'Projects Hosted' },
  { n: '99.9%', l: 'Uptime' },
  { n: '∞',     l: 'Passion' },
]

// ── Avatar — shows pic if URL given, else initials ───────────────────────────
function Avatar({ name, pic, size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'lg'
    ? 'w-24 h-24 text-3xl rounded-2xl'
    : 'w-14 h-14 text-lg rounded-xl'

  if (pic) {
    return (
      <img
        src={pic}
        alt={name}
        className={`${sz} object-cover shadow-xl flex-shrink-0`}
      />
    )
  }
  return (
    <div className={`${sz} bg-gradient-to-br from-[#00e5ff] to-[#7c3aed] flex items-center justify-center font-syne font-black text-white shadow-xl flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ── Social link button ────────────────────────────────────────────────────────
function SocialBtn({ href, label, icon }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
    >
      {icon}
      {label}
    </a>
  )
}

// ── GitHub icon ───────────────────────────────────────────────────────────────
const GithubIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

// ── LinkedIn icon ─────────────────────────────────────────────────────────────
const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

// ── Lead developer card (big, featured) ──────────────────────────────────────
function LeadCard({ dev }) {
  return (
    <div className="reveal relative bg-[#111827] border-2 border-[#00e5ff]/40 rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-cyan-500/10">
      {/* Top gradient bar */}
      <div className="h-2 bg-gradient-to-r from-[#00e5ff] via-[#7c3aed] to-[#00e5ff]" />

      {/* Founder badge */}
      <div className="absolute top-6 right-6">
        <span className="bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
          Lead Builder
        </span>
      </div>

      <div className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar name={dev.name} pic={dev.pic} size="lg" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="font-syne font-black text-3xl md:text-4xl mb-1">{dev.name}</h2>
            <div className="text-[#00e5ff] text-sm font-semibold tracking-wide mb-4">{dev.role}</div>
            <p className="text-gray-400 leading-relaxed mb-6 font-light max-w-2xl">{dev.bio}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {dev.skills.map(s => (
                <span key={s} className="bg-[#00e5ff]/10 border border-[#00e5ff]/20 text-[#00e5ff] text-xs px-3 py-1.5 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3 flex-wrap">
              <SocialBtn href={dev.github}   label="GitHub"   icon={<GithubIcon />} />
              <SocialBtn href={dev.linkedin} label="LinkedIn" icon={<LinkedinIcon />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Regular team member card ──────────────────────────────────────────────────
function MemberCard({ dev, delay }) {
  return (
    <div
      className="reveal bg-[#111827] border border-white/5 rounded-2xl p-6 hover:border-[#00e5ff]/30 transition-all duration-300 hover:-translate-y-1"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Top row */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar name={dev.name} pic={dev.pic} size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-syne font-bold text-base leading-tight mb-0.5 truncate">{dev.name}</h3>
          <div className="text-[#00e5ff] text-xs font-medium">{dev.role}</div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{dev.bio}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {dev.skills.map(s => (
          <span key={s} className="bg-white/5 border border-white/10 text-gray-400 text-xs px-2.5 py-1 rounded-full">
            {s}
          </span>
        ))}
      </div>

      {/* Social links */}
      <div className="flex gap-2">
        <SocialBtn href={dev.github}   label="GitHub"   icon={<GithubIcon />} />
        <SocialBtn href={dev.linkedin} label="LinkedIn" icon={<LinkedinIcon />} />
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Developer() {
  useReveal()

  const lead    = TEAM.find(d => d.isLead)
  const members = TEAM.filter(d => !d.isLead)

  return (
    <div className="min-h-screen pt-24">
      <section className="py-20 px-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="reveal mb-2">
          <span className="text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase">
            The Team
          </span>
        </div>
        <div className="reveal mb-12">
          <h1 className="font-syne font-black text-5xl md:text-6xl tracking-tight mb-3">
            People behind<br /><span className="grad-text">DeployHub.</span>
          </h1>
          <p className="text-gray-500 max-w-lg font-light">
            5 developers. One mission — make hosting stupidly simple.
          </p>
        </div>

        {/* Lead developer — featured card */}
        {lead && <LeadCard dev={lead} />}

        {/* Rest of the team — grid */}
        <h2 className="reveal font-syne font-black text-2xl mb-6 mt-4">Rest of the team</h2>
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {members.map((dev, i) => (
            <MemberCard key={dev.name} dev={dev} delay={i * 80} />
          ))}
        </div>

        {/* Stats */}
        <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEV_STATS.map(stat => (
            <div key={stat.l} className="bg-[#111827] border border-white/5 rounded-xl p-5 text-center">
              <div className="font-syne font-black text-3xl text-[#00e5ff] mb-1">{stat.n}</div>
              <div className="text-xs text-gray-500">{stat.l}</div>
            </div>
          ))}
        </div>

      </section>
    </div>
  )
}