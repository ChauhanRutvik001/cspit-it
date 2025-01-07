import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import Header from "../componets/Header";

const AdminPage = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const studentsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userId, setuserId] = useState(null);

  const fetchStudents = async (page) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/admin/get-students-by-admin",
        {
          page,
          limit: studentsPerPage,
        }
      );

      if (response.data.success) {
        setStudents(response.data.students);
        setTotalStudents(response.data.totalStudents);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.data.message || "Failed to fetch students.");
      }
    } catch (err) {
      setError("An error occurred while fetching students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "admin") navigate("/browse");
  }, [user, navigate]);

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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

  const openDeleteModal = (studentId) => {
    setuserId(studentId);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setuserId(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(
        `/admin/remove-user/${userId}`
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchStudents(currentPage);
      } else {
        toast.error(response.data.message || "Failed to remove the user.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error in removing user.");
    } finally {
      cancelDelete();
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-black">
      <Header />

      <div className="flex justify-center pt-[6%]">
        <h1 className="text-2xl font-bold mb-4">Student Register</h1>
      </div>

      <div className="p-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white mr-2 font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          onClick={() => navigate("/registation")}
        >
          Add Student Using File
        </button>
        <button
          onClick={() => navigate("/domain")}
          className="bg-red-500 hover:bg-red-600 text-white mr-2 font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        >
          Domain
        </button>
      </div>

      <div className="flex items-center ml-4 py-2 px-4 rounded-full shadow-lg text-lg font-semibold bg-white">
        <span>Total Number of Students Register:</span>
        <span className="ml-2 text-xl font-bold">{totalStudents}</span>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
              <p className="mt-4 text-blue-500 text-lg font-medium">
                Loading, please wait...
              </p>
            </div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
            <table className="min-w-full text-lg text-left text-black rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Create Date</th>
                  <th className="py-3 px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student._id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-6">
                      {(currentPage - 1) * studentsPerPage + index + 1}
                    </td>
                    <td className="py-3 px-6">{student?.id?.toUpperCase()}</td>
                    <td className="capitalize py-3 px-6">{student?.name}</td>

                    <td className="py-3">{formatDate(student?.createdAt)}</td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => openDeleteModal(student._id)}
                        className="bg-red-600 text-white py-1 px-3 rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-black pr-2 pl-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 sm:p-8 rounded-lg w-11/12 max-w-md sm:max-w-lg mx-auto">
            <h3 className="text-black text-lg sm:text-xl font-bold mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-4 text-sm sm:text-base text-center">
              Are you sure you want to delete this student? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 text-black py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
