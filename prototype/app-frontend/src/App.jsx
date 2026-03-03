import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PublicRoute from "./routes/PublicRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PrivateLayout from "./layouts/PrivateLayout";
import ProjectLayout from "./layouts/ProjectLayout";
import Projects from "./pages/Project";
import Usage from "./pages/Usage";
import VerificationGate from "./components/VerificationGate";
import VerifyPage from "./pages/verify";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";
import NewDeployment from "./pages/NewDeployment";
import Overview from "./pages/Overview";
import Settings from "./pages/Settings";
import Builds from "./pages/Builds";
import BuildLogs from "./pages/BuildsLogs";

function Protected({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function ProtectedWithGate({ children }) {
  return (
    <Protected>
      <VerificationGate>{children}</VerificationGate>
    </Protected>
  );
}

export default function App() {
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* ── Main dashboard layout ── */}
      <Route element={<ProtectedWithGate><PrivateLayout /></ProtectedWithGate>}>
        <Route path="/"         element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/usage"    element={<Usage />} />
        <Route path="/billing"  element={<Billing />} />
        <Route path="/profile"  element={<Profile />} />
        <Route path="/:type/new" element={<NewDeployment />} />
      </Route>

      {/* ── Project layout (sidebar with project nav) ── */}
      <Route element={<ProtectedWithGate><ProjectLayout /></ProtectedWithGate>}>
        <Route path="/project/:id"          element={<Overview />} />
        <Route path="/project/:id/logs"     element={<div className="text-white p-4">Logs — coming soon</div>} />
        <Route path="/project/:id/builds"   element={<Builds />} />
        <Route path="/project/:id/logs/:buildId"     element={<BuildLogs />} />
        <Route path="/project/:id/metrics"  element={<div className="text-white p-4">Metrics — coming soon</div>} />
        <Route path="/project/:id/settings" element={ <Settings/> }/>
        <Route path="/project/:id/domains"  element={<div className="text-white p-4">Domains — coming soon</div>} />
        <Route path="/project/:id/billing"  element={<div className="text-white p-4">Billing — coming soon</div>} />
      </Route>

      {/* ── Verify ── */}
      <Route path="/verify" element={<Protected><VerifyPage /></Protected>} />

      {/* ── 404 ── */}
      <Route path="*" element={
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
      } />

    </Routes>
  );
}