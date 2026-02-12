const jwt = require("jsonwebtoken");
const Club = require("../models/Club");
const User = require("../models/User");
const DepartmentKey = require("../models/DepartmentKey");

// POST /clubs  (protected)
exports.createClub = async (req, res) => {
  try {
    // from your auth middleware: req.user = payload
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, category, department, description, departmentKey } = req.body;

    // verify department key (university)
    const key = await DepartmentKey.findOne({
      code: String(departmentKey || "").trim(),
      isActive: true,
    });

    if (!key) return res.status(403).json({ error: "Invalid or inactive department key" });
    if (key.usesLeft <= 0) return res.status(403).json({ error: "Department key has no uses left" });

    // create club
    const club = await Club.create({
      name: String(name).trim(),
      category: String(category).trim(),
      department: String(department || key.department || "").trim(),
      description: String(description).trim(),
      owner: userId,
    });

    // decrease key usage
    key.usesLeft -= 1;
    await key.save();

    // upgrade user to owner (do not downgrade admin)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "admin") {
      user.role = "owner";
      await user.save();
    }

    // NEW token with updated role
    const newToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Club created. You are now an owner",
      club,
      token: newToken,
    });
  } catch (e) {
    console.error("createClub error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /clubs  (owner or admin)
exports.listClubs = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    let query = {};
    if (role !== "admin") query.owner = userId;

    const clubs = await Club.find(query).sort({ createdAt: -1 });
    res.json(clubs);
  } catch (e) {
    console.error("listClubs error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /clubs/:id
exports.getClub = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const club = await Club.findById(req.params.id).populate("owner", "email username role");
    if (!club) return res.status(404).json({ error: "Club not found" });

    if (role !== "admin" && club.owner?._id.toString() !== userId)
      return res.status(403).json({ error: "Forbidden" });

    res.json(club);
  } catch (e) {
    console.error("getClub error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /clubs/:id
exports.updateClub = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: "Club not found" });

    if (role !== "admin" && club.owner?.toString() !== userId)
      return res.status(403).json({ error: "Forbidden" });

    const { name, category, department, description } = req.body;
    if (name) club.name = String(name).trim();
    if (category) club.category = String(category).trim();
    if (department) club.department = String(department).trim();
    if (description !== undefined) club.description = String(description);

    await club.save();
    res.json({ message: "Updated", club });
  } catch (e) {
    console.error("updateClub error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /clubs/:id
exports.deleteClub = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const club = await Club.findById(req.params.id).populate("owner", "email username");
    if (!club) return res.status(404).json({ error: "Club not found" });

    if (role !== "admin" && club.owner?._id.toString() !== userId)
      return res.status(403).json({ error: "Forbidden" });

    const ownerEmail = club.owner?.email;
    await club.deleteOne();

    if (ownerEmail) {
      // optional: notify owner via mail util if desired
    }

    res.json({ message: "Club deleted" });
  } catch (e) {
    console.error("deleteClub error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};
