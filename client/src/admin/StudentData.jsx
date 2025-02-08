import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { ClipLoader } from "react-spinners";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
    if (user?.role !== "admin") navigate("/browse");
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
      student.profile?.batch || "N/A",
      student.profile?.semester || "N/A",
      student.profile?.counsellor || "N/A",
      student.profile?.mobileNo || "N/A",
      student.profile?.birthDate
        ? new Date(student.profile.birthDate).toLocaleDateString()
        : "N/A", // Format the birthdate
      student.profile?.github || "N/A",
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
      student.profile?.batch || "N/A",
      student.profile?.semester || "N/A",
      student.profile?.counsellor || "N/A",
      student.profile?.mobileNo || "N/A",
      student.profile?.birthDate
        ? new Date(student.profile.birthDate).toLocaleDateString()
        : "N/A", // Format the birthdate
      student.profile?.github || "N/A",
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
        const response = await axiosInstance.get(
          `/user/profile/getAllstudent?page=${currentPage}&limit=${recordsPerPage}`
        );

        setStudents(response.data.data);
        console.log(response.data);
        setTotalDocuments(response.data.meta.totalStudents);
        setTotalPages(response.data.meta.totalPages);
      } catch (err) {
        setError("Error fetching student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage, recordsPerPage]);

  const handleLimitChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="mx-auto min-h-screen">
      <div className="p-4 pt-20">
        <h2 className="text-3xl font-semibold text-center mb-6 font-serif">
          Student Data
        </h2>
        <div className="mb-4">
          <div className="text-lg text-gray-700 font-serif">
            <span className="font-medium">Total Student Data:</span>{" "}
            {totalDocuments}
          </div>
        </div>
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center md:space-x-4">
          <input
            type="text"
            placeholder="Search by ID, Name, Batch, Semester, Counsellor, Mobile, Github"
            className="p-3 w-full md:w-1/2 lg:w-1/3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0"
            onChange={handleSearch}
            value={searchTerm}
          />
          <div className="flex space-x-2 w-full md:w-auto justify-start md:justify-normal">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Download as PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Download as Excel
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="recordsPerPage" className="mr-2">
            Items per page:
          </label>
          <select
            id="recordsPerPage"
            value={recordsPerPage}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded-md p-1"
          >
            {[10, 50, 100, 500, 1000].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Batch</th>
                <th className="border p-2 text-left">Semester</th>
                <th className="border p-2 text-left">Mobile No</th>
                <th className="border p-2 text-left">Gender</th>
                <th className="border p-2 text-left">BirthDate</th>
                <th className="border p-2 text-left">Counsellor</th>
                <th className="border p-2 text-left">GitHub</th>
                <th className="border p-2 text-left">LinkedIn</th>
                <th className="border p-2 text-left">Certificates</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    <ClipLoader size={40} color="#1D4ED8" />
                  </td>
                </tr>
              ) : filteredSelections.length > 0 ? (
                filteredSelections.map((student) => (
                  <tr
                    key={student._id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 hover:cursor-pointer"
                    onClick={() =>
                      navigate(`/adminCertificate/${student._id}`, {
                        state: { id: student.id, name: student.name },
                      })
                    }
                  >
                    <td className="border p-2">
                      {highlightText(student.id?.toUpperCase())}
                    </td>
                    <td className="border p-2 capitalize">
                      {highlightText(student.name)}
                    </td>
                    <td className="border p-2">
                      {highlightText(
                        student.profile?.batch?.toUpperCase() || "N/A"
                      )}
                    </td>
                    <td className="border p-2">
                      {highlightText(student.profile?.semester || "N/A")}
                    </td>
                    <td className="border p-2">
                      {highlightText(student.profile?.mobileNo || "N/A")}
                    </td>
                    <td className="border p-2">
                      {highlightText(student.profile?.gender || "N/A")}
                    </td>
                    <td className="border p-2">
                      {student.profile?.birthDate
                        ? new Date(
                            student.profile.birthDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="border p-2 capitalize">
                      {highlightText(student.profile?.counsellor || "N/A")}
                    </td>
                    <td className="border p-2">
                      {student.profile?.github ? (
                        <a
                          href={`https://github.com/${student.profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {highlightText(student.profile.github)}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="border p-2">
                      {student.profile?.linkedIn ? (
                        <a
                          href={student.profile.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                          title={student.profile.linkedIn}
                        >
                          LinkedIn
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="border p-2">
                      {highlightText(student?.certificatesLength || "0")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-lg">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentData;
