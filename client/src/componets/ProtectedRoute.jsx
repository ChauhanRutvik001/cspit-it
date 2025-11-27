import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const authStatus = useSelector((store) => store.app.authStatus);
  const user = useSelector((store) => store.app.user);
  const isLoading = useSelector((store) => store.app.isLoading);
  const location = useLocation();
  
  console.log('ProtectedRoute - authStatus:', authStatus, 'user:', !!user, 'loading:', isLoading);
  
  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!authStatus || !user) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('ProtectedRoute - Rendering protected content');
  return children;
};

export default ProtectedRoute;