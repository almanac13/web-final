const router = require("express").Router();
const auth = require("../middleware/auth");
const JoinRequest = require("../models/JoinRequest");

// My clubs = approved join requests
router.get("/clubs", auth, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Invalid token payload (no userId)" });

  const requests = await JoinRequest.find({ user: userId, status: "approved" })
    .populate("club", "name category description department")
    .sort({ createdAt: -1 });

  const clubs = requests.map(r => r.club);
  res.json(clubs);
});

module.exports = router;
