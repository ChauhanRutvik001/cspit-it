import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/userSlice";
import Header from "./Header";
import axiosInstance from "../utils/axiosInstance";
import PasswordChange from "./PassWordChange";

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [popUp, setPopUp] = useState(""); // Fixed: Added popUp state
  const authStatus = useSelector((store) => store.app.authStatus);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateLogin = () => {
    if (!id || !password) {
      toast.error("ID and password are required.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (authStatus) {
      navigate("/browse");
    } else {
      navigate("/");
    }
  }, [authStatus]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    dispatch(setLoading(true));
    const user = { id, password };
    setAssignLoading(true); // Start loading

    try {
      const url = `auth/login`;
      const res = await axiosInstance.post(url, user);
      console.log("Login response:", res.data);

      if (res.data.success) {
        const { firstTimeLogin, user: loggedInUser, token, message } = res.data;

        // If it's the user's first-time login, show password change form
        if (firstTimeLogin) {
          setIsFirstTime(true);
          toast.success(
            "Welcome to your first login! Please change your password."
          );
          return;
        }

        toast.success(message || "Login successful!");
        localStorage.setItem("UserToken", token);

        dispatch(setUser(loggedInUser));
        // Navigate to the browse page
        navigate("/browse");
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "An error occurred during login."
      );
    } finally {
      dispatch(setLoading(false));
      setAssignLoading(false); // Start loading
      resetForm();
    }
  };

  const resetForm = () => {
    setId("");
    setPassword("");
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Section */}
      <div className="w-3/3 h-screen">
        <img
          src="/leftside.png"
          alt="Logo"
          className="h-full w-full object-fit"
        />
      </div>

      {/* Right Section */}
      <div
        className="w-2/3 h-screen bg-cover bg-center relative"
        style={{ backgroundImage: `url('/rightside.jpg')` }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50">
          {isFirstTime ? (
            <PasswordChange id={id} />
          ) : (
            <form
              onSubmit={handleLogin}
              className="max-w-md w-full bg-white bg-opacity-90 p-8 rounded shadow"
            >
              <div className="mb-4">
                <img src="/logo2.jpg" alt="CHARUSAT" className="mx-auto h-16" />
                <h2 className="text-center font-bold text-gray-800">
                  Gateway to Your Career Opportunities
                </h2>
              </div>
              <div className="mb-6">
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
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-between items-center mb-6">
                <p
                  onClick={() =>
                    setPopUp("We can't change your password at the moment.")
                  }
                  className="text-indigo-600 cursor-pointer hover:underline"
                >
                  Forgot your password?
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Login
              </button>
              <h2 className="text-center mt-4 text-red-600 text-sm">{popUp}</h2>
            </form>
          )}
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