import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useInView, useAnimation, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import useReveal from '../components/useReveal'

const TEAM = [
  {
    name:     'Rahul Kumar',
    role:     'Founder · Full-Stack & DevOps',
    bio:      'Built DeployHub from scratch — the deployment engine, Docker pipeline, CI/CD, real-time log streaming, custom domain SSL automation, reverse proxy router, and dashboard. Both the code and the infrastructure.',
    pic:      'https://api-devload.cloudcoderhub.in/public/695f91881242b7ee566ffeea/176787154576659db7e7e05eb043d7fee2d91.jpeg',
    github:   'https://github.com/rahulkumar6777',
    linkedin: '',
    skills:   ['Node.js', 'React', 'Docker', 'Nginx', 'Redis', 'BullMQ', 'CI/CD', 'Linux'],
    isLead:   true,
  },
  {
    name:     'Karishma Choudhary',
    role:     'Backend Developer',
    bio:      'Owns auth and user management. Signups, logins, permissions, and security — all rock solid.',
    pic:      '',
    github:   'https://github.com/karyshmaa',
    linkedin: '',
    skills:   ['Spring Boot', 'PostgreSQL', 'API Design'],
    isLead:   false,
  },
  {
    name:     'Manjeet Shaw',
    role:     'Backend Developer',
    bio:      'Builds and maintains backend APIs and server logic. Clean architecture, fast endpoints.',
    pic:      'https://avatars.githubusercontent.com/u/180094698?v=4',
    github:   'https://github.com/ManjeetShaw',
    linkedin: '',
    skills:   ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
    isLead:   false,
  },
  {
    name:     'Kunal Kumar Rajak',
    role:     'Frontend Developer',
    bio:      'Translates designs into clean, responsive React interfaces. Fast components, smooth UX.',
    pic:      '',
    github:   'https://github.com/Kunalcoder71',
    linkedin: '',
    skills:   ['React', 'Tailwind CSS', 'JavaScript', 'Figma'],
    isLead:   false,
  },
  {
    name:     'Divya Das',
    role:     'UI / Frontend Developer',
    bio:      'Crafts the visual experience. Every animation, color, and layout decision goes through her eye for detail.',
    pic:      '',
    github:   'https://github.com/divya240918',
    linkedin: '',
    skills:   ['React', 'Tailwind CSS', 'Figma', 'CSS Animations', 'UI Design'],
    isLead:   false,
  },
]

const DEV_STATS = [
  { n: '5',     l: 'Team Members',    icon: '👥' },
  { n: '15d',   l: 'Prototype Built', icon: '⚡' },
  { n: '99.9%', l: 'Uptime',          icon: '📡' },
  { n: '∞',     l: 'Passion',         icon: '🔥' },
]

const GLITCH_CHARS = '!@#$%^&*<>?/\\|[]{}~`01'

// ── Cursor spotlight ──────────────────────────────────────────────────────────
function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -500, y: -500 })

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, #00e5ff09 0%, transparent 70%)`,
      }}
    />
  )
}

