import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const emptyForm = { title: "", description: "", eligibility: "", amount: "", department: "All", deadline: "" };

const ManageScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/scholarships", { params: { all: "true" } }).then(({ data }) => setScholarships(data.scholarships));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await api.put(`/scholarships/${editingId}`, payload);
      } else {
        await api.post("/scholarships", payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save scholarship");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setForm({
      title: s.title,
      description: s.description,
      eligibility: s.eligibility,
      amount: s.amount,
      department: s.department,
      deadline: s.deadline?.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (s) => {
    await api.put(`/scholarships/${s._id}`, { isActive: !s.isActive });
    await load();
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    await api.delete(`/scholarships/${s._id}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Manage Scholarships</h1>
        <Link to="/admin" className="btn-secondary">← Back to Overview</Link>
      </div>

      <div className="card mb-8">
        <h2 className="font-semibold mb-4">{editingId ? "Edit Scholarship" : "Create New Scholarship"}</h2>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Eligibility Criteria</label>
            <input required className="input" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Amount (₹)</label>
              <input required type="number" min="0" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input required type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {editingId ? "Save Changes" : "Create Scholarship"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="font-semibold mb-3">All Scholarships</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {scholarships.map((s) => (
            <div key={s._id} className="card flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-gray-500">
                  ₹{s.amount.toLocaleString()} · Deadline {new Date(s.deadline).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
                <button onClick={() => handleEdit(s)} className="btn-secondary">Edit</button>
                <button onClick={() => toggleActive(s)} className="btn-secondary">
                  {s.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDelete(s)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageScholarships;
