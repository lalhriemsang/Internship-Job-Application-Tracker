const express = require("express");
const {
  getApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  SkillAnaylysisForJob,
  SkillsRecommedationsForJob,
  interviewPrepForJob,
} = require("../controllers/applicationController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/",  getApplications);
router.post("/",  addApplication);
router.post("/skillAnalysis",  SkillAnaylysisForJob);
router.post("/skillRecommendations", SkillsRecommedationsForJob);
router.post("/interviewPrep",  interviewPrepForJob);
router.put("/:applicationId",  updateApplication);
router.delete("/:applicationId",  deleteApplication);

module.exports = router;