// ── Floating particles inside lead card ──────────────────────────────────────
function Particles({ count = 18 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id:    i,
      x:     Math.random() * 100,
      y:     Math.random() * 100,
      size:  Math.random() * 2.5 + 1,
      dur:   Math.random() * 8 + 6,
      delay: Math.random() * 5,
      dx:    (Math.random() - 0.5) * 30,
      dy:    (Math.random() - 0.5) * 30,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#00e5ff]"
          style={{
            left:   `${p.x}%`,
            top:    `${p.y}%`,
            width:  p.size,
            height: p.size,
            opacity: 0.18,
          }}
          animate={{
            x:       [0, p.dx, -p.dx * 0.5, 0],
            y:       [0, p.dy, -p.dy * 0.5, 0],
            opacity: [0.1, 0.35, 0.1],
            scale:   [1, 1.4, 1],
          }}
          transition={{
            duration: p.dur,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ── Glitch text ───────────────────────────────────────────────────────────────
function GlitchText({ text, className = '', active = false }) {
  const [display, setDisplay] = useState(text)
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    if (!active) return
    let frame = 0
    const total = 18
    setGlitching(true)

    const interval = setInterval(() => {
      frame++
      if (frame < total * 0.6) {
        // Scramble phase
        setDisplay(
          text.split('').map((ch, i) =>
            ch === ' ' ? ' ' :
            Math.random() < 0.5
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : ch
          ).join('')
        )
      } else if (frame < total) {
        // Partial resolve
        const progress = (frame - total * 0.6) / (total * 0.4)
        setDisplay(
          text.split('').map((ch, i) =>
            ch === ' ' ? ' ' :
            Math.random() < progress
              ? ch
              : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          ).join('')
        )
      } else {
        setDisplay(text)
        setGlitching(false)
        clearInterval(interval)
      }
    }, 45)

    return () => clearInterval(interval)
  }, [active, text])

  return (
    <span className={`${className} relative`}>
      {/* Red offset layer */}
      {glitching && (
        <span
          aria-hidden
          className="absolute inset-0 text-red-400/40 select-none"
          style={{ transform: 'translate(-2px, 1px)', clipPath: 'inset(30% 0 40% 0)' }}
        >
          {display}
        </span>
      )}
      {/* Blue offset layer */}
      {glitching && (
        <span
          aria-hidden
          className="absolute inset-0 text-[#00e5ff]/30 select-none"
          style={{ transform: 'translate(2px, -1px)', clipPath: 'inset(60% 0 10% 0)' }}
        >
          {display}
        </span>
      )}
      {display}
    </span>
  )
}

// ── 3D Tilt hook ──────────────────────────────────────────────────────────────
function useTilt(strength = 12) {
  const ref      = useRef(null)
  const rotateX  = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY  = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const glowX    = useSpring(useMotionValue(50), { stiffness: 200, damping: 20 })
  const glowY    = useSpring(useMotionValue(50), { stiffness: 200, damping: 20 })

  const onMouseMove = useCallback((e) => {
    const el   = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    const dx   = (e.clientX - cx) / (rect.width  / 2)
    const dy   = (e.clientY - cy) / (rect.height / 2)
    rotateX.set(-dy * strength)
    rotateY.set( dx * strength)
    glowX.set((e.clientX - rect.left) / rect.width  * 100)
    glowY.set((e.clientY - rect.top)  / rect.height * 100)
  }, [strength])

  const onMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }, [])

  return { ref, rotateX, rotateY, glowX, glowY, onMouseMove, onMouseLeave }
}

const GithubIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

