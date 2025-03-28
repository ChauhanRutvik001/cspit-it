import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation
import * as XLSX from "xlsx"; // Import xlsx for Excel generation
import "jspdf-autotable"; // Import the autoTable plugin
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

// Skeleton loader component for YouTube-style loading UI
const TableSkeletonLoader = () => {
  return (
    <>
      {Array(7).fill(0).map((_, index) => (
        <tr key={index}>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          </td>
         
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-full max-w-[200px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-3/4 mt-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          </td>
        </tr>
      ))}
    </>
  );
};

const AllStudentSelections = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("studentId.id");
  const [order, setOrder] = useState("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "counsellor") {
      navigate("/browse");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchSelections = async () => {
      setLoading(true);
      setError(null);

      // Start time tracking for minimum 3-second loading
      const startTime = Date.now();
      
      try {
        let endpoint =
        user?.role === "admin"
            ? "/studentSelection/ALLselections"
            : "/studentSelection/getCounsellorStudentSelections";

        const response = await axiosInstance.get(endpoint, {
          params: {
            page: currentPage,
            limit,
            order,
          },
        });

        console.log("response", response.data);
        const { data, pagination } = response.data;
        
        // Calculate elapsed time
        const elapsedTime = Date.now() - startTime;
        
        // If less than 3 seconds have passed, wait until 3 seconds total
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        
        // Use setTimeout to ensure minimum loading time of 3 seconds
        setTimeout(() => {
          setTotalDocuments(pagination.totalDocuments);
          setSelections(data || []);
          setTotalPages(pagination.totalPages || 1);
          setLoading(false);
        }, remainingTime);
        
      } catch (err) {
        // Also respect the minimum 3-second delay for error states
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        
        setTimeout(() => {
          setError(err.response?.data?.message || "An error occurred");
          setLoading(false);
        }, remainingTime);
      }
    };

    fetchSelections();
  }, [currentPage, limit, sortBy, order, user?.role]);

  const handleSort = (field) => {
    setSortBy(field);
    setOrder(order === "asc" ? "desc" : "asc");
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-yellow-300">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const displayContent = (content) => {
    return content && content !== "N/A" ? content : "-";
  };

  const filteredSelections = selections.filter((student) => {
    const studentId = student.studentId?.id || "";
    const studentName = student.studentId?.name || "";
    const domain =
      student.selections.map((selection) => selection.domain).join(", ") || "";
    const subdomains =
      student.selections
        .flatMap((selection) =>
          selection.subdomains.map((subdomain) => subdomain.subdomain)
        )
        .join(", ") || "";
    const topics =
      student.selections
        .flatMap((selection) =>
          selection.subdomains.flatMap((subdomain) => subdomain.topics)
        )
        .join(", ") || "";

    return (
      studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subdomains.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topics.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Remove items that don't match the search term
  const sortedSelections = filteredSelections;

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);

    // Add title and search term
    doc.text("Student Domain Selections", 10, 10);
    doc.text(`Search Term: ${searchTerm || "None"}`, 10, 20);
    doc.text(`Number of Students: ${filteredSelections.length}`, 10, 30);

    // Prepare table data
    const tableData = filteredSelections.map((student) => [
      student.studentId?.id || "",
      student.studentId?.name || "",
      student.selections.map((selection) => selection.domain).join(", ") || "",
      student.selections
        .flatMap((selection) =>
          selection.subdomains.map((subdomain) => subdomain.subdomain)
        )
        .join(", ") || "",
      student.selections
        .flatMap((selection) =>
          selection.subdomains.flatMap((subdomain) => subdomain.topics)
        )
        .join(", ") || "",
    ]);

    // Generate table in PDF
    doc.autoTable({
      startY: 40,
      head: [["Student ID", "Student Name", "Domain", "Subdomains", "Topics"]],
      body: tableData,
    });

    // Define filename and save
    const filename = searchTerm
      ? `student_selections_${searchTerm}.pdf`
      : "student_selections.pdf";
    doc.save(filename);
  };

  // Export to Excel
  const exportToExcel = () => {
    // Add a summary row at the top with the number of students
    const summaryRow = [
      {
        "Student ID": "Total Students",
        "Student Name": filteredSelections.length,
      },
    ];

    // Define table headers
    const headers = [
      "Student ID",
      "Student Name",
      "Domain",
      "Subdomains",
      "Topics",
    ];

    // Prepare table data
    const tableData = filteredSelections.map((student) => ({
      "Student ID": student.studentId?.id || "",
      "Student Name": student.studentId?.name || "",
      Domain:
        student.selections.map((selection) => selection.domain).join(", ") ||
        "",
      Subdomains:
        student.selections
          .flatMap((selection) =>
            selection.subdomains.map((subdomain) => subdomain.subdomain)
          )
          .join(", ") || "",
      Topics:
        student.selections
          .flatMap((selection) =>
            selection.subdomains.flatMap((subdomain) => subdomain.topics)
          )
          .join(", ") || "",
    }));

    // Combine summaryRow, headers, and tableData into a single array
    const data = [summaryRow[0], ...tableData];

    // Create Excel sheet
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selections");

    // Define filename and save
    const filename = searchTerm
      ? `student_selections_${searchTerm}.xlsx`
      : "student_selections.xlsx";
    XLSX.writeFile(wb, filename);
  };

  const defaultImage = "default-img.png";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-full pt-20 p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Layers className="h-8 w-8 text-white" />
                <h2 className="text-3xl font-bold text-white font-['Poppins']">
                  Student Domain Selections
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total Selections:</span>{" "}
                  <span className="font-bold">{totalDocuments}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Search and Export Controls */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by ID, Name, Domain, Subdomain, or Topic..."
                  className="pl-10 p-3 w-full border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  onChange={handleSearch}
                  value={searchTerm}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                >
                  <FileDown className="h-5 w-5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                >
                  <Download className="h-5 w-5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
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
                value={limit}
                onChange={handleLimitChange}
                className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {[10, 50, 100, 500, 1000].map((value) => (
                  <option key={value} value={value}>
                    {value} entries
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="container max-w-full">
            <div className="overflow-x-auto xl:overflow-x-visible max-w-full">
              <div className="w-full min-w-[1200px] xl:min-w-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Photo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("studentId.id")}
                      >
                        <div className="flex items-center">
                          Student ID
                          {sortBy === "studentId.id" && (
                            <span className="ml-1">
                              {order === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
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
                        Domain
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Subdomains
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Topics
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {error && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                            {error}
                          </div>
                        </td>
                      </tr>
                    )}
                    {loading ? (
                      <TableSkeletonLoader />
                    ) : (
                      filteredSelections.map((student, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex-shrink-0 h-16 w-16">
                              <img
                                src={
                                  student?.studentId?.profile?.avatar
                                    ? `http://localhost:3100/api/v1/user/profile/getProfilePicByAdmin/${student?.studentId?.profile?.avatar}`
                                    : defaultImage
                                }
                                alt="Profile"
                                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:border-blue-500 transition-all duration-200"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                              {highlightText(student.studentId?.id)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {highlightText(student.studentId?.name)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {highlightText(
                                student.selections
                                  .map((selection) => selection.domain)
                                  .join(", ")
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {highlightText(
                                student.selections
                                  .flatMap((selection) =>
                                    selection.subdomains.map(
                                      (subdomain) => subdomain.subdomain
                                    )
                                  )
                                  .join(", ")
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {highlightText(
                                student.selections
                                  .flatMap((selection) =>
                                    selection.subdomains.flatMap(
                                      (subdomain) => subdomain.topics
                                    )
                                  )
                                  .join(", ")
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                    {!loading && filteredSelections.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No matching records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(1 + (currentPage - 1) * limit, totalDocuments)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * limit, totalDocuments)}
                </span>{" "}
                of <span className="font-medium">{totalDocuments}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
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
    </div>
  );
};

export default AllStudentSelections;
