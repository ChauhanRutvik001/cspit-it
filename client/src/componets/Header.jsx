import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, setUser } from "../redux/userSlice";
import toast from "react-hot-toast";
import { Disclosure, Menu } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import axiosInstance from "../utils/axiosInstance";

const navigation = [
  { name: "Home", to: "/browse" },
  { name: "Developer", to: "/developer" },
  { name: "Alumni", to: "/Alumni" },
  { name: "Schedule", to: "/schedule" },
  { name: "Contact Us", to: "/Contact" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Header = () => {
  const authStatus = useSelector((store) => store.app.authStatus);
  const user = useSelector((store) => store.app.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!authStatus) {
      navigate("/");
    }
  }, [authStatus, navigate]);

  const logoutHandler = async () => {
    try {
      await axiosInstance.get("/auth/logout");
      dispatch(setUser(null));
      // localStorage.removeItem("authToken");
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const fetchProfilePic = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/user/profile/upload-avatar", {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setUrl(imageUrl);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfilePic();
  }, [fetchProfilePic]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-blue-50 text-gray-800 fixed w-full z-20 shadow-md">
      <Disclosure as="nav" className="sticky top-0">
        {({ open }) => (
          <>
            <div className="mx-auto px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="flex-1 flex items-center justify-between">
                  <div
                    className="flex items-center hover:cursor-pointer"
                    onClick={() => navigate("/browse")}
                  >
                    <img
                      className="h-14 w-auto"
                      src="/collageLogo.jpg"
                      alt="Your Company"
                    />
                  </div>
                  <div className="hidden sm:ml-6 md:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          className={classNames(
                            isActive(item.to)
                              ? "bg-blue-200 text-blue-700"
                              : "text-gray-600 hover:bg-blue-100 hover:text-blue-600",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={isActive(item.to) ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className={classNames(
                            isActive("/admin")
                              ? "bg-blue-200 text-blue-700"
                              : "text-gray-600 hover:bg-blue-100 hover:text-blue-600",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={isActive("/admin") ? "page" : undefined}
                        >
                          Registration
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <div className="inset-y-0 mx-2 flex items-center md:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-blue-100 p-1 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50">
                        <span className="sr-only">Open user menu</span>
                        {loading ? (
                          <ClipLoader size={24} color="#1D4ED8" />
                        ) : (
                          <img
                            className="h-10 w-10 rounded-full border-2 border-blue-300 shadow-md"
                            src={imagePreview || url || "/default-img.png"}
                            alt={user?.name || "Default Profile"}
                          />
                        )}
                      </Menu.Button>
                    </div>
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700  hover:bg-blue-100 hover:text-blue-600"
                            )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logoutHandler}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700 text-start w-full hover:bg-blue-100 hover:text-blue-600"
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>
            </div>
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.to}
                    className={classNames(
                      isActive(item.to)
                        ? "bg-blue-200 text-blue-700"
                        : "text-gray-600 hover:bg-blue-100 hover:text-blue-600",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={isActive(item.to) ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </header>
  );
};

export default Header;
