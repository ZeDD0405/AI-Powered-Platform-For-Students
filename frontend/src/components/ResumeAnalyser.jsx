import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import "./ResumeAnalyser.css";

const API = __API__;

/* ── Build resume HTML from structured data ───────────────── */
const sec = (title) =>
  `<h2 style="font-size:7.5pt;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#111;border-bottom:1.5px solid #333;padding-bottom:2px;margin:10px 0 4px;">${title}</h2>`;

const buildResumeHTML = (d) => {
  const contactParts = [
    d.contact?.email,
    d.contact?.phone,
    d.contact?.linkedin,
    d.contact?.github,
    d.contact?.portfolio,
    d.contact?.location,
  ].filter(Boolean);

  let h = `<div id="resume-body" style="font-family:Arial,Helvetica,sans-serif;font-size:8.5pt;color:#111;line-height:1.38;padding:1.2cm 1.6cm;box-sizing:border-box;">`;

  // Header
  h += `<div style="text-align:center;margin-bottom:5px;">
    <h1 style="margin:0;font-size:19pt;font-weight:800;letter-spacing:-0.5px;color:#111;">${d.name || ""}</h1>
    <p style="margin:3px 0 0;font-size:8pt;color:#444;">${contactParts.join(" &nbsp;|&nbsp; ")}</p>
  </div>
  <hr style="border:none;border-top:2px solid #111;margin:5px 0 0;">`;

  // Summary
  if (d.summary) {
    h += sec("Professional Summary");
    h += `<p style="margin:0;font-size:8.5pt;line-height:1.4;">${d.summary}</p>`;
  }

  // Skills
  if (d.skills?.length) {
    h += sec("Skills");
    h += d.skills.map(s =>
      `<p style="margin:2px 0;font-size:8.5pt;"><strong>${s.category}:</strong> ${(s.items || []).join(", ")}</p>`
    ).join("");
  }

  // Experience
  if (d.experience?.length) {
    h += sec("Work Experience");
    h += d.experience.map(e => `
      <div style="margin-bottom:5px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <strong style="font-size:9pt;">${e.title}${e.company ? ` &nbsp;|&nbsp; ${e.company}` : ""}</strong>
          <span style="font-size:8pt;color:#555;white-space:nowrap;padding-left:8px;">${e.duration || ""}</span>
        </div>
        <ul style="margin:2px 0 0;padding-left:14px;">
          ${(e.bullets || []).map(b => `<li style="font-size:8.5pt;margin-bottom:1px;">${b}</li>`).join("")}
        </ul>
      </div>`).join("");
  }

  // Projects
  if (d.projects?.length) {
    h += sec("Projects");
    h += d.projects.map(p => `
      <div style="margin-bottom:5px;">
        <strong style="font-size:9pt;">${p.name}${p.tech ? `<span style="font-weight:400;color:#555;"> &nbsp;|&nbsp; ${p.tech}</span>` : ""}</strong>
        <ul style="margin:2px 0 0;padding-left:14px;">
          ${(p.bullets || []).map(b => `<li style="font-size:8.5pt;margin-bottom:1px;">${b}</li>`).join("")}
        </ul>
      </div>`).join("");
  }

  // Education
  if (d.education?.length) {
    h += sec("Education");
    h += d.education.map(e => `
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">
        <div>
          <strong style="font-size:9pt;">${e.degree}${e.institution ? `, ${e.institution}` : ""}</strong>
          ${e.detail ? `<span style="font-size:8.5pt;color:#555;"> &middot; ${e.detail}</span>` : ""}
        </div>
        <span style="font-size:8pt;color:#555;white-space:nowrap;padding-left:8px;">${e.year || ""}</span>
      </div>`).join("");
  }

  // Certifications
  if (d.certifications?.length) {
    h += sec("Certifications");
    h += `<p style="margin:0;font-size:8.5pt;">${d.certifications.join(" &nbsp;&middot;&nbsp; ")}</p>`;
  }

  h += `</div>`;
  return h;
};

