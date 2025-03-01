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
    return date.toLocaleString();
  };

  const ScheduleItem = memo(({ schedule, index }) => (
    <li className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule #{index + 1}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Posted on: {formatDate(schedule?.createdAt)}
            </p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => handleShowConfirm(schedule._id)}
              className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Notice</h4>
              <p className="text-gray-700 leading-relaxed">{schedule.notes}</p>
            </div>
          </div>
        </div>

        {schedule.files.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-600" />
              <span>Attachments</span>
              <span className="text-xs text-gray-500 ml-2 italic">
                (Click an image to view full screen)
              </span>
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {schedule.files.map((file) => (
                <div
                  key={file.url}
                  className="relative group cursor-pointer"
                  onClick={() =>
                    setSelectedImage(`http://localhost:3100${file.url}`)
                  }
                >
                  <img
                    src={`http://localhost:3100${file.url}`}
                    alt={file.name}
                    className="w-full h-auto object-fit border rounded-lg"
                  />

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                </div>
              ))}
              {selectedImage && (
                <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-50">
                  <div className="relative max-w-4xl w-full p-4">
                    <button
                      className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full max-h-[90vh] object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  ));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to delete this schedule? This action
                cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="animate-spin">⏳</span>
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

        {user?.role === "admin" && (
          <div className="mb-8 bg-white rounded-xl shadow-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Add New Schedule
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your schedule notes here..."
                  className="w-full min-h-[120px] rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Add Schedule</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Schedules
          </h2>

          {schedules.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No schedules available.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {schedules.map((schedule, index) => (
                <ScheduleItem
                  key={schedule._id}
                  schedule={schedule}
                  index={index}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
