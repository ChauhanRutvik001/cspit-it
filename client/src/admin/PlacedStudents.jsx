import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Upload,
  Download,
  Trash2,
  FileSpreadsheet,
  FileText,
  UserPlus,
  Users,
  AlertCircle,
} from "lucide-react";
import { read, utils, writeFile } from "xlsx";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaGoogle, FaArrowLeft } from "react-icons/fa";

const PlacedStudents = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [inputType, setInputType] = useState("email");
  const [studentInput, setStudentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [placedStudents, setPlacedStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    studentId: null,
    studentName: "",
  });

  useEffect(() => {
    fetchPlacedStudents();
  }, [page, rowsPerPage]);

  const fetchPlacedStudents = async (search = "") => {
    try {
      setSearchLoading(true);
      setError(null);

      // Add a 3-second delay before making the API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await axiosInstance.get("/admin/placed-students", {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
        },
      });

      if (response.data.success) {
        setPlacedStudents(response.data.students);
        console.log(response.data.students);
        setTotalStudents(response.data.totalStudents);
      } else {
        setError(response.data.message || "Failed to fetch placed students");
      }
    } catch (error) {
      console.error("Error fetching placed students:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch placed students. Please try again."
      );
      toast.error("Failed to fetch placed students");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const timeoutId = setTimeout(() => {
      fetchPlacedStudents(e.target.value);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (value) => {
    setRowsPerPage(value);
    setPage(0);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const handleBulkSubmit = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      const students = jsonData.map((row) => ({
        email:
          row.email ||
          row.Email ||
          row.EMAIL ||
          `${
            row.id ||
            row.Id ||
            row.ID ||
            row.studentId ||
            row.StudentId ||
            row.StudentID ||
            row.STUDENT_ID
          }@charusat.edu.in`,
      }));

      const response = await axiosInstance.post("/admin/placed-students/bulk", {
        students,
      });
      toast.success(
        `Successfully updated ${response.data.updatedCount} students`
      );
      setFile(null);
      fetchPlacedStudents(searchQuery);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!studentInput) {
      toast.error(`Please enter student ${inputType}`);
      return;
    }

    try {
      setLoading(true);
      const payload =
        inputType === "email"
          ? { email: studentInput }
          : { studentId: studentInput };

      const response = await axiosInstance.post(
        "/admin/placed-students/single",
        payload
      );
      toast.success(
        response.data.message || "Student successfully marked as placed"
      );
      setStudentInput("");
      fetchPlacedStudents(searchQuery);
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error(error.response?.data?.message || "Error adding student");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${studentName} from the placed students list?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/admin/placed-students/remove",
        { studentId }
      );
      toast.success(
        response.data.message || "Student removed from placed list"
      );
      fetchPlacedStudents(searchQuery);
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error(error.response?.data?.message || "Error removing student");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = placedStudents.map((student) => ({
        "Student ID": student.id,
        Name: student.name,
        Email: student.email,
        "Placed Date": student.placedDate
          ? new Date(student.placedDate).toLocaleDateString()
          : "N/A",
      }));

      const ws = utils.json_to_sheet(exportData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Placed Students");
      writeFile(wb, "placed_students.xlsx");
      toast.success("Successfully exported to Excel");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Student ID", "Name", "Email", "Placed Date"];
      const tableRows = placedStudents.map((student) => [
        student.id,
        student.name,
        student.email,
        student.placedDate
          ? new Date(student.placedDate).toLocaleDateString()
          : "N/A",
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.text("Placed Students List", 14, 15);
      doc.save("placed_students.pdf");
      toast.success("Successfully exported to PDF");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export to PDF");
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-black p-4 md:p-10">
      {/* Fixed Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          className="bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium backdrop-blur-sm border border-blue-200"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="mx-auto py-8">
        <div className="mx-auto space-y-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Placed Students
                    </h1>
                    <p className="text-indigo-100 mt-1">
                      Manage and track placed students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                  >
                    <FileSpreadsheet className="h-5 w-5 text-white" />
                    <span className="text-white">Excel</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                  >
                    <FileText className="h-5 w-5 text-white" />
                    <span className="text-white">PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-96 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={rowsPerPage}
                    onChange={(e) =>
                      handleChangeRowsPerPage(Number(e.target.value))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Add Student Forms */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Single Student Form */}
              <div className="bg-white rounded-xl border p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold">Add Single Student</h2>
                </div>
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={inputType === "email"}
                        onChange={(e) => setInputType(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="id"
                        checked={inputType === "id"}
                        onChange={(e) => setInputType(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-2">Student ID</span>
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <input
                      type={inputType === "email" ? "email" : "text"}
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      placeholder={
                        inputType === "email"
                          ? "Enter student email"
                          : "Enter student ID"
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-500 hover:to-blue-400 transition-all duration-200 disabled:opacity-50"
                    >
                      Add Student
                    </button>
                  </div>
                </form>
              </div>

              {/* Bulk Upload Form */}
              <div className="bg-white rounded-xl border p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold">Bulk Upload</h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <button
                    onClick={handleBulkSubmit}
                    disabled={!file || loading}
                    className="w-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-500 hover:to-blue-400 transition-all duration-200 disabled:opacity-50"
                  >
                    Upload and Process
                  </button>
                </div>
                <p className="text-sm text-red-900">
                  Note: Excel file should contain either email or id column for
                  students
                </p>
              </div>
            </div>

            {/* Students Table */}
            <div className="p-6">
              {/* List Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Placed Students List
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        View and manage placed students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-indigo-100">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Total Students:
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">
                        {totalStudents}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Placed Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {searchLoading ? (
                        // YouTube-style skeleton loading rows
                        Array(rowsPerPage)
                          .fill(0)
                          .map((_, index) => (
                            <tr
                              key={`skeleton-${index}`}
                              className="animate-pulse"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-6 w-20 bg-gray-200 rounded"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="h-8 w-8 bg-gray-200 rounded-lg ml-auto"></div>
                              </td>
                            </tr>
                          ))
                      ) : placedStudents.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Users className="h-8 w-8 mb-2 text-gray-400" />
                              <p className="text-gray-600 font-medium">
                                No placed students found
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Add students using the forms above
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        placedStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                {student.id}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {student.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {student.placedDate
                                  ? new Date(
                                      student.placedDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() =>
                                  handleRemoveStudent(student.id, student.name)
                                }
                                className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {placedStudents.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {page * rowsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min((page + 1) * rowsPerPage, totalStudents)}
                        </span>{" "}
                        of <span className="font-medium">{totalStudents}</span>{" "}
                        results
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleChangePage(page - 1)}
                          disabled={page === 0}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handleChangePage(page + 1)}
                          disabled={(page + 1) * rowsPerPage >= totalStudents}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacedStudents;
