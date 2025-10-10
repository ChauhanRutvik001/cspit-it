import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { Users, Layout, Eye, CheckCircle, XCircle, Building, Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as XLSX from "xlsx";

// Skeleton loader component for table rows
const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">z
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 w-20 bg-gray-300 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 w-32 bg-gray-300 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 w-64 bg-gray-300 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>
      </td>
    </tr>
  );
};

const CounsellorPage = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [viewCertificateUrl, setViewCertificateUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "counsellor") navigate("/browse");
  }, [user, navigate]);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Add a delay of 1.5 seconds for loading effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Include search term in the API request
      const response = await axiosInstance.get(
        `/certificates/students?page=${currentPage}&limit=${studentsPerPage}&search=${debouncedSearchTerm}`
      );
      setStudents(response.data.students);
      setTotalStudents(response.data.total);
      setTotalPages(Math.ceil(response.data.total / studentsPerPage));
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch students");
      setLoading(false);
    }
  }, [currentPage, studentsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleViewCertificate = async (certificateId) => {
    try {
      const response = await axiosInstance.get(
        `/certificates/file/${certificateId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setViewCertificateUrl(url);
    } catch (error) {
      toast.error("Failed to fetch certificate");
    }
  };

  const handleCloseViewCertificate = () => {
    setViewCertificateUrl(null);
  };

  const handleApproveCertificate = async (requestId) => {
    try {
      await axiosInstance.patch(`/certificates/approve/${requestId}`);
      toast.success("Certificate approved");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to approve certificate");
    }
  };

  const handleDeclineCertificate = async (requestId) => {
    try {
      await axiosInstance.patch(`/certificates/decline/${requestId}`);
      toast.success("Certificate declined");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to decline certificate");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLimitChange = (e) => {
    setStudentsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Function to fetch all data for export
  const fetchAllStudents = async (searchQuery = "") => {
    try {
      // Get all data without pagination limits
      const response = await axiosInstance.get(
        `/certificates/students?page=1&limit=1000&search=${searchQuery}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all students for export:", error);
      toast.error("Failed to fetch data for export");
      return { students: [], total: 0 };
    }
  };

  // New function to export all data to PDF
  const exportToPDF = async () => {
    try {
      setExportLoading(true);
      
      // Fetch all data or all search results
      const allData = await fetchAllStudents(debouncedSearchTerm);
      
      const doc = new jsPDF();
      doc.setFontSize(12);

      // Header Information
      doc.text("Certificate Approval Requests", 10, 10);
      if (debouncedSearchTerm) {
        doc.text(`Search Term: ${debouncedSearchTerm}`, 10, 20);
        doc.text(`Number of Matching Students: ${allData.total}`, 10, 30);
      } else {
        doc.text(`Total Pending Requests: ${allData.total}`, 10, 20);
      }

      // Prepare Table Data
      const tableData = allData.students.map((student) => [
        student.id || "",
        student.name || "",
        student.certificates.map(cert => cert.filename).join(", ")
      ]);

      // Generate Table
      doc.autoTable({
        startY: debouncedSearchTerm ? 40 : 30,
        head: [["Student ID", "Student Name", "Certificate Name"]],
        body: tableData,
      });

      // Save PDF File
      const filename = debouncedSearchTerm
        ? `pending_certificates_${debouncedSearchTerm}.pdf`
        : "pending_certificates.pdf";
      doc.save(filename);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export data to PDF");
    } finally {
      setExportLoading(false);
    }
  };

  // New function to export all data to Excel
  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Fetch all data or all search results
      const allData = await fetchAllStudents(debouncedSearchTerm);
      
      // Define table headers
      const headers = ["Student ID", "Student Name", "Certificate Name"];

      // Define summary row if there's a search term
      const summaryRows = [];
      if (debouncedSearchTerm) {
        summaryRows.push([`Search Term: ${debouncedSearchTerm}`]);
        summaryRows.push([`Number of Matching Students: ${allData.total}`]);
        summaryRows.push([]);  // Empty row for spacing
      } else {
        summaryRows.push([`Total Pending Requests: ${allData.total}`]);
        summaryRows.push([]);  // Empty row for spacing
      }

      // Map student data to rows
      const tableData = allData.students.map((student) => [
        student.id || "",
        student.name || "",
        student.certificates.map(cert => cert.filename).join(", ")
      ]);

      // Combine summary rows, headers, and table data
      const data = [...summaryRows, headers, ...tableData];

      // Create a worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pending Certificates");

      // Save the file with a dynamic filename based on the search term
      const filename = debouncedSearchTerm
        ? `pending_certificates_${debouncedSearchTerm}.xlsx`
        : "pending_certificates.xlsx";
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export data to Excel");
    } finally {
      setExportLoading(false);
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
                <h2 className="text-3xl font-bold text-white font-['Poppins']">Counsellor Dashboard</h2>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total Requests:</span>{" "}
                  <span className="font-bold">{totalStudents}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
              <button
                onClick={() => navigate("/counsellor/applications")}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <Building className="h-5 w-5" />
                <span>Pending Applications</span>
              </button>
              <Link
                to="/counsellor/student-progress"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              >
                <Users className="h-5 w-5" />
                <span>Student Progress</span>
              </Link>
            </div>
          </div>

          {/* Search Controls */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Student ID, Name, or Certificate Name..."
                  className="pl-10 p-3 w-full border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  onChange={handleSearch}
                  value={searchTerm}
                />
              </div>
              
              {/* Export buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                  disabled={loading || students.length === 0 || exportLoading}
                >
                  {exportLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FileDown className="h-5 w-5" />
                  )}
                  <span>{exportLoading ? "Exporting..." : "PDF"}</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                  disabled={loading || students.length === 0 || exportLoading}
                >
                  {exportLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FileDown className="h-5 w-5" />
                  )}
                  <span>{exportLoading ? "Exporting..." : "Excel"}</span>
                </button>
              </div>
            </div>
            {loading && debouncedSearchTerm && (
              <div className="mt-2 text-sm text-gray-500">Searching for "{debouncedSearchTerm}"...</div>
            )}
            {exportLoading && (
              <div className="mt-2 text-sm text-blue-600">
                Preparing export... This may take a moment if you have many records.
              </div>
            )}
          </div>

          {/* Records per page selector */}
          <div className="px-6 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <label
                htmlFor="recordsPerPage"
                className="text-sm font-medium text-gray-700 mr-2"
              >
                Show:
              </label>
              <select
                id="recordsPerPage"
                value={studentsPerPage}
                onChange={handleLimitChange}
                className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[10, 20, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value} entries
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Certificate Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {error && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                        {error}
                      </div>
                    </td>
                  </tr>
                )}
                
                {loading ? (
                  // YouTube-style skeleton loader
                  <>
                    {[...Array(studentsPerPage > 5 ? 5 : studentsPerPage)].map((_, index) => (
                      <SkeletonRow key={`skeleton-${index}`} />
                    ))}
                  </>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      {debouncedSearchTerm 
                        ? `No students found matching "${debouncedSearchTerm}"`
                        : "No students found with pending certificate approvals"}
                    </td>
                  </tr>
                ) : (
                  students.map((student, studentIndex) => (
                    <tr
                      key={`student-${student._id}-${studentIndex}`}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {student.id?.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {student.certificates.map((certificate, certIndex) => (
                            <div
                              key={`cert-${student._id}-${certificate._id}-${certIndex}`}
                              className="flex items-center gap-2 text-sm text-gray-900"
                            >
                              <span className="truncate max-w-xs">{certificate.filename}</span>
                              <button
                                onClick={() => handleViewCertificate(certificate.fileId)}
                                className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                title="View Certificate"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          {student.pendingRequests.map((request, reqIndex) => (
                            <div
                              key={`req-${student._id}-${request._id}-${reqIndex}`}
                              className="flex items-center gap-2"
                            >
                              <button
                                onClick={() => handleApproveCertificate(request._id)}
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                title="Approve Certificate"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeclineCertificate(request._id)}
                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                title="Decline Certificate"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {totalStudents === 0 ? 0 : Math.min(1 + (currentPage - 1) * studentsPerPage, totalStudents)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * studentsPerPage, totalStudents)}
                </span>{" "}
                of <span className="font-medium">{totalStudents}</span> results
                {debouncedSearchTerm && (
                  <span className="ml-1">
                    for "<span className="font-medium">{debouncedSearchTerm}</span>"
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Certificate Modal */}
      {viewCertificateUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full m-4">
            <button
              onClick={handleCloseViewCertificate}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
            <div className="flex justify-center items-center">
              <img
                src={viewCertificateUrl}
                alt="Certificate"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorPage;
