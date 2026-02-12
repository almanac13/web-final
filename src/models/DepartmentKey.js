const mongoose = require("mongoose");

const departmentKeySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g. AITU-SE-2026
    department: { type: String, required: true },         // e.g. SE
    isActive: { type: Boolean, default: true },
    usesLeft: { type: Number, default: 1 },               // 1 = one-time, 999 = many uses
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepartmentKey", departmentKeySchema);
