import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PublicRoute from "./routes/PublicRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PrivateLayout from "./layouts/PrivateLayout";
import ProjectLayout from "./layouts/ProjectLayout";
import VerificationGate from "./components/VerificationGate";
import VerifyPage from "./Pages/verify";

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


      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />


      <Route element={<ProtectedWithGate><PrivateLayout /></ProtectedWithGate>}>
        <Route path="/" element={<Home />} />
      </Route>


      <Route path="/verify" element={<Protected><VerifyPage /></Protected>} />


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