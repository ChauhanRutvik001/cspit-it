import React, { useState, useEffect, memo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const Schedule = () => {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const user = useSelector((store) => store.app.user);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data } = await axiosInstance.get("/schedules");
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
    <li className="p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-bold text-gray-800">Schedule #{index + 1}</h3>
      <p className="text-sm text-gray-600">
        Posted on: {formatDate(schedule?.createdAt)}
      </p>
      <p className="mt-2 text-gray-700">
        <span className="font-bold">Notice:</span> {schedule.notes}
      </p>

      {schedule.files.map((file) => (
        <div key={file.url} className="mt-4">
          {file.url.match(/\.(jpg|jpeg|png)$/i) ? (
            <img
              src={`http://localhost:3100${file.url}`}
              alt={file.name}
              className="w-1/2 mx-auto rounded-md shadow border border-gray-300"
            />
          ) : (
            <iframe
              src={`http://localhost:3100${file.url}`}
              title={file.name}
              className="w-11/12 h-96 mx-auto border rounded-md shadow"
            />
          )}
        </div>
      ))}

      {user?.role === "admin" && (
        <button
          onClick={() => handleShowConfirm(schedule._id)}
          className="mt-4 bg-red-600 text-white py-2 px-6 rounded-lg shadow hover:bg-red-700 transition-all"
        >
          Delete
        </button>
      )}
    </li>
  ));

  return (
    <div className="p-4">
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
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
                className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {user?.role === "admin" && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded shadow"
        >
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
            accept="image/jpeg,image/png"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Add Schedule"}
          </button>
        </form>
      )}

      <h2 className="text-lg font-bold mb-4">Schedules</h2>
      {schedules.length === 0 ? (
        <div className="text-center text-gray-500">No schedules available.</div>
      ) : (
        <ul className="space-y-4">
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
  );
};

export default Schedule;
