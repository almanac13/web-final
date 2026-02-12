// src/routes/admin.routes.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const KeyRequest = require("../models/KeyRequest");
const DepartmentKey = require("../models/DepartmentKey");
const Club = require("../models/Club");

const { sendMail } = require("../utils/mailer");

// GET all key requests
router.get("/key-requests", auth, requireAdmin, async (req, res) => {
  const requests = await KeyRequest.find().sort({ createdAt: -1 });
  res.json(requests);
});

// APPROVE key request (create department key + email)
router.post("/key-requests/:id/approve", auth, requireAdmin, async (req, res) => {
  const reqDoc = await KeyRequest.findById(req.params.id);
  if (!reqDoc) return res.status(404).json({ error: "Request not found" });

  const keyValue = `${reqDoc.department.toUpperCase().replace(/\s+/g, "-")}-${Date.now()}`;

  await DepartmentKey.create({
    department: reqDoc.department,
    key: keyValue,
    isActive: true,
  });

  reqDoc.status = "approved";
  await reqDoc.save();

  await sendMail(
    reqDoc.email,
    "Department Key Approved",
    `Your department key has been approved.\n\nKey: ${keyValue}`
  );

  res.json({ message: "Approved and email sent", key: keyValue });
});

// DECLINE key request (email)
router.post("/key-requests/:id/decline", auth, requireAdmin, async (req, res) => {
  const reqDoc = await KeyRequest.findById(req.params.id);
  if (!reqDoc) return res.status(404).json({ error: "Request not found" });

  reqDoc.status = "rejected";
  await reqDoc.save();

  await sendMail(
    reqDoc.email,
    "Department Key Request Declined",
    "Sorry, your request for a department key was declined."
  );

  res.json({ message: "Declined and email sent" });
});

// GET all clubs (admin only)
router.get("/clubs", auth, requireAdmin, async (req, res) => {
  const clubs = await Club.find().populate("owner", "email username");
  res.json(clubs);
});

// 🗑 DELETE club by admin (email owner)
router.delete("/clubs/:id", auth, requireAdmin, async (req, res) => {
  const club = await Club.findById(req.params.id).populate("owner", "email username");
  if (!club) return res.status(404).json({ error: "Club not found" });

  const ownerEmail = club.owner?.email;

  await club.deleteOne();

  if (ownerEmail) {
    await sendMail(
      ownerEmail,
      "Your club was removed",
      `Your club "${club.name}" was removed by university administration.`
    );
  }

  res.json({ message: "Club deleted and owner notified" });
});

module.exports = router;
