const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  listScholarships,
  getScholarship,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/scholarshipController");

router.get("/", protect, listScholarships);
router.get("/:id", protect, getScholarship);
router.post("/", protect, authorize("admin"), createScholarship);
router.put("/:id", protect, authorize("admin"), updateScholarship);
router.delete("/:id", protect, authorize("admin"), deleteScholarship);

module.exports = router;
