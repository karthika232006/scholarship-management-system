import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

const VerifierDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications").then(({ data }) => setApplications(data.applications)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Verification Queue</h1>
      <p className="text-sm text-gray-500 mb-6">Applications awaiting document verification</p>

      {applications.length === 0 && <p className="text-gray-500">No applications pending verification. 🎉</p>}

      <div className="space-y-3">
        {applications.map((app) => (
          <Link
            to={`/applications/${app._id}`}
            key={app._id}
            className="card flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <h2 className="font-medium">{app.scholarship?.title}</h2>
              <p className="text-sm text-gray-500">
                {app.student?.name} · {app.student?.email}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VerifierDashboard;
