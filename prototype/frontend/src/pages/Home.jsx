import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useReveal from '../components/useReveal'

const FEATURES = [
  { icon: '⚡', label: 'Instant Deploys',   desc: 'Push your code and go live in under 60 seconds.' },
  { icon: '🔒', label: 'Free SSL / HTTPS',  desc: "Automatic Let's Encrypt certificates for every project." },
  { icon: '📊', label: 'Request Tracking',  desc: 'Every HTTP request is counted so you always know your usage.' },
  { icon: '🌐', label: 'Static + Node.js',  desc: 'Host static sites and Node.js backends under one dashboard.' },
  { icon: '💾', label: 'Managed Runtime',   desc: '512 MB RAM and 0.1 CPU per app on free — zero config.' },
  { icon: '🔄', label: 'Auto Restart',      desc: "App crashed? DeployHub restarts it silently in seconds." },
]

const NOISE_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`

export default function Home() {
  useReveal()

  const [count, setCount] = useState(0)
  useEffect(() => {
    const target = 6, step = Math.ceil(target / 1)
    let cur = 0
    const t = setInterval(() => {
      cur += step
      if (cur >= target) { setCount(target); clearInterval(t) }
      else setCount(cur)
    }, 30)
    return () => clearInterval(t)
  }, [])

  const glowRef = useRef(null)
  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    const move = e => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', move)
    return () => el.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bg:     #080c10;
          --bg2:    #0d1117;
          --bg3:    #111827;
          --cyan:   #00e5ff;
          --cyan2:  #33eeff;
          --violet: #7c3aed;
          --white:  #f0f6ff;
          --muted:  #6b7280;
          --line:   rgba(0,229,255,.08);
          --line2:  rgba(255,255,255,.06);
          --serif:  'DM Serif Display', Georgia, serif;
          --sans:   'DM Sans', system-ui, sans-serif;
        }

        /* ── Base ── */
        .dh-root *, .dh-root *::before, .dh-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .dh-root { font-family: var(--sans); background: var(--bg); color: var(--white); overflow-x: hidden; }

        /* ── Cursor glow ── */
        .hero-glow { position: relative; overflow: hidden; }
        .hero-glow::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,229,255,.07) 0%, transparent 70%);
          top: calc(var(--my, 40%) - 300px);
          left: calc(var(--mx, 50%) - 300px);
          pointer-events: none;
          transition: top .1s, left .1s;
          z-index: 0;
        }

        /* ── Noise / dot-grid ── */
        .noise::after {
          content: '';
          position: absolute; inset: 0;
          background-image: ${NOISE_URL};
          pointer-events: none;
          z-index: 1;
        }
        .dot-grid {
          background-image: radial-gradient(rgba(0,229,255,.12) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── Animations ── */
        @keyframes slip    { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        @keyframes marquee { from { transform:translateX(0) }               to { transform:translateX(-50%) } }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)}          50%{opacity:.4;transform:scale(.75)} }
        @keyframes shine   { 0%{left:-100%} 60%,100%{left:150%} }

        .slip      { opacity:0; animation: slip .7s cubic-bezier(.22,1,.36,1) forwards; }
        .slip-1    { animation-delay:.05s }
        .slip-2    { animation-delay:.15s }
        .slip-3    { animation-delay:.25s }
        .slip-4    { animation-delay:.38s }
        .slip-5    { animation-delay:.52s }
        .pulse-dot { animation: pulse 1.8s ease-in-out infinite; }

        /* ── Marquee ── */
        .marquee-inner {
          display: flex;
          animation: marquee 28s linear infinite;
          width: max-content;
        }
        .marquee-inner:hover { animation-play-state: paused; }

        /* ── Hero layout ── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          padding: 8rem 6vw 6rem;
          min-height: 100vh;
          position: relative;
        }

        /* ── Badge ── */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          background: rgba(0,229,255,.08);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 100px;
          padding: .3rem .9rem;
          font-size: .68rem;
          font-weight: 500;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 1.75rem;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          display: inline-block;
        }

        /* ── Hero heading ── */
        .hero-h1 {
          font-family: var(--serif);
          font-size: clamp(2.8rem, 5vw, 5.2rem);
          line-height: 1.05;
          letter-spacing: -.01em;
          margin-bottom: 1.5rem;
        }
        .hero-sub {
          font-size: 1.05rem;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.8;
          max-width: 40ch;
          margin-bottom: 2.5rem;
        }

        /* ── Buttons ── */
        .btn-row { display: flex; gap: 1rem; flex-wrap: wrap; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: .4rem;
          background: var(--cyan); color: #080c10;
          font-family: var(--sans); font-size: .8rem; font-weight: 500;
          letter-spacing: .06em; text-transform: uppercase;
          padding: .9rem 2rem; border: none; cursor: pointer;
          text-decoration: none; border-radius: 2px;
          transition: background .2s, box-shadow .2s, transform .15s;
          white-space: nowrap;
        }
        .btn-primary:hover {
          background: var(--cyan2);
          box-shadow: 0 0 24px rgba(0,229,255,.35), 3px 3px 0 rgba(0,229,255,.3);
          transform: translate(-1px,-1px);
        }
        .btn-outline {
          display: inline-flex; align-items: center; gap: .4rem;
          background: transparent; color: var(--white);
          font-family: var(--sans); font-size: .8rem; font-weight: 500;
          letter-spacing: .06em; text-transform: uppercase;
          padding: .9rem 2rem;
          border: 1px solid rgba(255,255,255,.15);
          cursor: pointer; text-decoration: none; border-radius: 2px;
          transition: border-color .2s, background .2s, box-shadow .2s, transform .15s;
          white-space: nowrap;
        }
        .btn-outline:hover {
          border-color: rgba(0,229,255,.4);
          background: rgba(0,229,255,.04);
          box-shadow: 3px 3px 0 rgba(0,229,255,.15);
          transform: translate(-1px,-1px);
        }

        /* ── Hero right: stacked cards ── */
        .hero-right { position: relative; z-index: 2; }
        .stack-wrap { position: relative; margin-bottom: 2.5rem; }
        .stack-back {
          position: absolute; top: 14px; left: 14px; right: -14px; height: 192px;
          background: rgba(124,58,237,.06);
          border: 1px solid rgba(124,58,237,.12);
          border-radius: 2px;
        }
        .stack-mid {
          position: absolute; top: 7px; left: 7px; right: -7px; height: 192px;
          background: rgba(0,229,255,.04);
          border: 1px solid rgba(0,229,255,.08);
          border-radius: 2px;
        }
        .card-shine {
          background: var(--bg3);
          border: 1px solid rgba(0,229,255,.12);
          border-radius: 2px;
          padding: 1.75rem 2rem;
          position: relative;
          overflow: hidden;
        }
        .card-shine::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,.03), transparent);
          animation: shine 4s ease-in-out infinite;
        }
        .card-label {
          font-size: .65rem; font-weight: 500; letter-spacing: .12em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 1rem;
        }
        .proj-row {
          display: flex; align-items: center; gap: .75rem; margin-bottom: .85rem;
        }
        .proj-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .proj-name { font-size: .88rem; }
        .proj-status { color: var(--muted); font-weight: 300; }

        /* ── Stats ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .stat-item { border-top: 1px solid rgba(0,229,255,.2); padding-top: .75rem; }
        .stat-num {
          font-family: var(--serif);
          font-size: 2rem;
          color: var(--cyan);
          line-height: 1.1;
          margin-bottom: .2rem;
        }
        .stat-label {
          font-size: .68rem; font-weight: 400;
          color: var(--muted); letter-spacing: .06em; text-transform: uppercase;
        }

        /* ── Eyebrow ── */
        .eyebrow {
          font-family: var(--sans); font-size: .68rem; font-weight: 500;
          letter-spacing: .16em; text-transform: uppercase;
          color: var(--cyan);
        }

        /* ── Features ── */
        .features-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 3.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.05);
        }
        .feat-card {
          background: var(--bg3);
          border: 1px solid var(--line2);
          border-radius: 2px;
          padding: 2rem 1.75rem;
          transition: box-shadow .25s, transform .25s, border-color .25s;
          position: relative;
          overflow: hidden;
        }
        .feat-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--cyan);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .feat-card:hover {
          box-shadow: 0 0 0 1px rgba(0,229,255,.25), 4px 4px 0 rgba(0,229,255,.2);
          border-color: rgba(0,229,255,.2);
          transform: translate(-2px,-2px);
        }
        .feat-card:hover::before { transform: scaleX(1); }
        .feat-icon {
          width: 44px; height: 44px; border-radius: 2px;
          background: rgba(0,229,255,.08);
          border: 1px solid rgba(0,229,255,.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; margin-bottom: 1.25rem;
        }

        /* ── CTA block ── */
        .cta-block {
          border: 1px solid rgba(0,229,255,.15);
          border-radius: 2px;
          padding: 4.5rem 3.5rem;
          background: linear-gradient(135deg, rgba(0,229,255,.05) 0%, rgba(124,58,237,.08) 50%, rgba(0,229,255,.04) 100%);
          position: relative;
          overflow: hidden;
        }
        .cta-block::before {
          content: 'DEPLOY';
          position: absolute; right: -1rem; bottom: -2.5rem;
          font-family: var(--serif); font-size: 10rem;
          color: rgba(0,229,255,.04);
          pointer-events: none; line-height: 1; user-select: none;
          letter-spacing: -.02em;
        }
        .cta-block::after {
          content: '';
          position: absolute; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(124,58,237,.12) 0%, transparent 70%);
          top: -100px; right: -50px; pointer-events: none;
        }

        /* ── Quote section ── */
        .quote-section {
          background: var(--bg2);
          border-top: 1px solid var(--line2);
          border-bottom: 1px solid var(--line2);
        }

        /* ════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════════════ */

        /* ── Tablet (≤900px): stack hero ── */
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            padding: 7rem 5vw 4rem;
            gap: 3rem;
            min-height: unset;
          }
          .hero-h1 { font-size: clamp(2.4rem, 7vw, 3.8rem); }
          .hero-sub { max-width: 100%; font-size: 1rem; }

          /* hide stacked card on tablet, show only stats */
          .stack-wrap { display: none; }
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            margin-top: 0;
          }

          .features-header { flex-direction: column; align-items: flex-start; }

          .cta-block { padding: 3rem 2rem; }
          .cta-block::before { font-size: 6rem; }
        }

        /* ── Mobile (≤600px) ── */
        @media (max-width: 600px) {
          .hero-grid { padding: 6rem 1.25rem 3rem; gap: 2rem; }

          .hero-badge { font-size: .62rem; }
          .hero-h1 { font-size: clamp(2rem, 9vw, 3rem); }
          .hero-sub { font-size: .95rem; margin-bottom: 2rem; }

          /* buttons go full width on very small screens */
          .btn-row { flex-direction: column; }
          .btn-primary, .btn-outline { justify-content: center; width: 100%; }

          /* stats: 1 column on narrow, 3 on wide-ish mobile */
          .stats-grid { grid-template-columns: repeat(3, 1fr); gap: .6rem; }
          .stat-num { font-size: 1.4rem; }
          .stat-label { font-size: .6rem; }

          /* features: single column, full width */
          .features-grid { grid-template-columns: 1fr; }
          .feat-card { padding: 1.5rem 1.25rem; }
          .feat-card:hover { transform: none; box-shadow: none; }

          /* sections */
          .features-section { padding: 4rem 1.25rem !important; }
          .quote-section-inner { padding: 3.5rem 1.25rem !important; }
          .cta-section { padding: 4rem 1.25rem !important; }

          .cta-block { padding: 2.5rem 1.5rem; }
          .cta-block::before { display: none; }
          .cta-block::after { display: none; }
        }

        /* ── Very small (≤380px) ── */
        @media (max-width: 380px) {
          .hero-h1 { font-size: 1.9rem; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="dh-root">

        {/* ── HERO ───────────────────────────────────────── */}
        <section ref={glowRef} className="hero-glow noise dot-grid">
          <div className="hero-grid">

            {/* Left copy */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="slip slip-1">
                <span className="hero-badge">
                  <span className="badge-dot pulse-dot" />
                  Early Access — Join Free
                </span>
              </div>

              <h1 className="hero-h1 slip slip-2">
                Host your<br />
                projects.<br />
                <em style={{ color: 'var(--cyan)', fontStyle: 'italic' }}>No BS.</em><br />
                Just works.
              </h1>

              <p className="hero-sub slip slip-3">
                Deploy static sites &amp; Node.js apps in seconds.
                Free tier forever — no credit card, no complicated dashboards.
              </p>

              <div className="btn-row slip slip-4">
                <Link to="/pricing" className="btn-primary">Deploy for Free →</Link>
                <Link to="/about"   className="btn-outline">How it works</Link>
              </div>
            </div>

            {/* Right: mockup + stats */}
            <div className="hero-right slip slip-5">
              {/* Stacked card mockup */}
              <div className="stack-wrap">
                <div className="stack-back" />
                <div className="stack-mid" />
                <div className="card-shine">
                  <p className="card-label">dashboard · projects</p>
                  {[
                    { color: '#22c55e', name: 'my-portfolio', status: 'deployed 3s ago' },
                    { color: '#22c55e', name: 'api-server',   status: 'running · 14d' },
                    { color: '#f59e0b', name: 'landing-v2',   status: 'building…', pulse: true },
                  ].map(p => (
                    <div key={p.name} className="proj-row">
                      <div
                        className={`proj-dot${p.pulse ? ' pulse-dot' : ''}`}
                        style={{ background: p.color }}
                      />
                      <span className="proj-name">
                        {p.name}{' '}
                        <span className="proj-status">{p.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                {[
                  { num: `${count.toLocaleString()}+`, label: 'Projects Deployed' },
                  { num: '99.9%',                      label: 'Uptime SLA' },
                  { num: '<1s',                         label: 'Deploy Time' },
                ].map(s => (
                  <div key={s.label} className="stat-item">
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── MARQUEE ────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid rgba(0,229,255,.1)',
          borderBottom: '1px solid rgba(0,229,255,.1)',
          padding: '.65rem 0', overflow: 'hidden',
          background: 'rgba(0,229,255,.03)',
        }}>
          <div className="marquee-inner">
            {Array(8).fill('⚡ Instant Deploys  ·  🔒 Free SSL  ·  🌐 Node.js + Static  ·  📊 Request Tracking  ·  ').map((t, i) => (
              <span key={i} style={{
                fontSize: '.72rem', fontWeight: 400, letterSpacing: '.1em',
                textTransform: 'uppercase', paddingRight: '3rem',
                whiteSpace: 'nowrap', color: 'var(--cyan)', opacity: .6,
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ───────────────────────────────────── */}
        <section className="features-section" style={{ padding: '7rem 6vw', maxWidth: 1400, margin: '0 auto' }}>
          <div className="features-header">
            <div>
              <p className="eyebrow reveal" style={{ marginBottom: '.6rem' }}>Everything You Need</p>
              <h2 className="reveal" style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                lineHeight: 1.1,
              }}>
                Built for real projects.
              </h2>
            </div>
            <p className="reveal" style={{
              fontSize: '.9rem', color: 'var(--muted)',
              maxWidth: '36ch', lineHeight: 1.75, fontWeight: 300,
            }}>
              Everything you need to ship and scale — without the enterprise pricing or the enterprise BS.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className="feat-card reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="feat-icon">{f.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.15rem',
                  marginBottom: '.5rem',
                  letterSpacing: '-.01em',
                }}>
                  {f.label}
                </h3>
                <p style={{ fontSize: '.875rem', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUOTE ──────────────────────────────────────── */}
        <section className="quote-section">
          <div className="quote-section-inner" style={{ padding: '5.5rem 6vw', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p className="reveal eyebrow" style={{ marginBottom: '1.5rem' }}>From the devs</p>
            <blockquote className="reveal" style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.3rem, 3vw, 2.4rem)',
              lineHeight: 1.35, letterSpacing: '-.01em',
              fontStyle: 'italic', color: 'var(--white)',
            }}>
              "We went from staging to production in under 30 seconds.
              That's not a feature —{' '}
              <span style={{ color: 'var(--cyan)' }}>that's witchcraft.</span>"
            </blockquote>
            <p className="reveal" style={{
              marginTop: '1.5rem', fontSize: '.72rem',
              color: 'var(--muted)', letterSpacing: '.1em',
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              — Priya S., Full-Stack Developer
            </p>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="cta-section" style={{ padding: '7rem 6vw' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="cta-block reveal">
              <p className="eyebrow" style={{ marginBottom: '1rem', opacity: .6 }}>
                Ready to ship?
              </p>
              <h2 style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                lineHeight: 1.05, marginBottom: '1.5rem',
                position: 'relative', zIndex: 1,
              }}>
                3 projects waiting.<br />No card needed.
              </h2>
              <p style={{
                fontWeight: 300, color: 'var(--muted)', fontSize: '1rem',
                marginBottom: '2.5rem', maxWidth: '42ch', lineHeight: 1.75,
                position: 'relative', zIndex: 1,
              }}>
                Start for free. Upgrade when you outgrow it. We won't lock you in.
              </p>
              <div className="btn-row" style={{ position: 'relative', zIndex: 1 }}>
                <Link to="/pricing" className="btn-primary">Get Started Free →</Link>
                <Link to="/about"   className="btn-outline">View Docs</Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}