import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, setUser, setAvatarBlobUrl, fetchAvatarBlob } from "../redux/userSlice";
import toast from "react-hot-toast";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import axiosInstance from "../utils/axiosInstance";
import { useSocket } from "../utils/SocketProvider";

// Navigation items
const navigation = [
  { name: "Home", to: "/browse" },
  { name: "Schedule", to: "/schedule" },
  { name: "Company", to: "/company" },
  { name: "Placement Dashboard", to: "/placement-dashboard" },
  { name: "Developer", to: "/developer" },
  { name: "Contact Us", to: "/contact" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Header = () => {
  const authStatus = useSelector((store) => store.app.authStatus);
  const user = useSelector((store) => store.app.user);
  const avatarId = user?.profile?.avatar;
  const avatarBlobUrl = user?.profile?.avatarUrl;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [imagePreview, setImagePreview] = useState(null);
  const loading = useSelector((state) => state.app.isLoading);
  const { socket } = useSocket();

  // If user is not authenticated, don't render anything
  if (!authStatus || !user) {
    return null;
  }

  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Get only the top 4 notifications for dropdown display
  const topNotifications = useMemo(() => {
    return notifications.slice(0, 4);
  }, [notifications]);

  // Clear stored blob URL on mount to ensure a fresh fetch
  useEffect(() => {
    dispatch(setAvatarBlobUrl(null));
  }, [dispatch]);

  // Remove the automatic redirect - let the routing handle authentication
  // useEffect(() => {
  //   if (!authStatus) {
  //     navigate("/");
  //   }
  // }, [authStatus, navigate]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setNotificationsLoading(true);
      const response = await axiosInstance.get('/notifications?limit=10&page=1');
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.meta.unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to empty notifications if API fails
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user?.id]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket && user?.id) {
      // Listen for new notifications
      socket.on('new-notification', (notification) => {
        console.log('New notification received:', notification);
        
        // Add the new notification to the state
        setNotifications(prev => [notification, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Visual and sound indicator that a new notification arrived
        setHasNewNotification(true);
        
        // Show toast notification
        const notificationIcon = getNotificationIcon(notification.type);
        toast(
          <div className="flex items-start">
            <span className="mr-2 text-xl">{notificationIcon}</span>
            <div>
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>,
          { duration: 5000 }
        );
        
        // Reset notification animation after 3 seconds
        setTimeout(() => {
          setHasNewNotification(false);
        }, 3000);
      });
      
      // Cleanup listener on component unmount
      return () => {
        socket.off('new-notification');
      };
    }
  }, [socket, user?.id]);

  // Load notifications when user is authenticated
  useEffect(() => {
    if (authStatus && user?.id) {
      fetchNotifications();
      
      // Set up polling for notifications every 30 seconds
      const notificationInterval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(notificationInterval);
    }
  }, [authStatus, user?.id, fetchNotifications]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "certificate":
        return "🎓";
      case "company":
        return "🏢";
      case "application":
        return "📝";
      case "resume":
        return "📄";
      case "student":
        return "👨‍🎓";
      default:
        return "🔔";
    }
  };

  // Format notification date to relative time (e.g. "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    // Format as regular date if more than a week ago
    return date.toLocaleDateString();
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.patch('/notifications/read-all');
      if (response.data.success) {
        setNotifications(notifications.map(notif => ({...notif, isRead: true})));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error('Failed to mark notifications as read');
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications(notifications.map(notif => 
          notif._id === id ? {...notif, isRead: true} : notif
        ));
        setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const logoutHandler = async () => {
    try {
      console.log('Logout initiated...');
      
      // Set a flag to prevent immediate re-authentication
      window._logoutInProgress = true;
      
      // Clear local state first to immediately update UI
      dispatch(logout());
      
      console.log('Redux state cleared');
      
      // Clear any local storage or session storage if used
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('Local/session storage and cookies cleared');
      
      // Call server logout
      try {
        await axiosInstance.get("/auth/logout");
        console.log('Server logout completed');
      } catch (serverError) {
        console.log('Server logout failed, but continuing with client logout');
      }
      
      toast.success("Logged out successfully");
      
      // Navigate to home page
      navigate("/", { replace: true });
      
      console.log('Navigation to home completed');
      
      // Clear the logout flag after a delay
      setTimeout(() => {
        window._logoutInProgress = false;
      }, 2000);
      
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
      // Even if logout fails, still redirect to prevent UI issues
      navigate("/", { replace: true });
      window._logoutInProgress = false;
    }
  };

  const fetchProfilePic = useCallback(() => {
    if (!avatarId) {
      dispatch(setAvatarBlobUrl(null));
      return;
    }
    // Only fetch if we don't already have a blob URL
    if (!avatarBlobUrl) {
      dispatch(fetchAvatarBlob());
    }
  }, [avatarId, avatarBlobUrl, dispatch]);

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
                      {navigation
                        .filter((item) => {
                          // Hide Contact Us and Developer for admin users
                          if (user?.role === "admin" && (item.name === "Contact Us" || item.name === "Developer")) {
                            return false;
                          }
                          return true;
                        })
                        .map((item) => (
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
                      {user?.role === "admin"  && (
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
                      {user?.role === "counsellor"  && (
                        <Link
                          to="/counsellor"
                          className={classNames(
                            isActive("/counsellor")
                              ? "bg-blue-200 text-blue-700"
                              : "text-gray-600 hover:bg-blue-100 hover:text-blue-600",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={isActive("/counsellor") ? "page" : undefined}
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

                  {/* Notification Menu */}
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button
                        className={`relative rounded-full bg-blue-100 p-1 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50 ${
                          hasNewNotification ? 'animate-pulse' : ''
                        }`}
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                          setHasNewNotification(false);
                        }}
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">Notifications</p>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto py-1">
                          {notificationsLoading ? (
                            <div className="flex justify-center py-4">
                              <ClipLoader size={24} color="#1D4ED8" />
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No notifications
                            </div>
                          ) : (
                            <>
                              {/* Only show top 4 notifications in dropdown */}
                              {topNotifications.map((notification) => (
                                <Menu.Item key={notification._id}>
                                  {({ active }) => (
                                    <div
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        notification.isRead ? "" : "bg-blue-50",
                                        "block px-4 py-2 text-sm"
                                      )}
                                    >
                                      <div className="flex justify-between">
                                        <div 
                                          className="cursor-pointer flex-1 flex"
                                          onClick={() => !notification.isRead && markAsRead(notification._id)}
                                        >
                                          <span className="mr-2 text-xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                          </span>
                                          <div className="flex-1">
                                            <p className={classNames(
                                              notification.isRead ? "text-gray-700" : "text-gray-900 font-medium",
                                            )}>
                                              {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                              {formatRelativeTime(notification.createdAt)}
                                            </p>
                                          </div>
                                        </div>
                                        {!notification.isRead && (
                                          <div className="h-2 w-2 mt-1 rounded-full bg-blue-600"></div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Menu.Item>
                              ))}
                              
                              {/* Show a count if there are more notifications */}
                              {notifications.length > 4 && (
                                <div className="px-4 py-2 text-center text-sm text-gray-500">
                                  + {notifications.length - 4} more notifications
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="px-4 py-2">
                          <Link
                            to="/notifications"
                            className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View all notifications
                          </Link>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* User Profile Menu */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50">
                        <span className="sr-only">Open user menu</span>
                        {loading ? (
                          <ClipLoader size={24} color="#1D4ED8" />
                        ) : (
                          <img
                            className="h-10 w-10 rounded-full border-2 border-blue-300 shadow-md"
                            src={imagePreview || avatarBlobUrl || "/default-img.png"}
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
                              "block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600"
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
            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation
                  .filter((item) => {
                    // Hide Contact Us and Developer for admin users in mobile menu
                    if (user?.role === "admin" && (item.name === "Contact Us" || item.name === "Developer")) {
                      return false;
                    }
                    return true;
                  })
                  .map((item) => (
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
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className={classNames(
                      isActive("/admin")
                        ? "bg-blue-200 text-blue-700"
                        : "text-gray-600 hover:bg-blue-100 hover:text-blue-600",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={isActive("/admin") ? "page" : undefined}
                  >
                    Registration
                  </Link>
                )}
                {user?.role === "counsellor" && (
                  <Link
                    to="/counsellor"
                    className={classNames(
                      isActive("/admin")
                        ? "bg-blue-200 text-blue-700"
                        : "text-gray-600 hover:bg-blue-100 hover:text-blue-600",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={isActive("/admin") ? "page" : undefined}
                  >
                    Registration
                  </Link>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </header>
  );
};

export default Header;
