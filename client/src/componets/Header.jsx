import React, { useState, useEffect } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { logout, setUser } from "../redux/userSlice";
import axiosInstance from "../utils/axiosInstance";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

const Header = () => {
  const user = useSelector((store) => store.app.user);
  console.log(user);
  const authStatus = useSelector((store) => store.app.authStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScreenSmall, setIsScreenSmall] = useState(false);
  const [isOnMakeContest, setIsOnMakeContest] = useState(false);

  useEffect(() => {
    if (authStatus === false) {
      navigate("/");
    }
  }, [authStatus]);

  useEffect(() => {
    setIsAdmin(user?.role);
  });

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth <= 1200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const logoutHandler = async () => {
    try {
      await axiosInstance.get(`auth/logout`);

      dispatch(setUser(null));
      localStorage.removeItem("authToken");
      dispatch(logout());

      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const isActive = (path) => location.pathname === path;

  // Determine button text based on user role

  return (
    <div className="z-10 w-full flex items-center justify-between px-4 md:px-6 bg-gradient-to-b bg-black bg-opacity-50 backdrop-blur-md py-2 fixed">
      <h1
        className="text-3xl md:text-5xl font-bold text-white"
        style={{
          textShadow: "2px 2px 8px rgba(0, 0, 0, 0.9)",
        }}
      >
        Codify
      </h1>

      {isScreenSmall && user && (
        <div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <AiOutlineClose size={30} className="text-white" />
            ) : (
              <AiOutlineMenu size={30} className="text-white" />
            )}
          </button>
        </div>
      )}

      {!isScreenSmall && user && (
        <div className="hidden md:flex items-center space-x-4 flex-wrap">
          <Link
            to="/browse"
            className={`text-lg font-semibold transition duration-300 ${
              isActive("/browse")
                ? "text-blue-400"
                : "text-white hover:text-blue-300"
            }`}
          >
            Home
          </Link>
          <Link
            to="/profile"
            className={`text-lg font-semibold transition duration-300 ${
              isActive("/profile")
                ? "text-blue-400"
                : "text-white hover:text-blue-300"
            }`}
          >
            Profile
          </Link>
          <Link
            to="/support"
            className={`text-lg font-semibold transition duration-300 ${
              isActive("/support")
                ? "text-blue-400"
                : "text-white hover:text-blue-300"
            }`}
          >
            Support
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/pending-requests"
              className={`text-lg font-semibold transition duration-300 ${
                isActive("/pending-requests")
                  ? "text-blue-400"
                  : "text-white hover:text-blue-300"
              }`}
            >
              Requests
            </Link>
          )}
          {user?.role === "faculty" && (
            <Link
              to="/faculty-section"
              className={`text-lg font-semibold transition duration-300 ${
                isActive("/faculty-section")
                  ? "text-blue-400"
                  : "text-white hover:text-blue-300"
              }`}
            >
              Requests
            </Link>
          )}
          <div className="flex items-center space-x-2">
            <IoIosArrowDropdown size="24px" color="white" />
            <h1 className="text-lg font-medium text-white">
              {user?.id?.toUpperCase()}
            </h1>
          </div>
          <button
            onClick={logoutHandler}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 hover:shadow-2xl transition duration-300 ease-in-out px-4 py-2"
          >
            Logout
          </button>
        </div>
      )}

      {isScreenSmall && isMenuOpen && user && (
        <div className="absolute top-12 right-4 w-48 bg-gray-800 text-white rounded-lg shadow-lg p-4">
          <Link
            to="/browse"
            className={`block mb-2 font-semibold transition duration-300 ${
              isActive("/browse")
                ? "text-blue-400"
                : "text-white hover:text-blue-300"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/profile"
            className={`block mb-2 font-semibold transition duration-300 ${
              isActive("/profile")
                ? "text-blue-400"
                : "text-white hover:text-blue-300"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/support"
            className={`block mb-2 font-semibold transition duration-300 ${
              isActive("/support")
                ? "text-blue-400"
                : "text-white hover:text-blue-300"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Support
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/pending-requests"
              className={`block mb-2 font-semibold transition duration-300 ${
                isActive("/pending-requests")
                  ? "text-blue-400"
                  : "text-white hover:text-blue-300"
              }`}
            >
              Requests
            </Link>
          )}
          {user?.role === "faculty" && (
            <Link
              to="/faculty-section"
              className={`block mb-2 font-semibold transition duration-300 ${
                isActive("/faculty-section")
                  ? "text-blue-400"
                  : "text-white hover:text-blue-300"
              }`}
            >
              Requests
            </Link>
          )}

          <button
            onClick={logoutHandler}
            className="block w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 hover:shadow-2xl transition duration-300 ease-in-out px-4 py-2 mt-4"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
