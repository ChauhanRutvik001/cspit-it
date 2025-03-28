import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import ExcelUploadInstructions from "../componets/ExcelUploadInstructions";

const CounsellorRegistation = () => {
  const [students, setStudents] = useState([]); // Holds parsed Excel data
  const [selectedStudents, setSelectedStudents] = useState({}); // Tracks selected students for registration
  const [errorMessages, setErrorMessages] = useState([]); // Holds error messages from the backend
  const [assignLoading, setAssignLoading] = useState(false);
  const user = useSelector((store) => store.app.user);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [newStudent, setNewStudent] = useState({
    id: "",
    name: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "admin") navigate("/browse");
  }, [user, navigate]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verify file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      e.target.value = ''; // Clear the file input
      return;
    }

    // Create a FileReader to read the file
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result); // Read the file as ArrayBuffer
        const workbook = XLSX.read(data, { type: "array" }); // Parse the Excel data into a workbook
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          toast.error('The Excel file is empty or corrupted');
          e.target.value = ''; // Clear the file input
          return;
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Get the first sheet
        const parsedData = XLSX.utils.sheet_to_json(sheet); // Parse the sheet into JSON data

        // Check if data has required headers
        if (parsedData.length > 0 && (!parsedData[0].hasOwnProperty('ID') || !parsedData[0].hasOwnProperty('NAME'))) {
          toast.error('Excel file must contain "ID" and "NAME" columns exactly as shown');
          e.target.value = ''; // Clear the file input
          return;
        }

        // Transform parsed data to expected format
        const formattedData = parsedData.map((row, index) => {
          // Check for valid data
          if (!row.ID && !row.NAME) {
            return null; // Skip empty rows
          }
          
          return {
            id: row.ID?.toString().toLowerCase() || "", // Match the key 'ID' in the parsed data
            name: row.NAME?.toString() || "", // Match the key 'Name'
            index,
          };
        }).filter(Boolean); // Remove null items (empty rows)

        if (formattedData.length === 0) {
          toast.error('No valid data found in the Excel file');
          e.target.value = ''; // Clear the file input
          return;
        }

        setStudents(formattedData);
        toast.success(`Successfully loaded ${formattedData.length} entries`);

        // Reset selected students and error messages
        setSelectedStudents({});
        setErrorMessages([]);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error('Failed to parse the Excel file. The file might be corrupted or in an invalid format.');
        e.target.value = ''; // Clear the file input
      }
    };

    reader.onerror = () => {
      toast.error('Error reading the file. Please try again with a different file.');
      e.target.value = ''; // Clear the file input
    };

    reader.readAsArrayBuffer(file); // Start reading the file
  };

  // Validate student data before submitting
  const validateStudents = (students) => {
    return students.every((student) => student.id && student.name);
  };

  // Toggle select all students
  const toggleSelectAll = () => {
    if (Object.keys(selectedStudents).length === students.length) {
      setSelectedStudents({});
    } else {
      const allSelected = {};
      students.forEach((student) => (allSelected[student.index] = true));
      setSelectedStudents(allSelected);
    }
  };

  // Handle individual student selection toggle
  const toggleSelectStudent = (index) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleRegisterSelected = async () => {
    const selectedData = students.filter(
      (student) => selectedStudents[student.index]
    );

    if (selectedData.length === 0) {
      toast.error("No students selected for registration.");
      return;
    }

    // Validate student data (ID and Name should be non-empty)
    if (!validateStudents(selectedData)) {
      toast.error("Please ensure all student IDs and names are valid.");
      return;
    }

    try {
      setAssignLoading(true);
      const response = await axiosInstance.post(
        "/admin/bulk-register-counsellor",
        {
          students: selectedData,
        }
      );

      const { results } = response.data;

      // Update error messages in the frontend
      setErrorMessages([
        ...results.errors.map((err) => `${err.id}: ${err.message}`),
      ]);

      if (results.success.length > 0) {
        toast.success("Registration completed successfully.");
      }

      // Remove successfully registered students from the UI
      setStudents((prev) =>
        prev.filter((student) => !selectedStudents[student.index])
      );
      setSelectedStudents({}); // Reset selected students after registration
    } catch (error) {
      console.error(error);
      toast.error(
        "Error registering students. Please check console for details."
      );
    } finally {
      setAssignLoading(false);
    }
  };

  // Handle adding a single student manually
  const handleModalSubmit = () => {
    if (!newStudent.id || !newStudent.name) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Add the new student to the list
    setStudents((prev) => [
      ...prev,
      {
        id: newStudent.id.toLowerCase(),
        name: newStudent.name,
        index: students.length,
      },
    ]);

    // Reset the form and close the modal
    setNewStudent({ id: "", name: "" });
    setIsModalOpen(false);
    toast.success("Student added successfully!");
  };

  // Handle declining a single student
  const handleDecline = (index) => {
    setStudents((prev) => prev.filter((student) => student.index !== index));
    setSelectedStudents((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Calculate the total pages
  const totalPages = Math.ceil(students.length / PAGE_SIZE);

  // Slice the students to display only the current page data
  const paginatedStudents = students.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Handlers for pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="relative min-h-screen bg-white text-black p-4 md:p-10">
      <div className="pl-4 pt-24">
        <button
          className="py-2 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition transform duration-200"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {/* Add Excel Upload Instructions */}
      <ExcelUploadInstructions type="counsellor" />

      <div className="px-6 mt-10 flex md:flex-row flex-col md:items-center md:justify-between gap-4">
        <div className="md:w-auto w-full sm:text-center">
          <h1 className="text-2xl font-bold mb-4">
            Bulk Counsellor Registration
          </h1>
          {/* File Upload Input */}
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="mb-4 cursor-pointer"
          />
        </div>
        <div className="md:w-auto w-full sm:flex sm:justify-center">
          <button
            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition transform duration-200"
            onClick={() => setIsModalOpen(true)}
          >
            Add Single Counsellor
          </button>
        </div>
      </div>

      {/* Render Student Data Table */}
      {students.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-8">
          <table className="min-w-full text-lg text-left text-black">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th className="py-3 px-6">
                  <input
                    type="checkbox"
                    className="accent-blue-500"
                    checked={
                      Object.keys(selectedStudents).length === students.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-3 px-6">#</th>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                >
                  <td className="py-3 px-6">
                    <input
                      type="checkbox"
                      className="accent-blue-500"
                      checked={!!selectedStudents[student.index]}
                      onChange={() => toggleSelectStudent(student.index)}
                    />
                  </td>
                  <td className="py-3 px-6">
                    {(index + 1 + (currentPage - 1) * PAGE_SIZE)
                      .toString()
                      .padStart(2, "0")}
                  </td>
                  <td className="py-3 px-6">{student.id}</td>
                  <td className="capitalize py-3 px-6">{student.name}</td>
                  <td className="py-3 px-6">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDecline(student.index)}
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-200 text-black py-2 px-4 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-500 pr-2 pl-2 ">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-200 text-black py-2 px-4 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <button
            onClick={handleRegisterSelected}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg shadow transition mt-4"
          >
            Register Selected
          </button>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p>No data available</p>
        </div>
      )}

      <div className="p-4">
        {errorMessages?.length > 0 && (
          <div className="mt-4 bg-red-100 text-red-800 p-4 rounded">
            <h3 className="font-bold">Errors:</h3>
            <ul>
              {errorMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {assignLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p className="text-white text-lg font-semibold">Registration...</p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-2xl font-semibold mb-4">Add Single Counsellor</h3>
            <input
              type="text"
              className="w-full p-3 mb-4 border rounded"
              placeholder="ID"
              value={newStudent.id}
              onChange={(e) =>
                setNewStudent({ ...newStudent, id: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full p-3 mb-4 border rounded"
              placeholder="Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
            <div className="flex justify-between">
              <button
                className="py-2 px-4 bg-blue-600 text-white rounded"
                onClick={handleModalSubmit}
              >
                Add
              </button>
              <button
                className="py-2 px-4 bg-gray-500 text-white rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorRegistation;
