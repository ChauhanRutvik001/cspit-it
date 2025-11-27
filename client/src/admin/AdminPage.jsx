import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { 
  Users, 
  Trash2, 
  Briefcase, 
  Upload, 
  UserPlus, 
  GraduationCap, 
  Layers,
  Medal,
  Target
} from "lucide-react";

// Skeleton loader for table rows with YouTube-style shimmer effect
const TableRowSkeleton = ({ rows = 5 }) => {
  return Array(rows).fill(0).map((_, index) => (
    <tr key={`skeleton-row-${index}`} className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-6 bg-gray-200 rounded skeleton-shimmer"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-28 bg-gray-200 rounded skeleton-shimmer"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-40 bg-gray-200 rounded skeleton-shimmer"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-32 bg-gray-200 rounded skeleton-shimmer"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-16 bg-gray-200 rounded skeleton-shimmer"></div>
      </td>
    </tr>
  ));
};

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
  const [isStudent, setIsStudent] = useState(true); // New state to track student or counsellor

  const fetchData = useCallback(async (page) => {
    try {
      setLoading(true);
      const endpoint = isStudent
        ? "/admin/get-students-by-admin"
        : "/admin/get-counsellor-by-admin";
      
      const response = await axiosInstance.post(endpoint, {
        page,
        limit: studentsPerPage,
      });
      console.log(response.data);

      if (response.data.success) {
        setStudents(response.data.students);
        setTotalStudents(response.data.totalStudents);
        setTotalPages(response.data.totalPages);

        if (response.data.students.length === 0) {
          setError("No Records Found");
        } else {
          setError(""); // Clear error if data is found
        }
      } else {
        setError(response.data.message || "Failed to fetch records.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while fetching records."
      );
    } finally {
      setLoading(false);
    }
  }, [isStudent, studentsPerPage]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchData(currentPage);
    } else if (user && user.role !== "admin") {
      navigate("/browse");
    }
  }, [user, currentPage, fetchData, navigate]);

  // Separate useEffect for isStudent changes to reset to page 1
  useEffect(() => {
    if (user && user.role === "admin") {
      setCurrentPage(1);
      fetchData(1);
    }
  }, [isStudent, user, fetchData]);

  // Add shimmer animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .skeleton-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
        fetchData(currentPage);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-full mx-auto pt-20 p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Users className="h-8 w-8 text-white" />
                <h2 className="text-3xl font-bold text-white font-['Poppins']">
                  Admin Dashboard
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total {isStudent ? "Students" : "Counsellors"}:</span>{" "}
                  <span className="font-bold">{totalStudents}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate("/registation")}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <Upload className="h-5 w-5" />
                <span>Add Students</span>
              </button>
              <button
                onClick={() => navigate("/registationCounsellor")}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Counsellors</span>
              </button>
              <button
                onClick={() => navigate("/studentsDomain")}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <Layers className="h-5 w-5" />
                <span>Domain</span>
              </button>
              <button
                onClick={() => navigate("/students")}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Students</span>
              </button>
              <button
                onClick={() => navigate("/companypage")}
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <Briefcase className="h-5 w-5" />
                <span>Company</span>
              </button>
              <button
                onClick={() => navigate("/placed-students")}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <Medal className="h-5 w-5" />
                <span>Placed Students</span>
              </button>
              <button
                onClick={() => navigate("/admin/placement-drives")}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <Target className="h-5 w-5" />
                <span>Placement Drives</span>
              </button>
            </div>
          </div>

          <div className="flex p-2 mb-4">
            <button
              onClick={() => setIsStudent(true)}
              className={`px-4 py-2 mx-2 ${
                isStudent ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
              } rounded`}
            >
              Students
            </button>
            <button
              onClick={() => setIsStudent(false)}
              className={`px-4 py-2 mx-2 ${
                !isStudent ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
              } rounded`}
            >
              Counsellors
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-2">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-700">
                Total {isStudent ? "Students" : "Counsellors"}
              </h2>
              {loading ? (
                <div className="ml-2 w-16 h-8 bg-gray-200 rounded-md skeleton-shimmer"></div>
              ) : (
                <span className="ml-2 text-3xl font-bold text-blue-600">
                  {totalStudents}
                </span>
              )}
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
                  {error && !loading && (
                    <tr>
                      <td colSpan="5" className="text-red-600 py-4 text-center">
                        {error}
                      </td>
                    </tr>
                  )}

                  {loading ? (
                    <TableRowSkeleton rows={studentsPerPage} />
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
                    {loading ? (
                      <div className="h-5 w-32 bg-gray-200 rounded skeleton-shimmer"></div>
                    ) : (
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || loading}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loading}
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
                  Are you sure you want to delete this user? This action cannot be
                  undone.
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
      </div>
    </div>
  );
};

export default AdminPage;
