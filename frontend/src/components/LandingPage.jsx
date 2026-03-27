import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./LandingPage.css";

const API = __API__;

const TYPED_WORDS = ["Mock Interviews", "Resume Analysis", "Smart Tests", "Question Banks"];

const FEATURES = [
  {
    id: "interview",
    icon: "bi-mic-fill",
    gradient: "linear-gradient(135deg,#a855f7,#7c3aed)",
    glow: "rgba(168,85,247,0.35)",
    tag: "AI Voice",
    title: "Mock Interviews",
    desc: "Face a real AI interviewer. Answer by voice, get scored on content, confidence & clarity — exactly like the real thing.",
    points: ["Role-specific questions", "Real-time voice recognition", "Detailed performance report"],
  },
  {
    id: "resume",
    icon: "bi-file-earmark-person-fill",
    gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
    glow: "rgba(245,158,11,0.35)",
    tag: "ATS Engine",
    title: "Resume Analyser",
    desc: "Upload your resume + job description. Get ATS score, section-wise feedback, and a downloadable AI-optimised 1-page PDF.",
    points: ["ATS compatibility score", "Job-specific optimisation", "Downloadable PDF resume"],
  },
  {
    id: "test",
    icon: "bi-clipboard2-check-fill",
    gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",
    glow: "rgba(99,102,241,0.35)",
    tag: "Academics",
    title: "Smart Tests",
    desc: "Take MCQ tests set by your teachers, track deadlines, review answers and monitor your progress over time.",
    points: ["Teacher-assigned tests", "Real-time deadline tracking", "Detailed result analysis"],
  },
  {
    id: "questions",
    icon: "bi-question-diamond-fill",
    gradient: "linear-gradient(135deg,#06b6d4,#0891b2)",
    glow: "rgba(6,182,212,0.35)",
    tag: "Practice",
    title: "Question Bank",
    desc: "Browse thousands of practice questions filtered by subject, topic and company. Prepare smart, not hard.",
    points: ["Company-wise filtering", "Subject & topic sort", "Instant answer reveal"],
  },
];


const STEPS = [
  { num: "01", icon: "bi-person-plus-fill",  color: "#6366f1", title: "Create Your Account",  desc: "Sign up with your college roll number. Your profile is ready in under a minute." },
  { num: "02", icon: "bi-grid-fill",         color: "#a855f7", title: "Pick Your Mode",        desc: "Choose from Mock Interviews, Tests, Resume Analyser or Question Bank — all in one place." },
  { num: "03", icon: "bi-graph-up-arrow",    color: "#10b981", title: "Track & Improve",       desc: "Get AI feedback after every session. Watch your scores climb and confidence soar." },
];


