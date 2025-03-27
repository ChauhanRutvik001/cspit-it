import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  FileDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Building,
  Trash2,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

const CompanyApplications = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("appliedAt");
  const [order, setOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(companyId);
  const [companies, setCompanies] = useState([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [applicationToRemove, setApplicationToRemove] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/browse");
    }
    fetchCompanies();
  }, [user, navigate]);

  useEffect(() => {
    if (companyId) {
      setSelectedCompany(companyId);
    }
  }, [companyId]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/company/list");
      setCompanies(response.data);
      if (!companyId && response.data.length > 0) {
        setSelectedCompany(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      fetchApplications();
    }
  }, [selectedCompany, currentPage, limit, sortBy, order]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/application/company/${selectedCompany}`);
      setApplications(response.data);
      setTotalDocuments(response.data?.length);
      setTotalPages(Math.ceil(response.data.length / limit));
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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

  const handleCompanyChange = (e) => {
    const newCompanyId = e.target.value;
    setSelectedCompany(newCompanyId);
    navigate(`/admin/applications/${newCompanyId}`);
    setCurrentPage(1);
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

  const filteredApplications = applications.filter((application) => {
    const studentName = application.student?.name || "";
    const studentEmail = application.student?.email || "";
    const status = application.status || "";

    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const selectedCompanyName = companies.find(c => c._id === selectedCompany)?.name || "Unknown";
    
    doc.setFontSize(12);
    doc.text(`Applications for ${selectedCompanyName}`, 10, 10);
    doc.text(`Search Term: ${searchTerm || "None"}`, 10, 20);
    doc.text(`Number of Applications: ${filteredApplications.length}`, 10, 30);

    const tableData = filteredApplications.map((app) => [
      app.student?.name || "",
      app.student?.email || "",
      new Date(app.appliedAt).toLocaleDateString(),
      app.status.charAt(0).toUpperCase() + app.status.slice(1),
    ]);

    doc.autoTable({
      startY: 40,
      head: [["Student Name", "Email", "Applied Date", "Status"]],
      body: tableData,
    });

    const filename = `${selectedCompanyName.toLowerCase().replace(/\s+/g, '_')}_applications.pdf`;
    doc.save(filename);
  };

  // Export to Excel
  const exportToExcel = () => {
    const selectedCompanyName = companies.find(c => c._id === selectedCompany)?.name || "Unknown";
    
    const summaryRow = [{
      "Student Name": "Total Applications",
      "Email": filteredApplications.length,
    }];

    const headers = ["Student Name", "Email", "Applied Date", "Status"];

    const tableData = filteredApplications.map((app) => ({
      "Student Name": app.student?.name || "",
      "Email": app.student?.email || "",
      "Applied Date": new Date(app.appliedAt).toLocaleDateString(),
      "Status": app.status.charAt(0).toUpperCase() + app.status.slice(1),
    }));

    const data = [summaryRow[0], ...tableData];
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    const filename = `${selectedCompanyName.toLowerCase().replace(/\s+/g, '_')}_applications.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleRemoveClick = (application) => {
    setApplicationToRemove(application);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!applicationToRemove) return;

    try {
      await axiosInstance.delete(`/application/${applicationToRemove._id}`);
      toast.success("Application removed successfully");
      fetchApplications(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove application");
    } finally {
      setIsRemoveDialogOpen(false);
      setApplicationToRemove(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-full pt-20 p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Building className="h-8 w-8 text-white" />
                <h2 className="text-3xl font-bold text-white font-['Poppins']">
                  Company Applications
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total Applications:</span>{" "}
                  <span className="font-bold">{totalDocuments}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-center flex-grow">
                <select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                >
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FileDown className="h-5 w-5" />
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Download className="h-5 w-5" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          {loading ? (
            <div className="p-8 text-center">Loading applications...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications
                    .slice((currentPage - 1) * limit, currentPage * limit)
                    .map((application) => (
                      <tr key={application._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {highlightText(application.student?.name || "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {highlightText(application.student?.email || "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleRemoveClick(application)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Remove Confirmation Modal */}
          {isRemoveDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Remove Application</h3>
                  <button
                    onClick={() => setIsRemoveDialogOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to remove this application? The student will be able to apply again.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="mb-2">
                      <strong>Student:</strong> {applicationToRemove?.student?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {applicationToRemove?.student?.email}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsRemoveDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(
                      (currentPage - 1) * limit + 1,
                      filteredApplications.length
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, filteredApplications.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredApplications.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyApplications; 