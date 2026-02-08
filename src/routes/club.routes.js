const router = require("express").Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createClubSchema, updateClubSchema } = require("../validators/club.schema");
const { createClub, listClubs, getClub, updateClub, deleteClub } = require("../controllers/club.controller");

router.post("/", auth, validate(createClubSchema), createClub);
router.get("/", auth, listClubs);
router.get("/:id", auth, getClub);
router.put("/:id", auth, validate(updateClubSchema), updateClub);
router.delete("/:id", auth, deleteClub);

module.exports = router;
