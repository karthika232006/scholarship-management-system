import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications/mine").then(({ data }) => setApplications(data.applications)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">My Applications</h1>
        <Link to="/student" className="btn-secondary">Browse Scholarships</Link>
      </div>

      {applications.length === 0 && <p className="text-gray-500">You haven't applied to any scholarships yet.</p>}

      <div className="space-y-3">
        {applications.map((app) => (
          <Link
            to={`/student/applications/${app._id}`}
            key={app._id}
            className="card flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <h2 className="font-medium">{app.scholarship?.title}</h2>
              <p className="text-sm text-gray-500">
                Applied on {new Date(app.createdAt).toLocaleDateString()} · ₹{app.scholarship?.amount?.toLocaleString()}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;
