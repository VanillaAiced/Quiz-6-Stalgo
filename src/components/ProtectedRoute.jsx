import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, requiredRole, userRole, children }) {
  // Not logged in - redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Logged in but doesn't have required role
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
