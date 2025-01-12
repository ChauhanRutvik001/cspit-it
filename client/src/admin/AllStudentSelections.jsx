import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Header from "../componets/Header";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation
import * as XLSX from "xlsx"; // Import xlsx for Excel generation
import "jspdf-autotable"; // Import the autoTable plugin

const AllStudentSelections = () => {
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
    const fetchSelections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(
          "/studentSelection/selections",
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
        setError(err.response?.data?.message || "Failed to fetch data");
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
      studentId.toLowerCase().includes(searchTerm) ||
      studentName.toLowerCase().includes(searchTerm) ||
      domain.toLowerCase().includes(searchTerm) ||
      subdomains.toLowerCase().includes(searchTerm) ||
      topics.toLowerCase().includes(searchTerm)
    );
  });

  const sortedSelections = [
    ...filteredSelections,
    ...selections.filter((student) => !filteredSelections.includes(student)),
  ];

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

    // Add a summary row at the top
    const summaryRow = [
      {
        "Student ID": "Total Students",
        "Student Name": filteredSelections.length,
      },
      ...tableData,
    ];

    // Create Excel sheet
    const ws = XLSX.utils.json_to_sheet(summaryRow);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selections");

    // Define filename and save
    const filename = searchTerm
      ? `student_selections_${searchTerm}.xlsx`
      : "student_selections.xlsx";
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="container mx-auto min-h-screen">
      <Header />
      <div className="p-4 pt-20">
        <h1 className="text-3xl font-semibold text-center mb-6">
          All Student Domain Selections
        </h1>

        <div className="mb-4">
          <div className="text-lg text-gray-700 font-serif">
            <span className="text-black-500 font-medium">
              Total Student Select Domain:
            </span>{" "}
            {totalDocuments}
          </div>
        </div>

        {error && <div className="text-red-600 text-center">{error}</div>}

        {/* Search Bar */}
        <div className="mb-4 flex justify-between space-x-4">
          <input
            type="text"
            placeholder="Search by ID, Name, Domain, Subdomain, or Topic"
            className="p-3 w-full md:w-1/2 lg:w-1/3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleSearch}
            value={searchTerm}
          />

          {/* Download Buttons */}
          <div className="">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
            >
              Download as PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Download as Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                <th
                  className="px-6 py-3 border-b text-left font-medium text-gray-700 cursor-pointer"
                  onClick={() => handleSort("studentId.id")}
                >
                  Student ID{" "}
                  {sortBy === "studentId.id" && (order === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 border-b text-left font-medium text-gray-700">
                  Student Name
                </th>
                <th className="px-6 py-3 border-b text-left font-medium text-gray-700">
                  Domain
                </th>
                <th className="px-6 py-3 border-b text-left font-medium text-gray-700">
                  Subdomains
                </th>
                <th className="px-6 py-3 border-b text-left font-medium text-gray-700">
                  Topics
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    <div className="flex justify-center items-center h-16">
                      <div className="loader" />
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSelections.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-3 border-b text-left text-gray-700">
                      {highlightText(student.studentId?.id)}
                    </td>
                    <td className="px-6 py-3 border-b text-left text-gray-700">
                      {highlightText(student.studentId?.name)}
                    </td>
                    <td className="px-6 py-3 border-b text-left text-gray-700">
                      {highlightText(
                        student.selections
                          .map((selection) => selection.domain)
                          .join(", ")
                      )}
                    </td>
                    <td className="px-6 py-3 border-b text-left text-gray-700">
                      {highlightText(
                        student.selections
                          .flatMap((selection) =>
                            selection.subdomains.map(
                              (subdomain) => subdomain.subdomain
                            )
                          )
                          .join(", ")
                      )}
                    </td>
                    <td className="px-6 py-3 border-b text-left text-gray-700">
                      {highlightText(
                        student.selections
                          .flatMap((selection) =>
                            selection.subdomains.flatMap(
                              (subdomain) => subdomain.topics
                            )
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

        <div className="flex justify-between items-center mt-6">
          <div>
            <label htmlFor="limit" className="mr-2">
              Items per page:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="border border-gray-300 rounded-md p-1"
            >
              {[10, 50, 100, 200, 500, 1000].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded-md"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-gray-200 rounded-md"
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
