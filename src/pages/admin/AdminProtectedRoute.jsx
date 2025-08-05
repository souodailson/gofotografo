import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAdminAuthenticated = localStorage.getItem('gofotografo_admin_auth') === 'true';

  if (!isAdminAuthenticated) {
    return <Navigate to="/control-acess/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
