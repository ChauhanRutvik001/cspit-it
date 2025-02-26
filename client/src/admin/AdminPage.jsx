import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { ClipLoader } from "react-spinners";
import { Users, FileSpreadsheet, Layout, Trash2 } from "lucide-react";

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
      console.log(response.data);

      if (response.data.success) {
        setStudents(response.data.students);
        setTotalStudents(response.data.totalStudents);
        setTotalPages(response.data.totalPages);

        if (response.data.students == 0) {
          setError("No Students Found");
        }
      } else {
        setError(response.data.message || "Failed to fetch students.");
      }
    } catch (err) {
      setError(response.data.message || "Failed to fetch students.");
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
      <div className="flex justify-center sm:justify-center pt-24">
        <h1 className="text-3xl font-bold mb-4 font-serif">Student Register</h1>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 p-4">
        <button
          onClick={() => navigate("/registation")}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span>Add Student Using File</span>
        </button>
        <button
          onClick={() => navigate("/studentsDomain")}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
        >
          <Layout className="h-5 w-5" />
          <span>Domain</span>
        </button>
        <button
          onClick={() => navigate("/students")}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
        >
          <Users className="h-5 w-5" />
          <span>Student</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-2">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            Total Students
          </h2>
          <span className="ml-2 text-3xl font-bold text-blue-600">
            {totalStudents}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {error && (
                <td colSpan="5" className="text-red-600 py-4 text-center">
                  {error}
                </td>
              )}

              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    <ClipLoader size={40} color="#1D4ED8" />
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(currentPage - 1) * studentsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDeleteModal(student._id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
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
