import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function VerificationGate({ children }) {
    const { user, isAuthReady } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthReady && user && !user.verified) {
            navigate("/verify");
        }
    }, [isAuthReady, user, navigate]);

    if (!isAuthReady) return null;

    if (!user) return children;
    return children;
}