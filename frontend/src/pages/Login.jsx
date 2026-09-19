import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  student: "/student",
  verifier: "/verifier",
  approver: "/approver",
  admin: "/admin",
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-1">🎓 Scholarship Portal</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          New student?{" "}
          <Link to="/register" className="text-brand-600 font-medium">
            Create an account
          </Link>
        </p>

        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
          <p className="font-medium mb-1">Demo accounts (after running the seed script):</p>
          <p>admin@scholarship.edu / Admin@123</p>
          <p>verifier@scholarship.edu / Verify@123</p>
          <p>approver@scholarship.edu / Approve@123</p>
          <p>student@scholarship.edu / Student@123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