/* ── helpers ──────────────────────────────────────────────── */
const scoreColor = (s) =>
  s >= 80 ? "#10b981" : s >= 60 ? "#6366f1" : s >= 40 ? "#f59e0b" : "#ef4444";

const scoreLabel = (s) =>
  s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Needs Work" : "Poor";

/* ── Circular gauge ──────────────────────────────────────── */
const CircularGauge = ({ score, size = 160, stroke = 12, label }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  const color  = scoreColor(score);

  return (
    <div className="ra-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          className="ra-gauge-arc" />
      </svg>
      <div className="ra-gauge-inner">
        <span className="ra-gauge-num" style={{ color }}>{score}</span>
        <span className="ra-gauge-sub">{label}</span>
      </div>
    </div>
  );
};

/* ── Section bar ─────────────────────────────────────────── */
const SectionBar = ({ icon, label, score, feedback, tips }) => {
  const [showTips, setShowTips] = useState(false);
  const color = scoreColor(score);
  return (
    <div className="ra-sbar">
      <div className="ra-sbar-top">
        <span className="ra-sbar-label"><i className={`bi ${icon}`} />{label}</span>
        <span className="ra-sbar-score" style={{ color }}>{score}/100</span>
      </div>
      <div className="ra-sbar-track">
        <div className="ra-sbar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      {feedback && <p className="ra-sbar-feedback">{feedback}</p>}
      {score < 100 && tips?.length > 0 && (
        <div>
          <button
            className="ra-tips-btn"
            onClick={() => setShowTips(p => !p)}
          >
            <i className={`bi ${showTips ? "bi-chevron-up" : "bi-lightbulb-fill"} me-1`} />
            {showTips ? "Hide tips" : "How to reach 100?"}
          </button>
          {showTips && (
            <div className="ra-tips-panel">
              <p className="ra-tips-heading"><i className="bi bi-stars me-1" />Steps to reach 100/100</p>
              <ul className="ra-tips-list">
                {tips.map((tip, i) => (
                  <li key={i} className="ra-tips-item">
                    <span className="ra-tips-num">{i + 1}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SECTIONS = [
  { key: "contact",    icon: "bi-person-lines-fill", label: "Contact Info" },
  { key: "summary",    icon: "bi-card-text",          label: "Summary / Objective" },
  { key: "experience", icon: "bi-briefcase-fill",     label: "Work Experience" },
  { key: "education",  icon: "bi-mortarboard-fill",   label: "Education" },
  { key: "skills",     icon: "bi-tools",               label: "Skills" },
  { key: "projects",   icon: "bi-diagram-3-fill",     label: "Projects" },
];

const getSteps = (hasJD) => hasJD ? [
  "Parsing document…",
  "Analysing content…",
  "Matching to job description…",
  "Generating optimised resume…",
  "Finalising report…",
] : [
  "Parsing document…",
  "Analysing content…",
  "Checking ATS compatibility…",
  "Generating insights…",
  "Finalising report…",
];

/* ── Main component ──────────────────────────────────────── */
const ResumeAnalyser = ({ onClose, asPage = false }) => {
  const [phase,           setPhase]           = useState("upload"); // upload | analysing | result
  const [file,            setFile]            = useState(null);
  const [dragging,        setDragging]        = useState(false);
  const [step,            setStep]            = useState(0);
  const [error,           setError]           = useState("");
  const [analysis,        setAnalysis]        = useState(null);
  const [jobDescription,  setJobDescription]  = useState("");
  const [optimisedResume, setOptimisedResume] = useState(null);
  const [activeTab,       setActiveTab]       = useState("analysis"); // analysis | optimised
  const inputRef = useRef();

  /* drag & drop */
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") { setFile(f); setError(""); }
    else setError("Please upload a PDF file.");
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f?.type === "application/pdf") { setFile(f); setError(""); }
    else setError("Please upload a PDF file.");
  };

  /* analyse */
  const handleAnalyse = async () => {
    if (!file) { setError("Please select a resume PDF first."); return; }
    const steps = getSteps(!!jobDescription.trim());
    setPhase("analysing"); setError(""); setStep(0);

    const ticker = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) { clearInterval(ticker); return s; }
        return s + 1;
      });
    }, jobDescription.trim() ? 2200 : 1800);

    try {
      const form = new FormData();
      form.append("resume", file);
      if (jobDescription.trim()) form.append("jobDescription", jobDescription.trim());
      const { data } = await axios.post(`${API}/api/interview/analyse-resume`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(ticker);
      if (data.success) {
        setAnalysis(data.analysis);
        let optData = null;
        if (data.optimisedResume) {
          try { optData = JSON.parse(data.optimisedResume); } catch { optData = null; }
        }
        setOptimisedResume(optData);
        setActiveTab(optData ? "optimised" : "analysis");
        setPhase("result");
      } else {
        setError(data.error || "Analysis failed."); setPhase("upload");
      }
    } catch (err) {
      clearInterval(ticker);
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
      setPhase("upload");
    }
  };

  const downloadPDF = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Optimised Resume</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; width: 210mm; height: 297mm; overflow: hidden; }
  * { box-sizing: border-box; }
  a { color: inherit; text-decoration: none; }
  ul { list-style: disc; }
</style>
<script>
window.onload = function() {
  var el = document.getElementById('resume-body');
  var A4_H = 297 * 3.7795; // 297mm in px at 96dpi
  var h = el.offsetHeight;
  if (h > A4_H) {
    var scale = A4_H / h;
    el.style.transform = 'scale(' + scale + ')';
    el.style.transformOrigin = 'top left';
    el.style.width = Math.round(100 / scale) + '%';
  }
  setTimeout(function(){ window.print(); }, 200);
};
<\/script>
</head><body>${buildResumeHTML(optimisedResume)}</body></html>`);
    win.document.close();
  };

  const reset = () => {
    setPhase("upload"); setFile(null); setAnalysis(null);
    setOptimisedResume(null); setJobDescription(""); setError(""); setStep(0);
  };

  return (
    <div className={`ra-overlay${asPage ? " ra-overlay--page" : ""}`} onClick={!asPage ? onClose : undefined}>
      <div className="ra-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="ra-header">
          <div className="ra-header-left">
            <div className="ra-header-icon">
              <i className="bi bi-file-earmark-person-fill" />
            </div>
            <div>
              <h2 className="ra-header-title">AI Resume Analyser</h2>
              <p className="ra-header-sub">Powered by Gemini · ATS & Placement Ready</p>
            </div>
          </div>
          <button className="ra-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>

        {/* ── UPLOAD PHASE ── */}
        {phase === "upload" && (
          <div className="ra-body">
            {error && (
              <div className="ra-error">
                <i className="bi bi-exclamation-circle-fill" /> {error}
              </div>
            )}

            <div
              className={`ra-dropzone ${dragging ? "ra-dropzone--drag" : ""} ${file ? "ra-dropzone--has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !file && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={onFileChange} />

              {!file ? (
                <>
                  <div className="ra-drop-icon"><i className="bi bi-cloud-upload-fill" /></div>
                  <p className="ra-drop-title">Drop your resume here</p>
                  <p className="ra-drop-sub">or click to browse · PDF only · max 5 MB</p>
                </>
              ) : (
                <>
                  <div className="ra-drop-icon ra-drop-icon--ready"><i className="bi bi-file-earmark-check-fill" /></div>
                  <p className="ra-drop-title">{file.name}</p>
                  <p className="ra-drop-sub">{(file.size / 1024).toFixed(0)} KB · Ready to analyse</p>
                  <button className="ra-change-btn" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                    Change file
                  </button>
                </>
              )}
            </div>

            {/* Job Description */}
            <div className="ra-jd-block">
              <label className="ra-jd-label">
                <i className="bi bi-briefcase-fill me-2" />
                Job Description <span className="ra-jd-optional">(optional — for targeted ATS score &amp; optimised resume)</span>
              </label>
              <textarea
                className="ra-jd-textarea"
                rows={5}
                placeholder="Paste the job description here to get an ATS-optimised version of your resume tailored to this specific role…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="ra-upload-tips">
              <div className="ra-tip"><i className="bi bi-check-circle-fill" />Make sure your resume is text-based, not a scanned image</div>
              <div className="ra-tip"><i className="bi bi-check-circle-fill" />ATS score, section-wise grades, missing keywords & more</div>
              <div className="ra-tip"><i className="bi bi-check-circle-fill" />{jobDescription.trim() ? "Optimised resume tailored to your job description included" : "Add a job description to get a downloadable optimised resume"}</div>
            </div>

            <button className="ra-analyse-btn" onClick={handleAnalyse} disabled={!file}>
              <i className="bi bi-cpu-fill me-2" />
              {jobDescription.trim() ? "Analyse & Optimise Resume" : "Analyse Resume"}
            </button>
          </div>
        )}

        {/* ── ANALYSING PHASE ── */}
        {phase === "analysing" && (
          <div className="ra-body ra-body--center">
            <div className="ra-scan-anim">
              <div className="ra-scan-ring ra-scan-ring--1" />
              <div className="ra-scan-ring ra-scan-ring--2" />
              <div className="ra-scan-ring ra-scan-ring--3" />
              <div className="ra-scan-core"><i className="bi bi-cpu-fill" /></div>
            </div>
            <h3 className="ra-analysing-title">{jobDescription.trim() ? "Analysing & optimising your resume…" : "Analysing your resume…"}</h3>
            <div className="ra-steps">
              {getSteps(!!jobDescription.trim()).map((s, i) => (
                <div key={i} className={`ra-step ${i < step ? "ra-step--done" : i === step ? "ra-step--active" : "ra-step--pending"}`}>
                  <span className="ra-step-dot">
                    {i < step ? <i className="bi bi-check-lg" /> : i === step ? <span className="ra-step-spinner" /> : null}
                  </span>
                  <span className="ra-step-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === "result" && analysis && (
          <div className="ra-body ra-result">

            {/* Tabs — only shown when optimised resume exists */}
            {optimisedResume && (
              <div className="ra-tabs">
                <button
                  className={`ra-tab ${activeTab === "analysis" ? "ra-tab--active" : ""}`}
                  onClick={() => setActiveTab("analysis")}
                >
                  <i className="bi bi-bar-chart-fill me-2" />Analysis Report
                </button>
                <button
                  className={`ra-tab ${activeTab === "optimised" ? "ra-tab--active" : ""}`}
                  onClick={() => setActiveTab("optimised")}
                >
                  <i className="bi bi-stars me-2" />Optimised Resume
                </button>
              </div>
            )}

            {/* Optimised Resume Panel */}
            {activeTab === "optimised" && optimisedResume && (
              <div className="ra-opt-panel">
                <div className="ra-opt-header">
                  <div>
                    <p className="ra-opt-title"><i className="bi bi-stars me-2" />ATS-Optimised Resume</p>
                    <p className="ra-opt-sub">Rewritten for your target role · Ready to copy or download</p>
                  </div>
                  <button className="ra-download-btn" onClick={downloadPDF}>
                    <i className="bi bi-download me-2" />Download PDF
                  </button>
                </div>
                <div
                  className="ra-opt-content"
                  dangerouslySetInnerHTML={{ __html: buildResumeHTML(optimisedResume) }}
                />
              </div>
            )}

            {/* Analysis content — hidden when optimised tab is active */}
            <div style={{ display: activeTab === "analysis" ? "contents" : "none" }}>

            {/* Score row */}
            <div className="ra-score-row">
              <div className="ra-score-main">
                <CircularGauge score={analysis.overallScore} label="Overall" />
                <div className="ra-score-label-block">
                  <span className="ra-score-grade" style={{ color: scoreColor(analysis.overallScore) }}>
                    {scoreLabel(analysis.overallScore)}
                  </span>
                  <p className="ra-score-hint">Your resume scored {analysis.overallScore}/100 overall</p>
                </div>
              </div>
              <div className="ra-score-ats">
                <CircularGauge score={analysis.atsScore} size={120} stroke={10} label="ATS Score" />
                <p className="ra-ats-hint">Applicant Tracking System compatibility</p>
              </div>
            </div>

            {/* Verdict */}
            <div className="ra-verdict">
              <div className="ra-verdict-icon"><i className="bi bi-robot" /></div>
              <div>
                <p className="ra-verdict-label">AI Verdict</p>
                <p className="ra-verdict-text">"{analysis.verdict}"</p>
              </div>
            </div>

            {/* Sections */}
            <div className="ra-block">
              <h4 className="ra-block-title"><i className="bi bi-bar-chart-fill me-2" />Section Breakdown</h4>
              <div className="ra-sections-grid">
                {SECTIONS.map(({ key, icon, label }) =>
                  analysis.sections?.[key] ? (
                    <SectionBar
                      key={key} icon={icon} label={label}
                      score={analysis.sections[key].score}
                      feedback={analysis.sections[key].feedback}
                      tips={analysis.sections[key].tips}
                    />
                  ) : null
                )}
              </div>
            </div>

            {/* Strengths + Weaknesses */}
            <div className="ra-sw-row">
              <div className="ra-block ra-block--green">
                <h4 className="ra-block-title"><i className="bi bi-patch-check-fill me-2" style={{color:"#10b981"}}/>Strengths</h4>
                <ul className="ra-sw-list">
                  {(analysis.strengths || []).map((s, i) => (
                    <li key={i} className="ra-sw-item ra-sw-item--strength">
                      <i className="bi bi-check-circle-fill" />{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ra-block ra-block--red">
                <h4 className="ra-block-title"><i className="bi bi-exclamation-triangle-fill me-2" style={{color:"#ef4444"}}/>Weaknesses</h4>
                <ul className="ra-sw-list">
                  {(analysis.weaknesses || []).map((w, i) => (
                    <li key={i} className="ra-sw-item ra-sw-item--weakness">
                      <i className="bi bi-x-circle-fill" />{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Keywords */}
            <div className="ra-block">
              <h4 className="ra-block-title"><i className="bi bi-tags-fill me-2" />Keyword Analysis</h4>
              <div className="ra-kw-section">
                <p className="ra-kw-label ra-kw-label--present"><i className="bi bi-check2" />Found in your resume</p>
                <div className="ra-kw-chips">
                  {(analysis.presentKeywords || []).map((k, i) => (
                    <span key={i} className="ra-chip ra-chip--present">{k}</span>
                  ))}
                </div>
              </div>
              <div className="ra-kw-section mt-3">
                <p className="ra-kw-label ra-kw-label--missing"><i className="bi bi-x" />Missing keywords (add these)</p>
                <div className="ra-kw-chips">
                  {(analysis.missingKeywords || []).map((k, i) => (
                    <span key={i} className="ra-chip ra-chip--missing">{k}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="ra-block">
              <h4 className="ra-block-title"><i className="bi bi-lightbulb-fill me-2" />Top Suggestions</h4>
              <ol className="ra-suggestions">
                {(analysis.suggestions || []).map((s, i) => (
                  <li key={i} className="ra-suggestion">
                    <span className="ra-sug-num">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            </div>{/* end analysis wrapper */}

            {/* Actions — always visible */}
            <div className="ra-result-actions">
              <button className="ra-retry-btn" onClick={reset}>
                <i className="bi bi-arrow-repeat me-2" />Analyse Another Resume
              </button>
              <button className="ra-close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyser;
