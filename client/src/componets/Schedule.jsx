import React, { useState, useEffect, memo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import {
  Calendar,
  Paperclip,
  Trash2,
  Upload,
  AlertCircle,
  X,
  Clock,
  User,
  FileImage,
  Plus,
  Eye,
  Download,
  CalendarDays,
  ChevronRight,
  Bell,
  Image as ImageIcon,
} from "lucide-react";
const Schedule = () => {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const user = useSelector((store) => store.app.user);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data } = await axiosInstance.get("/schedules");
        console.log("data" , data);
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast.error(
          error?.response?.data?.message || "Failed to fetch schedules."
        );
      }
    };

    fetchSchedules();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    const allowedTypes = ["image/jpeg", "image/png"];
    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only JPG and PNG images are allowed.");
    }

    setFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("notes", notes);
      files.forEach((file) => formData.append("files", file));

      const { data } = await axiosInstance.post("/schedules", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSchedules([data, ...schedules]);
      setNotes("");
      setFiles([]);
      toast.success("Schedule created successfully.");
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create schedule."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await axiosInstance.delete(`/schedules/${deleteId}`);
      if (res.data.success) {
        setSchedules(schedules.filter((schedule) => schedule._id !== deleteId));
        setShowConfirm(false);
        toast.success("Schedule deleted successfully.");
      } else {
        toast.error("Failed to delete the schedule.");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("An error occurred while deleting.");
    } finally {
      setDeleting(false);
    }
  };

  const handleShowConfirm = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const ScheduleItem = memo(({ schedule, index }) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200 transform hover:-translate-y-1">
      {/* Priority Indicator */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      
      <div className="p-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Schedule Notice #{index + 1}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeAgo(schedule?.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(schedule?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Active
              </span>
              {schedule.files.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <FileImage className="w-3 h-3 mr-1" />
                  {schedule.files.length} Attachment{schedule.files.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <button
                onClick={() => handleShowConfirm(schedule._id)}
                className="group/btn flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4 group-hover/btn:animate-pulse" />
                <span className="font-medium">Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Notice Content */}
        <div className="relative">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  Important Notice
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </h4>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                    {schedule.notes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        {schedule.files.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                </div>
                <span>Attachments</span>
                <span className="text-sm font-normal text-gray-500">
                  ({schedule.files.length} file{schedule.files.length > 1 ? 's' : ''})
                </span>
              </h4>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Click to preview
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedule.files.map((file, fileIndex) => (
                <div
                  key={`${schedule._id}-${fileIndex}`}
                  className="group/image relative cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    setSelectedImage(`http://localhost:3100${file.url}`);
                    setSelectedImageAlt(file.name || `Attachment ${fileIndex + 1} from Schedule ${index + 1}`);
                  }}
                >
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-100 group-hover/image:border-indigo-300 transition-all duration-300">
                    <img
                      src={`http://localhost:3100${file.url}`}
                      alt={file.name || `Attachment ${fileIndex + 1}`}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover/image:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="transform scale-0 group-hover/image:scale-100 transition-transform duration-300">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Eye className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    
                    {/* File Info Badge */}
                    <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                      Preview
                    </div>
                  </div>
                  
                  {/* File Name */}
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name || `Attachment ${fileIndex + 1}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Schedule
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to delete this schedule? This action cannot be undone and all associated files will be permanently removed.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium transform hover:scale-105"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6">
            <CalendarDays className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent mb-4">
            Schedule Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stay organized with important announcements, deadlines, and updates for your academic journey
          </p>
        </div>

        {/* Admin Form Section */}
        {user?.role === "admin" && (
          <div className="mb-12">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Create New Schedule</h2>
                    <p className="text-indigo-100">Add important announcements and attach relevant files</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Schedule Notice
                    </label>
                    <div className="relative">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write your important announcement here... Include deadlines, instructions, or any important information for students."
                        className="w-full min-h-[150px] rounded-2xl border-2 border-gray-200 px-6 py-4 text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none placeholder-gray-400"
                        required
                      />
                      <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                        {notes.length} characters
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Attachments
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-indigo-400 transition-colors duration-200">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Upload Images
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Drop your files here or click to browse
                        </p>
                        <p className="text-sm text-gray-400">
                          Supports: JPG, PNG (Max 10MB each)
                        </p>
                      </div>
                    </div>
                    
                    {/* File Preview */}
                    {files.length > 0 && (
                      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {files.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="bg-gray-100 rounded-xl p-4 text-center">
                              <FileImage className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-600 truncate">
                                {file.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 font-semibold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span>Publish Schedule</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Schedules Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Recent Schedules
              </h2>
              <p className="text-gray-600">
                {schedules.length} announcement{schedules.length !== 1 ? 's' : ''} published
              </p>
            </div>
            {schedules.length > 0 && (
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border">
                Last updated: {getTimeAgo(schedules[0]?.createdAt)}
              </div>
            )}
          </div>

          {schedules.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-gray-100">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No schedules yet</h3>
              <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
                {user?.role === "admin" 
                  ? "Create your first schedule announcement to keep students informed."
                  : "Check back later for important announcements and updates from your instructors."
                }
              </p>
              {user?.role === "admin" && (
                <button
                  onClick={() => document.querySelector('textarea').focus()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create First Schedule
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {schedules.map((schedule, index) => (
                <ScheduleItem
                  key={schedule._id}
                  schedule={schedule}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Global Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative max-w-6xl w-full">
              <div className="absolute top-4 right-4 z-10">
                <button
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200 transform hover:scale-110"
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedImageAlt("");
                  }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {selectedImageAlt}
                  </h3>
                </div>
                <img
                  src={selectedImage}
                  alt={selectedImageAlt}
                  className="w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
