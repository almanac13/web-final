const User = require("../models/user");

async function getProfile(req, res) {
  const user = await User.findById(req.user.userId).select("username email role createdAt");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

async function updateProfile(req, res) {
  const { username, email } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.user.userId,
    { ...(username && { username }), ...(email && { email }) },
    { new: true, runValidators: true }
  ).select("username email role createdAt");

  res.json(updated);
}

module.exports = { getProfile, updateProfile };
