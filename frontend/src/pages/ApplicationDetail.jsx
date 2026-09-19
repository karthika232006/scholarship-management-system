import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";

const backLink = {
  student: "/student/applications",
  verifier: "/verifier",
  approver: "/approver",
  admin: "/admin",
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get(`/applications/${id}`).then(({ data }) => setApplication(data.application));

  useEffect(() => {
    load();
  }, [id]);

  const act = async (endpoint, decision) => {
    setError("");
    setSubmitting(true);
    try {
      await api.patch(`/applications/${id}/${endpoint}`, { decision, remark });
      setRemark("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const disburse = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/applications/${id}/disburse`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!application) return <p className="text-gray-500">Loading...</p>;

  const { student, scholarship, academicDetails, incomeDetails, documents, status, statusHistory } = application;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(backLink[user.role] || "/")} className="text-sm text-brand-600 mb-4 inline-block">
        ← Back
      </button>

      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{scholarship?.title}</h1>
            <p className="text-sm text-gray-500">Amount: ₹{scholarship?.amount?.toLocaleString()}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {user.role !== "student" && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
            <p><span className="font-medium text-gray-700">Student:</span> {student?.name} ({student?.email})</p>
            <p><span className="font-medium text-gray-700">Department:</span> {student?.department}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
          <p><span className="font-medium text-gray-700">Institution:</span> {academicDetails?.institution}</p>
          <p><span className="font-medium text-gray-700">Course:</span> {academicDetails?.course}</p>
          <p><span className="font-medium text-gray-700">Year:</span> {academicDetails?.year}</p>
          <p><span className="font-medium text-gray-700">CGPA:</span> {academicDetails?.cgpa}</p>
          <p><span className="font-medium text-gray-700">Family Income:</span> ₹{incomeDetails?.familyIncome?.toLocaleString()}</p>
        </div>

        {documents?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="font-medium text-gray-700 text-sm mb-2">Documents</p>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc, idx) => (
                <a
                  key={idx}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="badge bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  📄 {doc.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

      {user.role === "verifier" && status === "under_verification" && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3">Verify Documents</h2>
          <textarea
            className="input mb-3"
            placeholder="Remark (optional)"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <div className="flex gap-3">
            <button disabled={submitting} onClick={() => act("verify", "verified")} className="btn-primary flex-1">
              Verify &amp; Forward
            </button>
            <button disabled={submitting} onClick={() => act("verify", "rejected")} className="btn-danger flex-1">
              Reject
            </button>
          </div>
        </div>
      )}

      {user.role === "approver" && status === "under_approval" && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3">Approval Decision</h2>
          <textarea
            className="input mb-3"
            placeholder="Remark (optional)"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <div className="flex gap-3">
            <button disabled={submitting} onClick={() => act("decide", "approved")} className="btn-primary flex-1">
              Approve
            </button>
            <button disabled={submitting} onClick={() => act("decide", "rejected")} className="btn-danger flex-1">
              Reject
            </button>
          </div>
        </div>
      )}

      {user.role === "admin" && status === "approved" && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3">Disbursement</h2>
          <button disabled={submitting} onClick={disburse} className="btn-primary w-full">
            Mark as Disbursed
          </button>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4">Status Timeline</h2>
        <StatusTimeline history={statusHistory} />
      </div>
    </div>
  );
};

export default ApplicationDetail;
