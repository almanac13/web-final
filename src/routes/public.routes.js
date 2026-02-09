const router = require("express").Router();
const Club = require("../models/Club");

router.get("/clubs", async (req, res) => {
  const clubs = await Club.find()
    .select("name category description department createdAt")
    .sort({ createdAt: -1 });

  res.json(clubs);
});

module.exports = router;
