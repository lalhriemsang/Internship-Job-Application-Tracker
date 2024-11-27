const express = require("express");
const {
  addSkill,
  updateSkill,
  deleteSkill,
  getSkillsByUser,
} = require("../controllers/skillController");
// const auth = require("../middleware/auth");
const router = express.Router();

// Route to add a new skill to the user
router.post("/", addSkill);

// Route to update an existing skill of the user
router.put("/", updateSkill);

// Route to delete a skill from the user
router.delete("/", deleteSkill);

// Route to get all skills of a user
router.get("/", getSkillsByUser);

module.exports = router;