function Avatar({ name, pic, size = 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'lg'
    ? 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl rounded-2xl'
    : 'w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg rounded-xl'

  if (pic) return (
    <img src={pic} alt={name} className={`${sz} object-cover shadow-xl flex-shrink-0 border border-white/10`} />
  )
  return (
    <div className={`${sz} bg-gradient-to-br from-[#00e5ff] to-[#7c3aed] flex items-center justify-center font-syne font-black text-white shadow-xl flex-shrink-0`}>
      {initials}
    </div>
  )
}

function SocialBtn({ href, label, icon }) {
  if (!href) return null
  return (
    <a
      href={href} target="_blank" rel="noreferrer"
      className="flex items-center gap-1.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
    >
      {icon}{label}
    </a>
  )
}

// ── CINEMATIC LEAD CARD ───────────────────────────────────────────────────────
function LeadCard({ dev }) {
  const inViewRef = useRef(null)
  const isInView  = useInView(inViewRef, { once: true, margin: '-80px' })
  const controls  = useAnimation()
  const [phase, setPhase]         = useState('idle')
  const [glitchActive, setGlitch] = useState(false)

  const { ref: tiltRef, rotateX, rotateY, glowX, glowY, onMouseMove, onMouseLeave } = useTilt(8)

  // Merge refs
  const setRefs = useCallback((el) => {
    inViewRef.current = el
    tiltRef.current   = el
  }, [])

  useEffect(() => {
    if (!isInView) return
    const run = async () => {
      setPhase('enter')
      await controls.start('visible')
      setPhase('scan')
      setTimeout(() => {
        setPhase('reveal')
        // Glitch name on reveal
        setTimeout(() => setGlitch(true), 100)
      }, 750)
    }
    run()
  }, [isInView])

  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(280px circle at ${x}% ${y}%, #00e5ff14 0%, transparent 60%)`
  )

  return (
    <motion.div
      ref={setRefs}
      initial="hidden"
      animate={controls}
      variants={{
        hidden:  { opacity: 0, y: 70, scale: 0.95 },
        visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
      }}
      style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: 'preserve-3d' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative mb-8 rounded-3xl cursor-default"
    >
      {/* Outer glow ring */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={phase !== 'idle' ? { opacity: [0, 1, 0.55] } : {}}
        transition={{ duration: 1.4 }}
        className="absolute -inset-[1.5px] rounded-3xl z-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #00e5ffaa, #7c3aed66, #00e5ff44)', filter: 'blur(1px)' }}
      />

      <div className="relative z-10 bg-[#070c15] rounded-3xl overflow-hidden border border-[#00e5ff]/15">

        {/* 3D mouse-follow inner glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 rounded-3xl"
          style={{ background: glowBg }}
        />

        {/* Particles */}
        <Particles count={20} />

        {/* Top draw bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={phase !== 'idle' ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
          className="h-[2px] bg-gradient-to-r from-[#00e5ff] via-[#7c3aed] to-[#00e5ff] relative z-20"
        />

        {/* Scan line */}
        <AnimatePresence>
          {phase === 'scan' && (
            <motion.div
              key="scan"
              initial={{ top: '0%', opacity: 1 }}
              animate={{ top: '108%', opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'linear' }}
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{
                height:     '3px',
                background: 'linear-gradient(90deg, transparent, #00e5ff, #7c3aed, #00e5ff, transparent)',
                boxShadow:  '0 0 28px 8px #00e5ffbb, 0 0 60px 14px #00e5ff33',
                position:   'absolute',
              }}
            />
          )}
        </AnimatePresence>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.8 }}
          animate={phase === 'reveal' ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20"
        >
          <span className="inline-flex items-center gap-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]"
            />
            Lead Builder
          </span>
        </motion.div>

        <div className="p-6 sm:p-8 md:p-10 relative z-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">

            {/* Avatar + ring burst */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
              animate={phase === 'reveal' ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.05 }}
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}
              className="flex-shrink-0 relative"
            >
              <Avatar name={dev.name} pic={dev.pic} size="lg" />
              {phase === 'reveal' && [0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.7, scale: 1 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 1, delay: i * 0.18, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-2xl border border-[#00e5ff]/40 pointer-events-none"
                />
              ))}
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0">

              {/* GLITCH NAME */}
              <div className="overflow-hidden mb-1">
                <motion.h2
                  initial={{ y: '110%' }}
                  animate={phase === 'reveal' ? { y: 0 } : {}}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                  className="font-syne font-black text-2xl sm:text-3xl md:text-4xl pr-24 sm:pr-28"
                  style={{ transformStyle: 'preserve-3d', transform: 'translateZ(10px)' }}
                >
                  <GlitchText text={dev.name} active={glitchActive} />
                </motion.h2>
              </div>

              {/* Role */}
              <motion.div
                initial={{ opacity: 0, x: -14 }}
                animate={phase === 'reveal' ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="flex items-center gap-2 mb-4"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1], scaleX: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] inline-block"
                />
                <span className="text-[#00e5ff] text-xs sm:text-sm font-semibold tracking-wide">{dev.role}</span>
              </motion.div>

              {/* Bio */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={phase === 'reveal' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.28 }}
                className="text-gray-400 leading-relaxed mb-5 font-light text-sm sm:text-base max-w-2xl"
              >
                {dev.bio}
              </motion.p>

              {/* Skills */}
              <motion.div
                initial="hidden"
                animate={phase === 'reveal' ? 'visible' : 'hidden'}
                variants={{ visible: { transition: { staggerChildren: 0.055, delayChildren: 0.35 } } }}
                className="flex flex-wrap gap-2 mb-5"
              >
                {dev.skills.map(s => (
                  <motion.span
                    key={s}
                    variants={{
                      hidden:  { opacity: 0, scale: 0.5, y: 12 },
                      visible: { opacity: 1, scale: 1,   y: 0,
                        transition: { ease: [0.34, 1.56, 0.64, 1], duration: 0.45 } }
                    }}
                    whileHover={{ scale: 1.1, borderColor: '#00e5ff88' }}
                    className="bg-[#00e5ff]/8 border border-[#00e5ff]/20 text-[#00e5ff] text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium cursor-default transition-colors"
                  >
                    {s}
                  </motion.span>
                ))}
              </motion.div>

              {/* Social */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={phase === 'reveal' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.75 }}
                className="flex gap-2 flex-wrap"
              >
                <SocialBtn href={dev.github}   label="GitHub"   icon={<GithubIcon />} />
                <SocialBtn href={dev.linkedin} label="LinkedIn" icon={<LinkedinIcon />} />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent relative z-10" />
      </div>
    </motion.div>
  )
}