export default function LandingPage() {
  const [scrolled,      setScrolled]      = useState(false);
  const [displayText,   setDisplayText]   = useState("");
  const [mobileMenu,    setMobileMenu]    = useState(false);
  const [testimonials,  setTestimonials]  = useState([]);
  const [testiLoading,  setTestiLoading]  = useState(true);

  /* ── Navbar scroll shadow ── */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* ── Typewriter ── */
  useEffect(() => {
    let wi = 0, ci = 0, del = false, tid;
    const tick = () => {
      const word = TYPED_WORDS[wi];
      if (!del) {
        ci++;
        setDisplayText(word.slice(0, ci));
        if (ci === word.length) { del = true; tid = setTimeout(tick, 1800); return; }
      } else {
        ci--;
        setDisplayText(word.slice(0, ci));
        if (ci === 0) { del = false; wi = (wi + 1) % TYPED_WORDS.length; tid = setTimeout(tick, 400); return; }
      }
      tid = setTimeout(tick, del ? 45 : 90);
    };
    tid = setTimeout(tick, 900);
    return () => clearTimeout(tid);
  }, []);

  /* ── Scroll reveal (re-runs when testimonials load so dynamic cards are observed) ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("lp-visible"); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".lp-reveal:not(.lp-visible)").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [testimonials]);


  /* ── Fetch testimonials ── */
  useEffect(() => {
    axios.get(`${API}/api/feedback/public`)
      .then(({ data }) => { if (data.success) setTestimonials(data.feedback); })
      .catch(() => {})
      .finally(() => setTestiLoading(false));
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };

  return (
    <div className="lp-root">

      {/* ══ NAVBAR ══ */}
      <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon"><i className="bi bi-mortarboard-fill" /></div>
            <span className="lp-logo-text">EduPrep<span className="lp-logo-ai">AI</span></span>
          </div>
          <div className={`lp-nav-links ${mobileMenu ? "lp-nav-links--open" : ""}`}>
            <button onClick={() => scrollTo("features")}>Features</button>
            <button onClick={() => scrollTo("how")}>How it works</button>
            <button onClick={() => scrollTo("testimonials")}>Reviews</button>
            <Link to="/login"    className="lp-nav-login">Log In</Link>
            <Link to="/register" className="lp-nav-cta">Get Started</Link>
          </div>
          <button className="lp-hamburger" onClick={() => setMobileMenu(m => !m)}>
            <i className={`bi ${mobileMenu ? "bi-x-lg" : "bi-list"}`} />
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="lp-hero">
        <div className="lp-blobs">
          <div className="lp-blob lp-blob--1" />
          <div className="lp-blob lp-blob--2" />
          <div className="lp-blob lp-blob--3" />
        </div>
        <div className="lp-grid-bg" />

        <div className="lp-hero-inner">

          {/* Left — text */}
          <div className="lp-hero-text">
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              Powered by Gemini AI
            </div>
            <h1 className="lp-hero-h1">
              Ace Every Interview<br />
              with AI-Powered<br />
              <span className="lp-typed-wrap">
                <span className="lp-typed-text">{displayText}</span>
                <span className="lp-cursor">|</span>
              </span>
            </h1>
            <p className="lp-hero-sub">
              The all-in-one platform built for engineering students — AI mock interviews, ATS resume analysis, smart tests and company-wise question banks. All in one place.
            </p>
            <div className="lp-hero-btns">
              <Link to="/register" className="lp-btn-primary">
                <i className="bi bi-rocket-takeoff-fill" />
                Get Started
              </Link>
              <button className="lp-btn-secondary" onClick={() => scrollTo("features")}>
                <i className="bi bi-play-circle-fill" />
                See Features
              </button>
            </div>
          </div>

          {/* Right — animated mockup */}
          <div className="lp-hero-visual">

            {/* Main interview card */}
            <div className="lp-hv-main lp-float">
              <div className="lp-hv-header">
                <div className="lp-hv-dots"><span /><span /><span /></div>
                <span className="lp-hv-title">AI Interview Session</span>
                <span className="lp-hv-live"><span className="lp-live-dot" />LIVE</span>
              </div>
              <div className="lp-hv-orb-wrap">
                <div className="lp-hv-ring lp-hv-ring--1" />
                <div className="lp-hv-ring lp-hv-ring--2" />
                <div className="lp-hv-ring lp-hv-ring--3" />
                <div className="lp-hv-orb-core"><i className="bi bi-robot" /></div>
              </div>
              <p className="lp-hv-q">"Explain how you would design a scalable REST API for a high-traffic application."</p>
              <div className="lp-hv-mic-row">
                <div className="lp-hv-mic-btn"><i className="bi bi-mic-fill" /></div>
                <div className="lp-hv-waves">
                  <span /><span /><span /><span /><span />
                </div>
                <span className="lp-hv-listening">Listening…</span>
              </div>
            </div>

            {/* ATS score badge */}
            <div className="lp-hv-score lp-float lp-float--d1">
              <div className="lp-hv-score-ring">
                <svg viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#10b981" strokeWidth="5"
                    strokeDasharray="150.8" strokeDashoffset="19.6"
                    strokeLinecap="round" transform="rotate(-90 30 30)" className="lp-gauge-arc" />
                </svg>
                <span>87</span>
              </div>
              <p>ATS Score</p>
              <p className="lp-hv-score-sub">Excellent!</p>
            </div>

            {/* Feedback card */}
            <div className="lp-hv-feedback lp-float lp-float--d2">
              <p className="lp-hv-fb-head"><i className="bi bi-stars" /> AI Feedback</p>
              <p className="lp-hv-fb-text">Strong technical depth — structure your answer using the STAR method for max impact.</p>
              <div className="lp-hv-bars">
                <div className="lp-hv-bar-row">
                  <span>Communication</span>
                  <div className="lp-hv-bar-track"><div className="lp-hv-bar-fill" style={{ width:"78%", background:"#6366f1" }} /></div>
                  <span>78</span>
                </div>
                <div className="lp-hv-bar-row">
                  <span>Technical</span>
                  <div className="lp-hv-bar-track"><div className="lp-hv-bar-fill" style={{ width:"91%", background:"#10b981" }} /></div>
                  <span>91</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <button className="lp-scroll-cue" onClick={() => scrollTo("stats")}>
          <i className="bi bi-chevron-double-down" />
        </button>
      </section>


      {/* ══ FEATURES ══ */}
      <section className="lp-features" id="features">
        <div className="lp-section-head lp-reveal">
          <div className="lp-section-tag">Everything You Need</div>
          <h2 className="lp-section-h2">Four tools. One platform.<br />Infinite preparation.</h2>
          <p className="lp-section-sub">Everything a placement-bound engineering student needs, powered by cutting-edge AI.</p>
        </div>
        <div className="lp-feat-grid">
          {FEATURES.map((f, i) => (
            <div key={f.id} className="lp-feat-card lp-reveal" style={{ "--delay": `${i * 0.1}s` }}>
              <div className="lp-feat-icon" style={{ background: f.gradient, boxShadow: `0 8px 28px ${f.glow}` }}>
                <i className={`bi ${f.icon}`} />
              </div>
              <span className="lp-feat-tag">{f.tag}</span>
              <h3 className="lp-feat-title">{f.title}</h3>
              <p className="lp-feat-desc">{f.desc}</p>
              <ul className="lp-feat-pts">
                {f.points.map((p, j) => <li key={j}><i className="bi bi-check-circle-fill" />{p}</li>)}
              </ul>
              <div className="lp-feat-glow" style={{ background: f.gradient }} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="lp-how" id="how">
        <div className="lp-section-head lp-reveal">
          <div className="lp-section-tag">Simple Process</div>
          <h2 className="lp-section-h2">Up and running in<br />3 simple steps</h2>
        </div>
        <div className="lp-how-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="lp-how-step lp-reveal" style={{ "--delay": `${i * 0.15}s` }}>
              <div className="lp-how-num" style={{ color: s.color, borderColor: `${s.color}44` }}>{s.num}</div>
              <div className="lp-how-icon" style={{ background: `${s.color}1a`, color: s.color }}>
                <i className={`bi ${s.icon}`} />
              </div>
              <h3 className="lp-how-title">{s.title}</h3>
              <p className="lp-how-desc">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="lp-how-connector">
                  <div className="lp-how-line" />
                  <i className="bi bi-arrow-right" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="lp-testi" id="testimonials">
        <div className="lp-section-head lp-reveal">
          <div className="lp-section-tag">Student Stories</div>
          <h2 className="lp-section-h2">From practice to placement</h2>
          <p className="lp-section-sub">Real students. Real results. Real companies.</p>
        </div>
        {testiLoading ? (
          <div className="lp-testi-loading">
            <span className="lp-testi-spinner" />
            <p>Loading feedback…</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="lp-testi-empty">
            <i className="bi bi-chat-heart" />
            <p>No feedback yet — be the first to share your experience!</p>
            <Link to="/login" className="lp-btn-primary" style={{ marginTop: "0.5rem", display: "inline-flex" }}>
              Log in to give feedback
            </Link>
          </div>
        ) : (
          <div className="lp-testi-grid">
            {testimonials.map((t, i) => (
              <div key={t._id || i} className="lp-testi-card lp-reveal" style={{ "--delay": `${i * 0.1}s` }}>
                <div className="lp-testi-stars">
                  {[...Array(t.rating || 5)].map((_, j) => <i key={j} className="bi bi-star-fill" />)}
                </div>
                <p className="lp-testi-text">"{t.text}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-av" style={{ background: `linear-gradient(135deg,${t.color},${t.color}88)` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="lp-testi-name">{t.studentName}</p>
                    <p className="lp-testi-role">
                      {t.placement ? `${t.placement} · ` : ""}{t.branch}
                    </p>
                  </div>
                </div>
                <div className="lp-testi-accent" style={{ background: t.color }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="lp-cta lp-reveal">
        <div className="lp-cta-blob lp-cta-blob--1" />
        <div className="lp-cta-blob lp-cta-blob--2" />
        <div className="lp-cta-content">
          <div className="lp-cta-icon"><i className="bi bi-rocket-takeoff-fill" /></div>
          <h2 className="lp-cta-h2">Your dream job is one<br />practice session away.</h2>
          <p className="lp-cta-sub">Prepare smarter with AI. Start your placement journey today.</p>
          <div className="lp-cta-btns">
            <Link to="/register" className="lp-btn-primary lp-btn-primary--lg">
              Create Account <i className="bi bi-arrow-right" />
            </Link>
            <Link to="/login" className="lp-btn-ghost">Already have an account →</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon"><i className="bi bi-mortarboard-fill" /></div>
            <span className="lp-logo-text">EduPrep<span className="lp-logo-ai">AI</span></span>
          </div>
          <p className="lp-footer-tagline">AI-powered placement preparation for engineering students.</p>
          <div className="lp-footer-links">
            <button onClick={() => scrollTo("features")}>Features</button>
            <button onClick={() => scrollTo("how")}>How it works</button>
            <button onClick={() => scrollTo("testimonials")}>Reviews</button>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <p className="lp-footer-copy">© 2026 EduPrep AI · All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
