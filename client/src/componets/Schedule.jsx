import React, { useState, useEffect, memo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const Schedule = () => {
  const [notes, setNotes] = useState(""); // Controlled input state
  const [files, setFiles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
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
        toast.error("Failed to fetch schedules.");
      }
    };

    fetchSchedules();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    const allowedExtensions = ["image/jpeg", "image/png", "application/pdf"];
    const invalidFiles = selectedFiles.filter(
      (file) => !allowedExtensions.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error(
        `Unsupported files detected: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    setFiles(selectedFiles.filter((file) => allowedExtensions.includes(file.type)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("notes", notes);
      files.forEach((file) => formData.append("files", file));

      const { data } = await axiosInstance.post(
        "/schedules",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSchedules([data, ...schedules]);
      setNotes(""); // Reset notes after submit
      setFiles([]); // Clear selected files after submit
      toast.success("Schedule created successfully.");
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("An error occurred while creating the schedule.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`/schedules/${deleteId}`);
      if (res.data.success) {
        setSchedules(schedules.filter((schedule) => schedule._id !== deleteId));
        setShowConfirm(false);
        toast.success("Schedule deleted successfully.");
      } else {
        toast.error("An error occurred while deleting the schedule.");
      }
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

  const ScheduleItem = memo(({ schedule, index }) => (
    <li className="p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-bold text-gray-800">Schedule #{index + 1}</h3>

      <ul className="space-y-2 mt-2">
        {schedule.files.map((file) => (
          <li key={file.url}>
            <div className="text-sm text-gray-800 mb-2">
              Posted on: {formatDate(schedule?.createdAt)}
            </div>

            <p className="mb-4 mt-4 text-justify text-gray-700">
              <span className="font-bold">Notice:</span>
              <span>{schedule.notes}</span>
            </p>

            {file.url.match(/\.(jpg|jpeg|png)$/i) ? (
              <img
                src={`http://localhost:3100${file.url}`}
                alt={file.name}
                width="50%"
                className="h-auto m-auto object-contain rounded-md shadow-sm border border-gray-300"
              />
            ) : (
              <iframe
                src={`http://localhost:3100${file.url}`}
                title={file.name}
                height={"600px"}
                width={"90%"}
                className="rounded-md m-auto border border-gray-300 shadow-sm"
              />
            )}
          </li>
        ))}
      </ul>

      {user?.role === "admin" && (
        <button
          onClick={() => handleShowConfirm(schedule._id)}
          className="mt-4 bg-red-600 text-white py-2 px-6 rounded-lg shadow hover:bg-red-700 transition-colors duration-200"
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
              >
                Delete
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
            onChange={(e) => setNotes(e.target.value)} // Controlled input
            placeholder="Write your notes..."
            className="w-full border p-2 mb-2 rounded"
            required
          />
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mb-2"
            accept="image/jpeg,image/png,application/pdf"
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

      <h2 className="text-lg font-bold mb-4">Schedules</h2>
      {schedules.length === 0 ? (
        <div className="text-center text-gray-500">No schedules available.</div>
      ) : (
        <ul className="space-y-4">
          {schedules.map((schedule, index) => (
            <ScheduleItem key={schedule._id} schedule={schedule} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Schedule;
