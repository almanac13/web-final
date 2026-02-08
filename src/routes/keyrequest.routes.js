const router = require("express").Router();
const KeyRequest = require("../models/KeyRequest");

// Public endpoint (можно и без логина)
router.post("/", async (req, res) => {
  try {
    const { name, email, department, message } = req.body;

    if (!name || name.trim().length < 2) return res.status(400).json({ error: "Name required" });
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email required" });
    if (!department || department.trim().length < 2) return res.status(400).json({ error: "Department required" });

    const created = await KeyRequest.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      message: (message || "").trim(),
    });

    res.status(201).json({ message: "Request submitted", requestId: created._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
