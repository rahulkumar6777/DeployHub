import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PublicRoute from "./routes/PublicRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PrivateLayout from "./layouts/PrivateLayout";
import Projects from "./pages/Project";
import Usage from "./pages/Usage";
import VerificationGate from "./components/VerificationGate";
import VerifyPage from "./pages/verify";
import { Upgrade } from "./pages/Upgrade";
import MinimalLayout from "./layouts/MinimalLayout";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";

function Protected({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>

      {/* Public routes (blocked when logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected */}
      <Route
        element={
          <Protected>
            <VerificationGate>
              <PrivateLayout />
            </VerificationGate>
          </Protected>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/billing/upgrade" element={<Upgrade />} />
        <Route path="/profile" element={<Profile/>} />
      </Route>

      <Route
        path="/verify"
        element={
          <Protected>
            <VerifyPage />
          </Protected>
        }
      />


      <Route
        path="*"
        element={
          <div className="min-h-screen bg-[#050810] flex items-center justify-center">
            <div className="text-center">
              <div className="font-syne font-black text-8xl text-[#00e5ff]/20 mb-4">404</div>
              <div className="text-white font-semibold text-xl mb-2">Page not found</div>
              <div className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</div>
              <a href="/" className="bg-[#00e5ff] text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-cyan-300 transition-all">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}