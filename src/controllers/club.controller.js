// src/controllers/club.controller.js
const Club = require("../models/Club");
const User = require("../models/User");
const DepartmentKey = require("../models/DepartmentKey");

// POST /clubs
// Требует departmentKey в body
async function createClub(req, res) {
  const { name, category, description, departmentKey } = req.body;

  // 1) ключ обязателен
  if (!departmentKey) {
    return res.status(403).json({ error: "Department key required" });
  }

  // 2) проверить ключ в базе
  const keyDoc = await DepartmentKey.findOne({ key: departmentKey, isActive: true });
  if (!keyDoc) {
    return res.status(403).json({ error: "Invalid department key" });
  }

  // 3) повысить роль пользователя до owner (если он ещё user)
  // (если admin — не трогаем)
  const currentUser = await User.findById(req.user.userId).select("role");
  if (!currentUser) return res.status(404).json({ error: "User not found" });

  if (currentUser.role === "user") {
    currentUser.role = "owner";
    await currentUser.save();
  }

  // 4) создать клуб
  const club = await Club.create({
    name,
    category,
    description: description || "",
    owner: req.user.userId,
    department: keyDoc.department, // привязали к кафедре/департаменту
  });

  return res.status(201).json(club);
}

// GET /clubs  (только мои клубы)
async function listClubs(req, res) {
  const clubs = await Club.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  return res.json(clubs);
}

// GET /clubs/:id (только мой клуб)
async function getClub(req, res) {
  const club = await Club.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!club) return res.status(404).json({ error: "Club not found" });
  return res.json(club);
}

// PUT /clubs/:id (только мой клуб)
// (departmentKey НЕ нужен для update)
async function updateClub(req, res) {
  const { name, category, description } = req.body;

  const club = await Club.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.userId },
    {
      ...(name !== undefined ? { name } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(description !== undefined ? { description } : {}),
    },
    { new: true, runValidators: true }
  );

  if (!club) return res.status(404).json({ error: "Club not found" });
  return res.json(club);
}

// DELETE /clubs/:id (только мой клуб)
async function deleteClub(req, res) {
  const club = await Club.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
  if (!club) return res.status(404).json({ error: "Club not found" });
  return res.json({ message: "Deleted" });
}

module.exports = {
  createClub,
  listClubs,
  getClub,
  updateClub,
  deleteClub,
};
