import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  student: "/student",
  verifier: "/verifier",
  approver: "/approver",
  admin: "/admin",
};

const roleLabel = {
  student: "Student",
  verifier: "Verifier",
  approver: "Approver",
  admin: "Admin",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={roleHome[user.role]} className="font-semibold text-brand-600 text-lg">
          🎓 Scholarship Portal
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="badge bg-brand-50 text-brand-700">{roleLabel[user.role]}</span>
          <span className="text-gray-600 hidden sm:inline">{user.name}</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
