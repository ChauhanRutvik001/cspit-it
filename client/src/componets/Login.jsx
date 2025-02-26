import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/userSlice";
import Header from "./Header";
import axiosInstance from "../utils/axiosInstance";
import PasswordChange from "./PassWordChange";
import EnterDataForm from "./EnterDataForm";

const Login = () => {
  const [id, setId] = useState("");
  const [idValue, setIdValue] = useState();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for show/hide password
  const [assignLoading, setAssignLoading] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [isFirstTimeData, setIsFirstTimeData] = useState(false);
  const [popUp, setPopUp] = useState("");
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
          token,
          message,
        } = res.data;
        console.log("First time login:", user);
        console.log(id);

        setIdValue(id);

        if (firstTimeLogin) {
          setIsFirstTimeLogin(true);
          toast.success(
            "Welcome to your first login! Please change your password."
          );
          return; // Do not reset the form
        }

        // if (firstTimeData) {
        //   console.log(id);
        //   setIsFirstTimeData(true);
        //   toast.success("Welcome to your first login! Please enter your data.");
        //   return; // Do not reset the form
        // }

        toast.success(message || "Login successful!");
        // localStorage.setItem("UserToken", token);

        dispatch(setUser(loggedInUser));
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
      setAssignLoading(false);

      // Reset form only if no first-time actions are required
      if (!isFirstTimeLogin && !isFirstTimeData) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setId("");
    setPassword("");
  };

  return (
    <div className="flex min-h-screen overflow-hidden ">
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
              <form onSubmit={handleLogin} className="w-full bg-white p-6 sm:p-8 rounded-lg shadow-md">
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
