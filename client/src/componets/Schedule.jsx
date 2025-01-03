import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const Schedule = () => {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const user = useSelector((store) => store.app.user);

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3100/api/v1/schedules"
        );
        setSchedules(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    fetchSchedules();
  }, []);

  // Handle file input
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // Submit schedule
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("notes", notes);
      files.forEach((file) => formData.append("files", file));

      const { data } = await axios.post(
        "http://localhost:3100/api/v1/schedules",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSchedules([data, ...schedules]);
      setNotes("");
      setFiles([]);
      toast.success("Schedule created successfully.");
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("An error occurred while creating the schedule.");
    } finally {
      setLoading(false);
    }
  };

  // Delete schedule
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3100/api/v1/schedules/${deleteId}`);
      setSchedules(schedules.filter((schedule) => schedule._id !== deleteId));
      setShowConfirm(false); // Close confirmation modal
      toast.success("Schedule deleted successfully.");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("An error occurred while deleting the schedule.");
    }
  };

  const handleShowConfirm = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <div className="p-4">
      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete this schedule? This action cannot
              be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Add Schedule form only to admins */}
      {user?.role === "admin" && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 bg-white p-4 rounded shadow"
        >
          <h2 className="text-lg font-bold mb-2">Add Schedule</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your notes..."
            className="w-full border p-2 mb-2 rounded"
            required
          />
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mb-2"
            accept=".pdf,.xlsx,.xls,.jpg,.png,.jpeg"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Add Schedule"}
          </button>
        </form>
      )}

      <h2 className="text-lg font-bold mb-4 text-gray-700">Schedules</h2>
      <ul className="space-y-4">
        {schedules.map((schedule, index) => (
          <li
            key={schedule._id}
            className="p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-lg font-bold text-gray-800">
              Schedule #{index + 1}
            </h3>

            <ul className="space-y-2 mt-2">
              {schedule.files.map((file) => (
                <li key={file.url} className="relative group">
                  <div className="text-sm text-gray-800 mb-2">
                    Posted on: {formatDate(schedule?.createdAt)}
                  </div>

                  {file.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <div className="relative group">
                      <img
                        src={`http://localhost:3100${file.url}`}
                        alt={file.name}
                        width="50%"
                        className="h-auto m-auto object-contain rounded-md shadow-sm border border-gray-300"
                      />
                    </div>
                  ) : file.url.endsWith(".pdf") ? (
                    <div className="relative group">
                      <iframe
                        src={`http://localhost:3100${file.url}`}
                        width="100%"
                        height="600px"
                        title={file.name}
                        className="rounded-md border border-gray-300 shadow-sm"
                      />
                    </div>
                  ) : (
                    <a
                      href={`http://localhost:3100${file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {file.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* Notes */}
            <p className="mt-4 text-justify bg-gray-50 border-l-4 border-blue-500 px-4 py-3 rounded-md shadow-inner font-medium text-gray-700">
              {schedule.notes}
            </p>

            {/* Delete Button for Admin */}
            {user?.role === "admin" && (
              <button
                onClick={() => handleShowConfirm(schedule._id)}
                className="mt-4 bg-red-600 text-white py-2 px-6 rounded-lg shadow hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Schedule;
