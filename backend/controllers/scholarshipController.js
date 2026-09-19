const Scholarship = require("../models/Scholarship");

// @route GET /api/scholarships (public listing, students browse active ones)
exports.listScholarships = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const scholarships = await Scholarship.find(filter).sort({ deadline: 1 });
    res.json({ scholarships });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch scholarships", error: err.message });
  }
};

// @route GET /api/scholarships/:id
exports.getScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: "Scholarship not found" });
    res.json({ scholarship });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch scholarship", error: err.message });
  }
};

// @route POST /api/scholarships (admin only)
exports.createScholarship = async (req, res) => {
  try {
    const { title, description, eligibility, amount, department, deadline } = req.body;
    if (!title || !description || !eligibility || !amount || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const scholarship = await Scholarship.create({
      title,
      description,
      eligibility,
      amount,
      department,
      deadline,
      createdBy: req.user._id,
    });
    res.status(201).json({ scholarship });
  } catch (err) {
    res.status(500).json({ message: "Failed to create scholarship", error: err.message });
  }
};

// @route PUT /api/scholarships/:id (admin only)
exports.updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!scholarship) return res.status(404).json({ message: "Scholarship not found" });
    res.json({ scholarship });
  } catch (err) {
    res.status(500).json({ message: "Failed to update scholarship", error: err.message });
  }
};

// @route DELETE /api/scholarships/:id (admin only)
exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) return res.status(404).json({ message: "Scholarship not found" });
    res.json({ message: "Scholarship deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete scholarship", error: err.message });
  }
};
