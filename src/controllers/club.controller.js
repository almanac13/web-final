const Club = require("../models/Club");

// POST /clubs
async function createClub(req, res) {
  const club = await Club.create({
    ...req.body,
    owner: req.user.userId,
  });
  res.status(201).json(club);
}

// GET /clubs (только мои)
async function listClubs(req, res) {
  const clubs = await Club.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(clubs);
}

// GET /clubs/:id (только мой)
async function getClub(req, res) {
  const club = await Club.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json(club);
}

// PUT /clubs/:id (только мой)
async function updateClub(req, res) {
  const club = await Club.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json(club);
}

// DELETE /clubs/:id (только мой)
async function deleteClub(req, res) {
  const club = await Club.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json({ message: "Deleted" });
}

module.exports = { createClub, listClubs, getClub, updateClub, deleteClub };
