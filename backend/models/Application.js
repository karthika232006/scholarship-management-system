const mongoose = require("mongoose");

// Workflow:
// submitted -> under_verification (auto) -> verified -> under_approval (auto) -> approved -> disbursed
//                                        \-> verification_rejected (student may resubmit)
//                             verified -> \-> rejected (by approver)
const STATUSES = [
  "submitted",
  "under_verification",
  "verification_rejected",
  "verified",
  "under_approval",
  "approved",
  "rejected",
  "disbursed",
];

const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    remark: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scholarship: { type: mongoose.Schema.Types.ObjectId, ref: "Scholarship", required: true },
    academicDetails: {
      institution: { type: String, required: true },
      course: { type: String, required: true },
      year: { type: String, required: true },
      cgpa: { type: Number, required: true },
    },
    incomeDetails: {
      familyIncome: { type: Number, required: true },
    },
    documents: [
      {
        name: String,
        fileUrl: String,
      },
    ],
    status: { type: String, enum: STATUSES, default: "submitted" },
    verifierRemark: { type: String, default: "" },
    approverRemark: { type: String, default: "" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    statusHistory: [historyEntrySchema],
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, scholarship: 1 });

applicationSchema.methods.pushHistory = function (status, remark, userId) {
  this.status = status;
  this.statusHistory.push({ status, remark, updatedBy: userId, updatedAt: new Date() });
};

applicationSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model("Application", applicationSchema);
