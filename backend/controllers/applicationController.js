const Application = require("../models/Application");
const Scholarship = require("../models/Scholarship");

// @route POST /api/applications  (student)
exports.submitApplication = async (req, res) => {
  try {
    const { scholarshipId, institution, course, year, cgpa, familyIncome } = req.body;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship || !scholarship.isActive) {
      return res.status(404).json({ message: "Scholarship not found or no longer active" });
    }
    if (new Date(scholarship.deadline) < new Date()) {
      return res.status(400).json({ message: "The deadline for this scholarship has passed" });
    }

    const existing = await Application.findOne({ student: req.user._id, scholarship: scholarshipId });
    if (existing) {
      return res.status(409).json({ message: "You have already applied for this scholarship" });
    }

    const documents = (req.files || []).map((f) => ({
      name: f.originalname,
      fileUrl: `/uploads/${f.filename}`,
    }));

    const application = new Application({
      student: req.user._id,
      scholarship: scholarshipId,
      academicDetails: { institution, course, year, cgpa },
      incomeDetails: { familyIncome },
      documents,
    });

    application.pushHistory("submitted", "Application submitted by student", req.user._id);
    // Auto-advance into the verification queue so verifiers see it immediately.
    application.pushHistory("under_verification", "Awaiting document verification", req.user._id);

    await application.save();
    res.status(201).json({ application });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit application", error: err.message });
  }
};

// @route GET /api/applications/mine (student)
exports.myApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("scholarship", "title amount deadline department")
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your applications", error: err.message });
  }
};

// @route GET /api/applications (verifier/approver/admin) - role-scoped queue
exports.listApplications = async (req, res) => {
  try {
    const role = req.user.role;
    let filter = {};

    if (role === "verifier") {
      filter.status = { $in: ["under_verification"] };
    } else if (role === "approver") {
      filter.status = { $in: ["under_approval"] };
    } else if (role === "admin") {
      if (req.query.status) filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate("student", "name email department")
      .populate("scholarship", "title amount deadline department")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
};

// @route GET /api/applications/:id (any authenticated role that has access)
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("student", "name email department profile")
      .populate("scholarship")
      .populate("statusHistory.updatedBy", "name role");

    if (!application) return res.status(404).json({ message: "Application not found" });

    const isOwner = application.student._id.toString() === req.user._id.toString();
    const isStaff = ["verifier", "approver", "admin"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "You do not have access to this application" });
    }

    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch application", error: err.message });
  }
};

// @route PATCH /api/applications/:id/verify (verifier)
exports.verifyApplication = async (req, res) => {
  try {
    const { decision, remark } = req.body; // decision: 'verified' | 'rejected'
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "under_verification") {
      return res.status(400).json({ message: `Cannot verify an application with status '${application.status}'` });
    }

    application.verifierRemark = remark || "";
    application.verifiedBy = req.user._id;

    if (decision === "verified") {
      application.pushHistory("verified", remark || "Documents verified", req.user._id);
      application.pushHistory("under_approval", "Forwarded for approval", req.user._id);
    } else {
      application.pushHistory("verification_rejected", remark || "Verification rejected", req.user._id);
    }

    await application.save();
    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: "Failed to record verification", error: err.message });
  }
};

// @route PATCH /api/applications/:id/decide (approver)
exports.decideApplication = async (req, res) => {
  try {
    const { decision, remark } = req.body; // decision: 'approved' | 'rejected'
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "under_approval") {
      return res.status(400).json({ message: `Cannot decide on an application with status '${application.status}'` });
    }

    application.approverRemark = remark || "";
    application.approvedBy = req.user._id;
    application.pushHistory(
      decision === "approved" ? "approved" : "rejected",
      remark || (decision === "approved" ? "Application approved" : "Application rejected"),
      req.user._id
    );

    await application.save();
    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: "Failed to record decision", error: err.message });
  }
};

// @route PATCH /api/applications/:id/disburse (admin)
exports.disburseApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "approved") {
      return res.status(400).json({ message: "Only approved applications can be marked as disbursed" });
    }
    application.pushHistory("disbursed", "Scholarship amount disbursed", req.user._id);
    await application.save();
    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as disbursed", error: err.message });
  }
};

// @route GET /api/applications/stats/summary (admin)
exports.getStats = async (req, res) => {
  try {
    const counts = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const total = await Application.countDocuments();
    res.json({ total, byStatus: counts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch statistics", error: err.message });
  }
};
