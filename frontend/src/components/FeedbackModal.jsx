import React, { useState } from "react";
import axios from "axios";
import "./FeedbackModal.css";

const API = __API__;

export default function FeedbackModal({ onClose }) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [text,      setText]      = useState("");
  const [placement, setPlacement] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  const handleSubmit = async () => {
    if (rating === 0)          { setError("Please select a star rating."); return; }
    if (text.trim().length < 10) { setError("Please write at least 10 characters."); return; }
    setError(""); setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/feedback`, { rating, text, placement }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fb-overlay" onClick={onClose}>
      <div className="fb-modal" onClick={e => e.stopPropagation()}>

        {done ? (
          /* ── Success state ── */
          <div className="fb-success">
            <div className="fb-success-icon"><i className="bi bi-patch-check-fill" /></div>
            <h3>Thank you!</h3>
            <p>Your feedback has been submitted and will appear on our landing page.</p>
            <button className="fb-close-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="fb-header">
              <div className="fb-header-icon"><i className="bi bi-chat-heart-fill" /></div>
              <div>
                <h3 className="fb-title">Share Your Experience</h3>
                <p className="fb-subtitle">Your feedback helps other students discover EduPrep AI</p>
              </div>
              <button className="fb-x" onClick={onClose}><i className="bi bi-x-lg" /></button>
            </div>

            <div className="fb-body">
              {error && (
                <div className="fb-error"><i className="bi bi-exclamation-circle-fill" /> {error}</div>
              )}

              {/* Star rating */}
              <div className="fb-field">
                <label className="fb-label">Rating</label>
                <div className="fb-stars">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      className={`fb-star ${s <= (hovered || rating) ? "fb-star--on" : ""}`}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(s)}
                    >
                      <i className="bi bi-star-fill" />
                    </button>
                  ))}
                  <span className="fb-rating-label">
                    {["","Poor","Fair","Good","Great","Excellent!"][(hovered || rating)]}
                  </span>
                </div>
              </div>

              {/* Feedback text */}
              <div className="fb-field">
                <label className="fb-label">Your Feedback <span className="fb-req">*</span></label>
                <textarea
                  className="fb-textarea"
                  rows={4}
                  placeholder="Share what you loved about EduPrep AI — mock interviews, resume analyser, tests..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={400}
                />
                <p className="fb-char">{text.length}/400</p>
              </div>

              {/* Placement (optional) */}
              <div className="fb-field">
                <label className="fb-label">Placement <span className="fb-opt">(optional)</span></label>
                <input
                  className="fb-input"
                  type="text"
                  placeholder='e.g. "Placed at Infosys" or "Secured internship at Google"'
                  value={placement}
                  onChange={e => setPlacement(e.target.value)}
                  maxLength={80}
                />
              </div>

              <button className="fb-submit" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="fb-spinner" /> Submitting…</>
                  : <><i className="bi bi-send-fill me-2" />Submit Feedback</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
