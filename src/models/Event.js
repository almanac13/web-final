const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  title: { type: String, required: true, minlength: 2 },
  type: { type: String, enum: ["activity", "tournament"], required: true },
  description: { type: String, default: "" },
  date: { type: Date, required: true },
  location: { type: String, default: "" },
  capacity: { type: Number, default: 0 }, // 0 = unlimited
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
