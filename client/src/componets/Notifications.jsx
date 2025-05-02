import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const navigate = useNavigate();
  const user = useSelector((store) => store.app.user);
  const limit = 10; // Number of notifications per page

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/notifications?limit=${limit}&page=${pageNum}`);
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.meta.unread);
        setTotalPages(response.data.meta.totalPages);
        setTotalNotifications(response.data.meta.total);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
    
    // Format as regular date for older notifications
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle clicking on a notification
  const handleNotificationClick = async (notification) => {
    // Mark as read if needed
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    switch(notification.type) {
      case "certificate":
        navigate("/profile");
        break;
      case "company":
        navigate("/company");
        break;
      case "application":
        navigate("/profile");
        break;
      default:
        // No navigation for other types
        break;
    }
  };

  return (
    <div className="container mx-auto pt-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {unreadCount} unread ({totalNotifications} total)
            </span>
            {unreadCount > 0 && (
              <button 
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded text-sm font-medium"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="flex justify-center py-10">
              <ClipLoader size={40} color="#1D4ED8" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-100 ${notification.isRead ? "" : "bg-blue-50"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`${notification.isRead ? "text-gray-700" : "text-gray-900 font-medium"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-3 w-3 rounded-full bg-blue-600 flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-center">
            <nav className="flex items-center gap-1">
              <button 
                onClick={() => fetchNotifications(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => fetchNotifications(i + 1)}
                  className={`w-8 h-8 rounded-full ${page === i + 1 ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                onClick={() => fetchNotifications(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;