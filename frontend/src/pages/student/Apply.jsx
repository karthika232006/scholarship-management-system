import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const Apply = () => {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [form, setForm] = useState({ institution: "", course: "", year: "", cgpa: "", familyIncome: "" });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/scholarships/${scholarshipId}`).then(({ data }) => setScholarship(data.scholarship));
  }, [scholarshipId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("scholarshipId", scholarshipId);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("documents", f));

      await api.post("/applications", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/student/applications");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!scholarship) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/student" className="text-sm text-brand-600 mb-4 inline-block">← Back to scholarships</Link>
      <div className="card mb-6">
        <h1 className="text-xl font-semibold">{scholarship.title}</h1>
        <p className="text-sm text-gray-600 mt-1">{scholarship.description}</p>
        <p className="text-sm text-gray-500 mt-2">Amount: ₹{scholarship.amount.toLocaleString()}</p>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Application Details</h2>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Institution</label>
              <input required className="input" value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            </div>
            <div>
              <label className="label">Course</label>
              <input required className="input" value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })} />
            </div>
            <div>
              <label className="label">Year of Study</label>
              <input required className="input" value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
            <div>
              <label className="label">Current CGPA</label>
              <input required type="number" step="0.01" min="0" max="10" className="input" value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Annual Family Income (₹)</label>
              <input required type="number" min="0" className="input" value={form.familyIncome}
                onChange={(e) => setForm({ ...form, familyIncome: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Supporting Documents (PDF/JPG/PNG, up to 5)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="input"
              onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
            />
            <p className="text-xs text-gray-400 mt-1">e.g. income certificate, mark sheets, ID proof</p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Apply;