// ── Member card ───────────────────────────────────────────────────────────────
function MemberCard({ dev, delay }) {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const { ref: tiltRef, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(5)

  const setRefs = useCallback(el => {
    ref.current     = el
    tiltRef.current = el
  }, [])

  return (
    <motion.div
      ref={setRefs}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group bg-[#0d1117] border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-[#00e5ff]/25 transition-colors duration-300 relative overflow-hidden cursor-default"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-transparent group-hover:from-[#00e5ff]/5 transition-all duration-500 pointer-events-none rounded-2xl" />

      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <Avatar name={dev.name} pic={dev.pic} size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-syne font-bold text-sm sm:text-base leading-tight mb-0.5 truncate">{dev.name}</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#00e5ff]/70 flex-shrink-0" />
            <span className="text-[#00e5ff] text-xs font-medium truncate">{dev.role}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4">{dev.bio}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {dev.skills.map(s => (
          <motion.span
            key={s}
            whileHover={{ scale: 1.08 }}
            className="bg-white/4 border border-white/8 text-gray-400 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full cursor-default"
          >
            {s}
          </motion.span>
        ))}
      </div>

      <div className="flex gap-2">
        <SocialBtn href={dev.github}   label="GitHub"   icon={<GithubIcon />} />
        <SocialBtn href={dev.linkedin} label="LinkedIn" icon={<LinkedinIcon />} />
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Developer() {
  useReveal()
  const lead    = TEAM.find(d => d.isLead)
  const members = TEAM.filter(d => !d.isLead)

  return (
    <div className="min-h-screen pt-24 overflow-x-hidden relative">

      {/* Global cursor spotlight */}
      <CursorSpotlight />

      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3"
        >
          <span className="inline-flex items-center gap-2 text-[#00e5ff] text-xs font-semibold tracking-[0.2em] uppercase">
            <span className="w-4 h-px bg-[#00e5ff]" />
            The Team
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-10 sm:mb-14"
        >
          <h1 className="font-syne font-black text-4xl sm:text-5xl md:text-6xl tracking-tight mb-3">
            People behind<br />
            <span className="grad-text">DeployHub.</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-md font-light leading-relaxed">
            5 developers. One mission — make hosting stupidly simple for every developer.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 sm:mb-14"
        >
          {DEV_STATS.map(stat => (
            <motion.div
              key={stat.l}
              variants={{
                hidden:  { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{ scale: 1.04, borderColor: '#00e5ff33' }}
              className="bg-[#0d1117] border border-white/5 rounded-xl p-4 sm:p-5 text-center transition-colors cursor-default"
            >
              <div className="text-lg sm:text-xl mb-1">{stat.icon}</div>
              <div className="font-syne font-black text-xl sm:text-2xl text-[#00e5ff] mb-0.5">{stat.n}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">{stat.l}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lead — full cinematic */}
        {lead && <LeadCard dev={lead} />}

        {/* Team */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-gray-300">Rest of the team</h2>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-gray-600">{members.length} members</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {members.map((dev, i) => (
            <MemberCard key={dev.name} dev={dev} delay={i * 100} />
          ))}
        </div>

      </section>
    </div>
  )
}