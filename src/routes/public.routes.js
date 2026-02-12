const router = require("express").Router();
const Club = require("../models/Club");
const Event = require("../models/Event");

router.get("/clubs", async (req, res) => {
  const clubs = await Club.find()
    .select("name category description department createdAt")
    .sort({ createdAt: -1 });
  res.json(clubs);
});

// club details
router.get("/clubs/:id", async (req, res) => {
  const club = await Club.findById(req.params.id)
    .select("name category description department createdAt owner");
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json(club);
});

//  list events of club
router.get("/clubs/:id/events", async (req, res) => {
  const events = await Event.find({ club: req.params.id })
    .select("title type description date location capacity createdAt")
    .sort({ date: 1 });
  res.json(events);
});

module.exports = router;
