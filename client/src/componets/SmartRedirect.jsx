import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PublicLayout from './PublicLayout';
import Browse from './Browse';

const SmartRedirect = () => {
  const navigate = useNavigate();
  const authStatus = useSelector((store) => store.app.authStatus);
  const user = useSelector((store) => store.app.user);

  useEffect(() => {
    // Small delay to ensure Redux state is fully loaded
    const timer = setTimeout(() => {
      if (authStatus === true && user && user.id) {
        console.log('User is authenticated, redirecting to appropriate dashboard...');
        
        // Role-based redirect for authenticated users
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "counsellor") {
          navigate("/counsellor", { replace: true });
        } else if (user.role === "student") {
          navigate("/company", { replace: true });
        } else {
          navigate("/browse", { replace: true });
        }
      }
      // If not authenticated, stay on the public page (component will render Browse)
    }, 500); // Half second delay to ensure auth state is loaded

    return () => clearTimeout(timer);
  }, [authStatus, user, navigate]);

  // While checking authentication or if not authenticated, show public Browse page
  return (
    <PublicLayout>
      <Browse />
    </PublicLayout>
  );
};

export default SmartRedirect;