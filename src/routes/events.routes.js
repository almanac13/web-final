const router = require("express").Router();
const auth = require("../middleware/auth");

const Club = require("../models/Club");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const JoinRequest = require("../models/JoinRequest");

const { sendMail } = require("../utils/mailer");

// helper: userId from your JWT payload
function getUserId(req) {
  return req.user?.userId;
}

// ✅ owner create event in his club
router.post("/clubs/:clubId/events", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid token payload" });

    const { title, type, description, date, location, capacity } = req.body;

    if (!title || title.trim().length < 2) return res.status(400).json({ error: "Title min 2 chars" });
    if (!["activity", "tournament"].includes(type)) return res.status(400).json({ error: "Invalid type" });
    if (!date) return res.status(400).json({ error: "Date is required" });

    const club = await Club.findById(req.params.clubId).select("owner name");
    if (!club) return res.status(404).json({ error: "Club not found" });

    if (String(club.owner) !== String(userId)) {
      return res.status(403).json({ error: "Only owner can create events" });
    }

    const ev = await Event.create({
      club: club._id,
      title: title.trim(),
      type,
      description: (description || "").trim(),
      date: new Date(date),
      location: (location || "").trim(),
      capacity: Number(capacity || 0),
      createdBy: userId,
    });

    // OPTIONAL: email all approved members of the club (safe)
    try {
      const members = await JoinRequest.find({ club: club._id, status: "approved" })
        .populate("user", "email");
      for (const m of members) {
        if (m.user?.email) {
          await sendMail(
            m.user.email,
            `New ${type} in ${club.name}`,
            `New ${type}: "${ev.title}" on ${new Date(ev.date).toLocaleString()}.\nLocation: ${ev.location || "-"}`
          );
        }
      }
    } catch (e) {
      console.error("Notify members failed:", e.message);
    }

    res.status(201).json({ message: "Event created", event: ev });
  } catch (e) {
    console.error("Create event error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ user register to event (must be approved member)
router.post("/events/:eventId/register", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid token payload" });

    const ev = await Event.findById(req.params.eventId).populate("club", "name");
    if (!ev) return res.status(404).json({ error: "Event not found" });

    const member = await JoinRequest.findOne({ user: userId, club: ev.club._id, status: "approved" });
    if (!member) return res.status(403).json({ error: "Join the club first (approved) to register" });

    // capacity check
    if (ev.capacity > 0) {
      const count = await EventRegistration.countDocuments({ event: ev._id });
      if (count >= ev.capacity) return res.status(400).json({ error: "Event is full" });
    }

    const reg = await EventRegistration.create({ event: ev._id, user: userId });

    // email user (safe)
    try {
      const User = require("../models/User");
      const u = await User.findById(userId).select("email");
      if (u?.email) {
        await sendMail(
          u.email,
          "Registration confirmed",
          `You are registered for "${ev.title}" (${ev.club.name}).\nDate: ${new Date(ev.date).toLocaleString()}`
        );
      }
    } catch (e) {
      console.error("Email user failed:", e.message);
    }

    res.status(201).json({ message: "Registered", registrationId: reg._id });
  } catch (e) {
    // duplicate unique index -> already registered
    if (String(e?.code) === "11000") {
      return res.status(400).json({ error: "Already registered" });
    }
    console.error("Register event error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ my events (user)
router.get("/my/events", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid token payload" });

    const regs = await EventRegistration.find({ user: userId })
      .populate({
        path: "event",
        select: "title type date location club",
        populate: { path: "club", select: "name" },
      })
      .sort({ createdAt: -1 });

    const events = regs.map(r => ({
      _id: r.event?._id,
      title: r.event?.title,
      type: r.event?.type,
      date: r.event?.date,
      location: r.event?.location,
      clubName: r.event?.club?.name,
    }));

    res.json(events);
  } catch (e) {
    console.error("My events error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ owner: list registrations for one event
router.get("/events/:eventId/registrations", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid token payload" });

    const ev = await Event.findById(req.params.eventId).select("club title").populate("club", "owner name");
    if (!ev) return res.status(404).json({ error: "Event not found" });

    if (String(ev.club.owner) !== String(userId)) {
      return res.status(403).json({ error: "Only owner can view registrations" });
    }

    const regs = await EventRegistration.find({ event: ev._id })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json({ eventTitle: ev.title, clubName: ev.club.name, registrations: regs });
  } catch (e) {
    console.error("Registrations error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
