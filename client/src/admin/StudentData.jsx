import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Award,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Download,
} from "lucide-react";

const StudentData = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "counsellor") {
      navigate("/browse");
    }
  }, [user, navigate]);

  const filteredSelections = students.filter((student) => {
    // Access the relevant fields, ensuring they are properly handled
    const semester = student.profile?.semester || ""; // default to empty string if semester is missing

    const searchFields = [
      student.id,
      student.name,
      student.certificatesLength,
      student.profile?.batch,
      semester, // Ensure semester is properly included
      student.profile?.counsellor,
      student.profile?.mobileNo,
      student.profile?.github,
      student.profile?.gender,
      student.profile?.birthDate,
    ]
      .filter(Boolean) // Filter out any falsy values (e.g., null, undefined, '')
      .join(" ")
      .toLowerCase(); // Convert the entire search string to lowercase for case-insensitive search

    return searchFields.includes(searchTerm); // Check if searchTerm is included in any of the fields
  });

  const highlightText = (text) => {
    if (typeof text !== "string") {
      return text; // Return the value as is if it's not a string
    }
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);

    // Header Information
    doc.text("Filtered Student Data", 10, 10);
    doc.text(`Search Term: ${searchTerm || "None"}`, 10, 20);
    doc.text(`Number of Students: ${filteredSelections.length}`, 10, 30); // Add number of students

    // Prepare Table Data
    const tableData = filteredSelections.map((student) => [
      student.id || "",
      student.name || "",
      student.profile?.batch || "-",
      student.profile?.semester || "-",
      student.profile?.counsellor || "-",
      student.profile?.mobileNo || "-",
      student.profile?.birthDate
        ? new Date(student.profile.birthDate).toLocaleDateString()
        : "-", // Format the birthdate
      student.profile?.github || "-",
      student?.certificatesLength || "0",
    ]);

    // Generate Table
    doc.autoTable({
      startY: 40, // Adjusted to leave space for the header
      head: [
        [
          "ID",
          "Name",
          "Batch",
          "Semester",
          "Counsellor",
          "Mobile No",
          "Birth Date",
          "GitHub",
          "Total Certificates",
        ],
      ],
      body: tableData,
    });

    // Save PDF File
    const filename = searchTerm
      ? `filtered_students_${searchTerm}.pdf`
      : "filtered_students.pdf";
    doc.save(filename);
  };

  const exportToExcel = () => {
    // Define the number of students
    const numberOfStudentsRow = [
      `Number of Students: ${filteredSelections.length}`,
    ];

    // Define table headers
    const headers = [
      "ID",
      "Name",
      "Batch",
      "Semester",
      "Counsellor",
      "Mobile No",
      "Birth Date",
      "GitHub",
      "Total Certificates",
    ];

    // Map student data to rows, starting from the second row
    const tableData = filteredSelections.map((student) => [
      student.id || "",
      student.name || "",
      student.profile?.batch || "-",
      student.profile?.semester || "-",
      student.profile?.counsellor || "-",
      student.profile?.mobileNo || "-",
      student.profile?.birthDate
        ? new Date(student.profile.birthDate).toLocaleDateString()
        : "-", // Format the birthdate
      student.profile?.github || "-",
      student?.certificatesLength || "0",
    ]);

    // Combine the number of students row, headers, and table data into a single array
    const data = [numberOfStudentsRow, headers, ...tableData];

    // Create a worksheet from the combined data
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Students");

    // Save the file with a dynamic filename based on the search term
    const filename = searchTerm
      ? `filtered_students_${searchTerm}.xlsx`
      : "filtered_students.xlsx";
    XLSX.writeFile(wb, filename);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const endpoint =
          user?.role === "admin"
            ? "/user/profile/getAllstudent"
            : "/user/profile/getCounsellorStudents";
        const response = await axiosInstance.get(
          `${endpoint}?page=${currentPage}&limit=${recordsPerPage}`
        );
        setStudents(response.data.data);
        setTotalDocuments(response.data.data.length);
        setTotalPages(response.data.meta.totalPages);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, currentPage, recordsPerPage]);


  const handleLimitChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const defaultImage = "default-img.png";

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
                  Student Database
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total Students:</span>{" "}
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
                  placeholder="Search by ID, Name, Batch, Semester, Counsellor..."
                  className="pl-10 p-3 w-full border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                value={recordsPerPage}
                onChange={handleLimitChange}
                className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="overflow-x-auto">
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
                    Batch
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Semester
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Mobile No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Gender
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Birth Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Counsellor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    GitHub
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    LinkedIn
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Certificates
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Resume
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {error && (
                  <tr>
                    <td colSpan={13} className="px-6 py-4 text-center">
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                        {error}
                      </div>
                    </td>
                  </tr>
                )}
                {loading ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-10 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Loading student data...
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSelections.map((student) => {
                    const hasCertificates = student?.certificatesLength > 0;
                    const hasResume = !!student?.resume;

                    return (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-16 w-16">
                            <img
                              src={
                                student.profile?.avatar
                                  ? `http://localhost:3100/api/v1/user/profile/getProfilePicByAdmin/${student.profile?.avatar}`
                                  : defaultImage
                              }
                              alt="Profile"
                              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:border-blue-500 transition-all duration-200"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {highlightText(student.id?.toUpperCase())}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {highlightText(student.name)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {highlightText(
                              student.profile?.batch?.toUpperCase() || "-"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {highlightText(student.profile?.semester || "-")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {highlightText(student.profile?.mobileNo || "-")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {highlightText(student.profile?.gender || "-")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.profile?.birthDate
                              ? new Date(
                                  student.profile.birthDate
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {highlightText(student.profile?.counsellor || "-")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.profile?.github ? (
                            <a
                              href={`https://github.com/${student.profile.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                              {highlightText(student.profile.github)}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.profile?.linkedIn ? (
                            <a
                              href={student.profile.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                              <span>Profile</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              hasCertificates &&
                              navigate(`/adminCertificate/${student._id}`, {
                                state: { id: student.id, name: student.name },
                              })
                            }
                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded 
                              ${
                                hasCertificates
                                  ? "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                  : "text-gray-500 bg-gray-100 cursor-not-allowed"
                              } 
                              transition-colors duration-200`}
                            disabled={!hasCertificates}
                          >
                            <Award className="h-4 w-4 mr-1" />
                            {highlightText(student?.certificatesLength || "0")}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded 
                              ${
                                hasResume
                                  ? "text-green-700 bg-green-100 hover:bg-green-200"
                                  : "text-gray-500 bg-gray-100 cursor-not-allowed"
                              } 
                              transition-colors duration-200`}
                            onClick={() =>
                              hasResume &&
                              navigate(`/adminResume/${student._id}`, {
                                state: { id: student.id, name: student.name },
                              })
                            }
                            disabled={!hasResume}
                          >
                            <FileCheck className="h-4 w-4 mr-1" />
                            {hasResume ? "View" : "None"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
                  {Math.min(
                    1 + (currentPage - 1) * recordsPerPage,
                    totalDocuments
                  )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * recordsPerPage, totalDocuments)}
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

export default StudentData;
