const router = require("express").Router();
const DepartmentKey = require("../models/DepartmentKey");

router.post("/seed-keys", async (req, res) => {
  // пример ключей (выдуманные)
  const keys = [
    { department: "CS Department", key: "CS-2026-KEY", isActive: true },
    { department: "Business Department", key: "BIZ-2026-KEY", isActive: true },
  ];

  await DepartmentKey.deleteMany({});
  await DepartmentKey.insertMany(keys);

  res.json({ message: "Seeded", keys });
});

module.exports = router;
