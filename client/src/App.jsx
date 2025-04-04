import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import AuthService from "./Auth/auth";
import { useDispatch } from "react-redux";
import { setUser, logout } from "./redux/userSlice";
import Body from "./componets/Body";

function App() {
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await AuthService.getCurrentUser();
        console.log(authStatus);
        setIsAuthenticated(authStatus.authStatus);
        if (authStatus.authStatus) {
          dispatch(setUser(authStatus.data?.data?.user));
          // console.log(authStatus.data.user);
          console.log("User is authenticated");
        } else {
          dispatch(logout());
          console.log("User is not authenticated");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <div>
      <Body />
      <Toaster />
    </div>
  );
}

export default App;
