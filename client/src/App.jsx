import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import AuthService from "./Auth/auth";
import { useDispatch } from "react-redux";
import { setUser, logout } from "./redux/userSlice";
import Body from "./componets/Body";
import ChatbotWidget from "./componets/ChatbotWidget";
import { SocketProvider } from "./utils/SocketProvider";

function App() {
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth if logout is in progress
      if (window._logoutInProgress) {
        console.log('App.jsx - Logout in progress, skipping auth check');
        return;
      }
      
      try {
        console.log('App.jsx - Checking authentication...');
        const authStatus = await AuthService.getCurrentUser();
        console.log('App.jsx - Auth check result:', authStatus);
        setIsAuthenticated(authStatus.authStatus);
        if (authStatus.authStatus) {
          dispatch(setUser(authStatus.data?.data?.user));
          console.log("App.jsx - User is authenticated");
        } else {
          dispatch(logout());
          console.log("App.jsx - User is not authenticated");
        }
      } catch (error) {
        console.error("App.jsx - Error checking authentication:", error);
        setIsAuthenticated(false);
        dispatch(logout());
      }
    };

    // Initial check
    checkAuth();
    
    // Set up periodic auth check every 5 minutes (but not during logout)
    const interval = setInterval(() => {
      if (!window._logoutInProgress) {
        checkAuth();
      }
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <SocketProvider>
      <div>
        <Body />
        <ChatbotWidget />
        <Toaster />
      </div>
    </SocketProvider>
  );
}

export default App;
