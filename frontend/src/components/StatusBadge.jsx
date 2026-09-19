const STYLES = {
  submitted: "bg-gray-100 text-gray-700",
  under_verification: "bg-amber-100 text-amber-800",
  verification_rejected: "bg-red-100 text-red-700",
  verified: "bg-blue-100 text-blue-700",
  under_approval: "bg-indigo-100 text-indigo-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  disbursed: "bg-emerald-100 text-emerald-800",
};

const LABELS = {
  submitted: "Submitted",
  under_verification: "Under Verification",
  verification_rejected: "Verification Rejected",
  verified: "Verified",
  under_approval: "Under Approval",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STYLES[status] || "bg-gray-100 text-gray-700"}`}>
    {LABELS[status] || status}
  </span>
);

export default StatusBadge;
