import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const StudentDashboard = () => {
  const [scholarships, setScholarships] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [schRes, appRes] = await Promise.all([
          api.get("/scholarships"),
          api.get("/applications/mine"),
        ]);
        setScholarships(schRes.data.scholarships);
        setMyApps(appRes.data.applications);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load scholarships");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const appliedIds = new Set(myApps.map((a) => a.scholarship?._id));

  if (loading) return <p className="text-gray-500">Loading scholarships...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Available Scholarships</h1>
        <Link to="/student/applications" className="btn-secondary">
          My Applications ({myApps.length})
        </Link>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

      {scholarships.length === 0 && (
        <p className="text-gray-500">No active scholarships at the moment. Please check back later.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {scholarships.map((s) => {
          const applied = appliedIds.has(s._id);
          const expired = new Date(s.deadline) < new Date();
          return (
            <div key={s._id} className="card flex flex-col">
              <h2 className="font-semibold text-lg">{s.title}</h2>
              <p className="text-sm text-gray-600 mt-1 flex-1">{s.description}</p>
              <div className="text-sm text-gray-500 mt-3 space-y-1">
                <p><span className="font-medium text-gray-700">Amount:</span> ₹{s.amount.toLocaleString()}</p>
                <p><span className="font-medium text-gray-700">Eligibility:</span> {s.eligibility}</p>
                <p><span className="font-medium text-gray-700">Deadline:</span> {new Date(s.deadline).toLocaleDateString()}</p>
              </div>
              <div className="mt-4">
                {applied ? (
                  <span className="badge bg-blue-100 text-blue-700">Already Applied</span>
                ) : expired ? (
                  <span className="badge bg-gray-100 text-gray-500">Deadline Passed</span>
                ) : (
                  <Link to={`/student/apply/${s._id}`} className="btn-primary w-full">
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;
