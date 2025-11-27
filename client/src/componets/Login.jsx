import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/userSlice";
import axiosInstance from "../utils/axiosInstance";
import PasswordChange from "./PassWordChange";
import EnterDataForm from "./EnterDataForm";
import { signInWithGoogle } from "../firebase/firebase";
import { FaGoogle, FaArrowLeft } from "react-icons/fa";

const Login = () => {
  const [id, setId] = useState("");
  const [idValue, setIdValue] = useState();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for show/hide password
  const [assignLoading, setAssignLoading] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [isFirstTimeData, setIsFirstTimeData] = useState(false);
  const [popUp, setPopUp] = useState("");
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const authStatus = useSelector((store) => store.app.authStatus);
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const validateLogin = () => {
    if (!id || !password) {
      toast.error("ID and password are required.");
      return false;
    }
    return true;
  };

  // Set component as mounted after initial render
  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  // Only redirect if user is already authenticated, component is mounted, and we're on login page
  // Add a delay to avoid race conditions with logout
  useEffect(() => {
    console.log('Login useEffect - isComponentMounted:', isComponentMounted, 'authStatus:', authStatus, 'user:', !!user, 'pathname:', location.pathname);
    
    // Only redirect if we're truly authenticated and not in a logout transition
    if (isComponentMounted && authStatus === true && user && user.id && location.pathname === "/login") {
      console.log("User already authenticated, checking if should redirect...");
      
      // Longer delay to avoid race condition with logout
      const timer = setTimeout(() => {
        // Triple-check auth status before redirecting
        if (authStatus === true && user && user.id) {
          console.log("Confirmed authenticated, redirecting...");
          // Role-based redirect for already authenticated users
          if (user.role === "admin") {
            navigate("/admin", { replace: true });
          } else if (user.role === "counsellor") {
            navigate("/counsellor", { replace: true });
          } else if (user.role === "student") {
            navigate("/company", { replace: true });
          } else {
            navigate("/browse", { replace: true });
          }
        } else {
          console.log('Auth status changed during delay, not redirecting');
        }
      }, 1000); // Increased delay to 1 second
      
      return () => clearTimeout(timer);
    } else {
      console.log('Login useEffect - Not redirecting, staying on login page. Reasons:', {
        isComponentMounted,
        authStatus,
        hasUser: !!user,
        hasUserId: !!(user && user.id),
        pathname: location.pathname
      });
    }
  }, [isComponentMounted, authStatus, user, navigate, location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    dispatch(setLoading(true));
    const user = { id, password };
    setAssignLoading(true);

    try {
      const url = `auth/login`;
      const res = await axiosInstance.post(url, user);
      console.log("Login response:", res.data);

      if (res.data.success) {
        const {
          firstTimeLogin,
          firstTimeData,
          user: loggedInUser,
          message,
        } = res.data;

        console.log("First time login:", firstTimeLogin);
        console.log("User ID:", id);

        setIdValue(id);

        if (firstTimeLogin) {
          setIsFirstTimeLogin(true);
          toast.success(
            "Welcome to your first login! Please change your password."
          );
          return;
        }

        if (firstTimeData) {
          setIsFirstTimeData(true);
          toast.success("Please complete your profile information.");
          return;
        }

        toast.success(message || "Login successful!");

        // Store user data in Redux (without password)
        console.log("Logged in user:", loggedInUser);
        console.log("User role:", loggedInUser.role);
        dispatch(setUser(loggedInUser));
        
        // Role-based redirect with replace to prevent back button issues
        console.log("Redirecting based on role:", loggedInUser.role);
        if (loggedInUser.role === "admin") {
          console.log("Redirecting to /admin");
          navigate("/admin", { replace: true });
        } else if (loggedInUser.role === "counsellor") {
          console.log("Redirecting to /counsellor");
          navigate("/counsellor", { replace: true });
        } else if (loggedInUser.role === "student") {
          console.log("Redirecting to /company");
          navigate("/company", { replace: true });
        } else {
          console.log("Redirecting to /browse (default)");
          navigate("/browse", { replace: true }); // Default fallback to authenticated home
        }
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "An error occurred during login."
      );
    } finally {
      dispatch(setLoading(false));
      setAssignLoading(false);

      if (!isFirstTimeLogin) {
        resetForm();
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAssignLoading(true);
      setPopUp(""); // Clear any previous error messages
      
      const googleAuthResult = await signInWithGoogle();
      
      // If we get here, the popup wasn't closed by the user
      const idToken = await googleAuthResult.user.getIdToken();
      
      // Send the Firebase ID token to your backend for verification
      const response = await axiosInstance.post("auth/google-login", { idToken });

      if (response.data.success) {
        const { user: loggedInUser, message, firstTimeData } = response.data;
        
        if (firstTimeData) {
          setIsFirstTimeData(true);
          toast.success("Please complete your profile information.");
          return;
        }
        
        toast.success(message || "Login successful!");
        dispatch(setUser(loggedInUser));
        
        // Role-based redirect with replace to prevent back button issues
        console.log("Google login - Redirecting based on role:", loggedInUser.role);
        if (loggedInUser.role === "admin") {
          console.log("Redirecting to /admin");
          navigate("/admin", { replace: true });
        } else if (loggedInUser.role === "counsellor") {
          console.log("Redirecting to /counsellor");
          navigate("/counsellor", { replace: true });
        } else if (loggedInUser.role === "student") {
          console.log("Redirecting to /company");
          navigate("/company", { replace: true });
        } else {
          console.log("Redirecting to /browse (default)");
          navigate("/browse", { replace: true }); // Default fallback to authenticated home
        }
      } else {
        toast.error(response.data.message || "Login failed. This Google account is not registered.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      
      // Handle specific Firebase auth errors
      if (error.message?.includes("cancelled")) {
        // User closed the popup - just show a mild toast notification
        toast.error("Sign-in was cancelled");
      } else if (error.message?.includes("blocked")) {
        // Popup was blocked
        toast.error("Pop-up was blocked by the browser. Please enable pop-ups for this site.");
        setPopUp("Pop-up was blocked. Please enable pop-ups for this site and try again.");
      } else if (error.response?.status === 401) {
        // Authentication issue - user not registered with Google
        toast.error("This Google account is not registered in our system. Please contact admin.");
      } else if (error.response?.status === 500) {
        // Server error
        toast.error("Server error during Google login. Please try again later.");
        setPopUp("Our servers are experiencing issues. Please try again in a few minutes.");
      } else {
        // Generic error
        toast.error("Failed to login with Google. Please try again.");
      }
    } finally {
      setAssignLoading(false);
    }
  };

  const resetForm = () => {
    setId("");
    setPassword("");
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Left Section */}
      <div className="hidden lg:block w-3/3 h-screen">
        <img
          src="/leftside.png"
          alt="Logo"
          className="h-full w-full object-fit"
        />
      </div>

      {/* Right Section */}
      <div
        className="w-full lg:w-2/3 h-screen bg-cover bg-center relative"
        style={{ backgroundImage: `url('/rightside.jpg')` }}
      >
        <div className="inset-0 absolute flex items-center justify-center bg-gray-900 bg-opacity-50 px-4 sm:px-6">
          <div className="w-full max-w-2xl sm:max-w-lg bg-opacity-90">
            {isFirstTimeLogin ? (
              <PasswordChange id={idValue} />
            ) : (
              <form
                onSubmit={handleLogin}
                className="w-full bg-white p-6 sm:p-8 rounded-lg shadow-md"
              >
                <div className="mb-6 text-center">
                  <img
                    src="/logo2.jpg"
                    alt="CHARUSAT"
                    className="mx-auto h-12 sm:h-16"
                  />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Gateway to Your Career Opportunities
                  </h2>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="id"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="mb-4 relative">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "👁️" : "🙅‍♂️"}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <p
                    onClick={() =>
                      setPopUp("We can't change your password at the moment.")
                    }
                    className="text-indigo-600 text-sm cursor-pointer hover:underline"
                  >
                    Forgot your password?
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Login
                </button>
                
                {/* Google Login Button */}
                <div className="mt-4 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full mt-4 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FaGoogle className="h-5 w-5 mr-2 text-red-500" />
                  Sign in with Google
                </button>
                
                {popUp && (
                  <p className="text-center mt-4 text-red-600 text-sm">
                    {popUp}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {assignLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p className="text-white text-lg font-semibold">Login...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
