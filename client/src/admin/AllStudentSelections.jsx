import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation
import * as XLSX from "xlsx"; // Import xlsx for Excel generation
import "jspdf-autotable"; // Import the autoTable plugin
import { ClipLoader } from "react-spinners";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
      if (user?.role !== "admin") navigate("/browse");
    }, [user, navigate]);

  useEffect(() => {
    const fetchSelections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(
          "/studentSelection/ALLselections",
          {
            params: {
              page: currentPage,
              limit,
              order,
            },
          }
        );
        const { data, pagination } = response.data;
        setTotalDocuments(pagination.totalDocuments);
        setSelections(data || []);
        setTotalPages(pagination.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSelections();
  }, [currentPage, limit, sortBy, order]);

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
    const data = [summaryRow[0],  ...tableData];

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

  return (
    <div className="mx-auto min-h-screen p-4">
  <div className="pt-20">
    <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6 font-serif">
      All Student Domain Selections
    </h1>

    {/* Total Students Info */}
    <div className="mb-4 text-lg text-gray-700 font-serif">
      <span className="text-black font-medium">Total Student Select Domain:</span>{" "}
      {totalDocuments}
    </div>

    

    {/* Search & Download Section */}
    <div className="mb-4 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
      <input
        type="text"
        placeholder="Search by ID, Name, Domain, Subdomain, or Topic"
        className="p-3 w-full sm:w-1/2 lg:w-1/3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={handleSearch}
        value={searchTerm}
      />

      <div className="flex space-x-2">
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Download PDF
        </button>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Download Excel
        </button>
      </div>
    </div>

    {/* Items Per Page */}
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
      <label htmlFor="limit" className="mr-2 text-gray-700">
        Items per page:
      </label>
      <select
        id="limit"
        value={limit}
        onChange={handleLimitChange}
        className="border border-gray-300 rounded-md p-2 sm:p-1"
      >
        {[10, 50, 100, 500, 1000].map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>

    {/* Responsive Table */}
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
        <thead className="bg-gray-200">
          <tr className="text-sm sm:text-base">
            <th
              className="px-4 py-3 border-b text-left font-medium text-gray-700 cursor-pointer"
              onClick={() => handleSort("studentId.id")}
            >
              Student ID {sortBy === "studentId.id" && (order === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-3 border-b text-left font-medium text-gray-700">
              Name
            </th>
            <th className="px-4 py-3 border-b text-left font-medium text-gray-700">
              Domain
            </th>
            <th className="px-4 py-3 border-b text-left font-medium text-gray-700">
              Subdomains
            </th>
            <th className="px-4 py-3 border-b text-left font-medium text-gray-700">
              Topics
            </th>
          </tr>
        </thead>
        <tbody>
        {error && <td colSpan="6" className="text-red-600 py-4 text-center">{error}</td>}
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                <div className="flex justify-center items-center h-16">
                  <ClipLoader size={40} color="#1D4ED8" />
                </div>
              </td>
            </tr>
          ) : (
            sortedSelections.map((student, index) => (
              <tr key={index} className="text-sm sm:text-base">
                <td className="px-4 py-3 border-b text-left text-gray-700">
                  {highlightText(student.studentId?.id)}
                </td>
                <td className="px-4 py-3 border-b text-left text-gray-700">
                  {highlightText(student.studentId?.name)}
                </td>
                <td className="px-4 py-3 border-b text-left text-gray-700">
                  {highlightText(
                    student.selections.map((selection) => selection.domain).join(", ")
                  )}
                </td>
                <td className="px-4 py-3 border-b text-left text-gray-700">
                  {highlightText(
                    student.selections
                      .flatMap((selection) =>
                        selection.subdomains.map((subdomain) => subdomain.subdomain)
                      )
                      .join(", ")
                  )}
                </td>
                <td className="px-4 py-3 border-b text-left text-gray-700">
                  {highlightText(
                    student.selections
                      .flatMap((selection) =>
                        selection.subdomains.flatMap((subdomain) => subdomain.topics)
                      )
                      .join(", ")
                  )}
                </td>
              </tr>
            ))
          )}
          
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="flex justify-center items-center mt-6">
      <div className="flex space-x-2">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  </div>
</div>

  );
};

export default AllStudentSelections;
