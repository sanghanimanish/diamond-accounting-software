import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component - Guards routes from unauthenticated access.
 * If user is not logged in, it redirects to the login page.
 */
const ProtectedRoute = ({ redirectPath = '/login', requiredRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card glass">
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // If a role is required, check if user has it
  if (requiredRole && !user.roles?.some(role => role.slug === requiredRole)) {
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard if no permission
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
