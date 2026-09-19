import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicationDetail from "./pages/ApplicationDetail";

import StudentDashboard from "./pages/student/Dashboard";
import Apply from "./pages/student/Apply";
import MyApplications from "./pages/student/MyApplications";

import VerifierDashboard from "./pages/verifier/Dashboard";
import ApproverDashboard from "./pages/approver/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageScholarships from "./pages/admin/ManageScholarships";

const roleHome = {
  student: "/student",
  verifier: "/verifier",
  approver: "/approver",
  admin: "/admin",
};

const Layout = ({ children }) => (
  <div className="min-h-screen">
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
  </div>
);

const Home = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || "/login"} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <Layout><StudentDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/apply/:scholarshipId"
        element={
          <ProtectedRoute roles={["student"]}>
            <Layout><Apply /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute roles={["student"]}>
            <Layout><MyApplications /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications/:id"
        element={
          <ProtectedRoute roles={["student"]}>
            <Layout><ApplicationDetail /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/verifier"
        element={
          <ProtectedRoute roles={["verifier"]}>
            <Layout><VerifierDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/approver"
        element={
          <ProtectedRoute roles={["approver"]}>
            <Layout><ApproverDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/scholarships"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Layout><ManageScholarships /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Shared detail route used by verifier / approver / admin action links */}
      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute roles={["verifier", "approver", "admin"]}>
            <Layout><ApplicationDetail /></Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
