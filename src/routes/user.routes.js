const router = require("express").Router();
const auth = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/user.controller");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;
