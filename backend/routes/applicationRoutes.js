const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  submitApplication,
  myApplications,
  listApplications,
  getApplication,
  verifyApplication,
  decideApplication,
  disburseApplication,
  getStats,
} = require("../controllers/applicationController");

router.post("/", protect, authorize("student"), upload.array("documents", 5), submitApplication);
router.get("/mine", protect, authorize("student"), myApplications);
router.get("/stats/summary", protect, authorize("admin"), getStats);
router.get("/", protect, authorize("verifier", "approver", "admin"), listApplications);
router.get("/:id", protect, getApplication);
router.patch("/:id/verify", protect, authorize("verifier"), verifyApplication);
router.patch("/:id/decide", protect, authorize("approver"), decideApplication);
router.patch("/:id/disburse", protect, authorize("admin"), disburseApplication);

module.exports = router;
