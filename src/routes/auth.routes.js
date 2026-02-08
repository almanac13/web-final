const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/auth.schema");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

module.exports = router;
