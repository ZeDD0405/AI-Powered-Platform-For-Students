const express = require("express");
const router  = express.Router();
const Feedback = require("../models/Feedback");
const { requireAuth } = require("../middleware/authMiddleware");

const COLORS = ["#6366f1","#a855f7","#10b981","#f59e0b","#06b6d4","#ef4444"];

// ── GET /api/feedback/public — no auth, for landing page ──
router.get("/public", async (req, res) => {
  try {
    const feedback = await Feedback.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(9)
      .select("-rollNo -approved -__v");
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback." });
  }
});

// ── POST /api/feedback — authenticated students only ──
router.post("/", requireAuth, async (req, res) => {
  try {
    const { text, rating, placement } = req.body;
    const { rollNo, name, branch } = req.user;

    if (!text || typeof text !== "string" || text.trim().length < 10)
      return res.status(400).json({ error: "Feedback must be at least 10 characters." });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Please provide a rating between 1 and 5." });

    // Check if student already submitted
    const existing = await Feedback.findOne({ rollNo });
    if (existing)
      return res.status(409).json({ error: "You have already submitted feedback. Thank you!" });

    // Compute avatar initials
    const words  = (name || "").trim().split(" ").filter(Boolean);
    const avatar = words.length >= 2
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : (name || "?")[0].toUpperCase();

    // Pick color based on rollNo hash
    const colorIdx = rollNo.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLORS.length;

    const feedback = await Feedback.create({
      rollNo,
      studentName: name || "Student",
      branch:      branch || "",
      rating:      Number(rating),
      text:        text.trim(),
      placement:   (placement || "").trim(),
      avatar,
      color: COLORS[colorIdx],
    });

    res.json({ success: true, feedback });
  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ error: "Failed to submit feedback." });
  }
});

module.exports = router;
