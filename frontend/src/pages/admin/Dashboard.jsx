import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (status) => {
    setLoading(true);
    const [statsRes, appsRes] = await Promise.all([
      api.get("/applications/stats/summary"),
      api.get("/applications", { params: status ? { status } : {} }),
    ]);
    setStats(statsRes.data);
    setApplications(appsRes.data.applications);
    setLoading(false);
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const statusCount = (status) => stats?.byStatus.find((s) => s._id === status)?.count || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Admin Overview</h1>
        <Link to="/admin/scholarships" className="btn-secondary">Manage Scholarships</Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-2xl font-semibold">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Applications</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-semibold text-amber-600">{statusCount("under_verification")}</p>
            <p className="text-xs text-gray-500 mt-1">Under Verification</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-semibold text-indigo-600">{statusCount("under_approval")}</p>
            <p className="text-xs text-gray-500 mt-1">Under Approval</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-semibold text-emerald-600">{statusCount("disbursed")}</p>
            <p className="text-xs text-gray-500 mt-1">Disbursed</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-gray-500">Filter by status:</label>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="submitted">Submitted</option>
          <option value="under_verification">Under Verification</option>
          <option value="verification_rejected">Verification Rejected</option>
          <option value="verified">Verified</option>
          <option value="under_approval">Under Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="disbursed">Disbursed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500">No applications found for this filter.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link
              to={`/applications/${app._id}`}
              key={app._id}
              className="card flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h2 className="font-medium">{app.scholarship?.title}</h2>
                <p className="text-sm text-gray-500">{app.student?.name} · {app.student?.email}</p>
              </div>
              <StatusBadge status={app.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
