import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.info("Please log in to the features.", { toastId: "login-toast" });
    } else if (!user.is_verified) {
      toast.info("Please verify your account to continue using the features.", { toastId: "verify-toast" });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.is_verified) {
    return <Navigate to="/verifyotp" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;