// src/routes/join.routes.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const JoinRequest = require("../models/JoinRequest");
const Club = require("../models/Club");
const { sendMail } = require("../utils/mailer");

// CREATE join request (USER)
router.post("/:clubId", auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId).populate("owner", "email");
    if (!club) return res.status(404).json({ error: "Club not found" });

    // IMPORTANT: your auth payload uses userId
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Invalid token payload (no userId)" });

    // prevent duplicate pending request
    const exists = await JoinRequest.findOne({
      user: userId,
      club: club._id,
      status: "pending",
    });

    if (exists) return res.status(400).json({ error: "Request already sent" });

    const jr = await JoinRequest.create({
      user: userId,
      club: club._id,
    });

    // email owner (do NOT break API if email fails)
    const ownerEmail = club.owner?.email;
    if (ownerEmail) {
      try {
        await sendMail(
          ownerEmail,
          "New join request",
          `A user requested to join your club "${club.name}".`
        );
      } catch (e) {
        console.error("Email to owner failed:", e.message);
      }
    }

    res.status(201).json({ message: "Join request sent", requestId: jr._id });
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// OWNER: view requests for owner clubs
router.get("/owner/all", auth, async (req, res) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) return res.status(401).json({ error: "Invalid token payload (no userId)" });

    const clubs = await Club.find({ owner: ownerId }).select("_id");
    const clubIds = clubs.map((c) => c._id);

    const requests = await JoinRequest.find({ club: { $in: clubIds } })
      .populate("user", "username email")
      .populate("club", "name")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Owner requests error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// OWNER: approve join request
router.post("/:id/approve", auth, async (req, res) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) return res.status(401).json({ error: "Invalid token payload (no userId)" });

    const jr = await JoinRequest.findById(req.params.id)
      .populate("user", "email")
      .populate("club", "name owner");

    if (!jr) return res.status(404).json({ error: "Request not found" });
    if (jr.status !== "pending") return res.status(400).json({ error: "Already processed" });

    // security: ensure this owner owns the club
    if (String(jr.club.owner) !== String(ownerId)) {
      return res.status(403).json({ error: "Not your club" });
    }

    jr.status = "approved";
    await jr.save();

    // email user
    try {
      await sendMail(
        jr.user.email,
        "Join request approved",
        `You have been approved to join "${jr.club.name}".`
      );
    } catch (e) {
      console.error("Email to user failed:", e.message);
    }

    res.json({ message: "Approved" });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// OWNER: decline join request
router.post("/:id/decline", auth, async (req, res) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) return res.status(401).json({ error: "Invalid token payload (no userId)" });

    const jr = await JoinRequest.findById(req.params.id)
      .populate("user", "email")
      .populate("club", "name owner");

    if (!jr) return res.status(404).json({ error: "Request not found" });
    if (jr.status !== "pending") return res.status(400).json({ error: "Already processed" });

    // security: ensure this owner owns the club
    if (String(jr.club.owner) !== String(ownerId)) {
      return res.status(403).json({ error: "Not your club" });
    }

    jr.status = "rejected";
    await jr.save();

    try {
      await sendMail(
        jr.user.email,
        "Join request declined",
        `Your request to join "${jr.club.name}" was declined.`
      );
    } catch (e) {
      console.error("Email to user failed:", e.message);
    }

    res.json({ message: "Declined" });
  } catch (err) {
    console.error("Decline error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
