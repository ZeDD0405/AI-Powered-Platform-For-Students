const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  rollNo:      { type: String, required: true, trim: true },
  studentName: { type: String, required: true, trim: true },
  branch:      { type: String, default: "" },
  rating:      { type: Number, min: 1, max: 5, required: true },
  text:        { type: String, required: true, trim: true },
  placement:   { type: String, default: "", trim: true }, // e.g. "Placed at Infosys"
  avatar:      { type: String, default: "" },             // initials e.g. "PS"
  color:       { type: String, default: "#6366f1" },
  approved:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);
