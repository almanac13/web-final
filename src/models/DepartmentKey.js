const mongoose = require("mongoose");

const departmentKeySchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepartmentKey", departmentKeySchema);
