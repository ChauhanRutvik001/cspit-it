import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  X,
  Globe,
  Linkedin,
  Search,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Building2,
  Briefcase,
  DollarSign,
  Users,
} from "lucide-react";

const Company = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const user = useSelector((store) => store.app?.user);

  useEffect(() => {
    fetchCompanies();
    if (user?._id && user?.role === "student") {
      fetchUserApplications();
    }
  }, [user?._id]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/company/list");
      // Ensure we have an array, even if response is unexpected
      setCompanies(Array.isArray(response?.data) ? response.data : []);
      setLoading(false);
      console.log("Companies fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching companies:", error?.response || error);
      setError("Failed to fetch companies. Please try again later.");
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      if (!user?._id) return;

      const response = await axiosInstance.get(`/application/user/${user._id}`);
      const applicationMap = {};

      if (Array.isArray(response?.data)) {
        response.data.forEach((app) => {
          if (app && app.company) {
            applicationMap[app.company] = app.status || "applied";
          }
        });
      }

      setApplications(applicationMap);
    } catch (error) {
      console.error(
        "Error fetching user applications:",
        error?.response || error
      );
      toast.error("Failed to load your applications. Please refresh the page.");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e?.target?.value || "");
    setCurrentPage(1);
  };

  const handleLimitChange = (e) => {
    const value = Number(e?.target?.value);
    setRecordsPerPage(isNaN(value) ? 10 : value);
    setCurrentPage(1);
  };

  // Safely filter companies with null checks
  const filteredCompanies = (companies || []).filter((company) => {
    try {
      const searchLower = (searchTerm || "").toLowerCase();
      return (
        (company?.name || "").toLowerCase().includes(searchLower) ||
        (company?.domain || "").toLowerCase().includes(searchLower) ||
        (company?.description || "").toLowerCase().includes(searchLower)
      );
    } catch (err) {
      return false;
    }
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / Math.max(1, recordsPerPage))
  );
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleApply = async (companyId) => {
    if (!user?._id) {
      toast.error("Please login to apply");
      return;
    }

    setLoading(companyId);
    try {
      const response = await axiosInstance.post("/application/submit", {
        studentId: user._id,
        companyId,
      });

      // Check if response exists and has the expected structure
      if (response?.data?.application?.status === "pending") {
        toast.success(
          "Application submitted! Waiting for counsellor approval.",
          {
            duration: 5000,
            icon: "⏳",
          }
        );
      } else {
        toast.success("Application submitted successfully!", {
          icon: "✅",
        });
      }

      await fetchUserApplications();
    } catch (error) {
      console.error("Error applying to company:", error?.response || error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to apply to company";
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async (companyId) => {
    if (!user?._id) {
      toast.error("Please login to cancel application");
      return;
    }

    setLoading(companyId);
    try {
      await axiosInstance.delete("/application/cancel", {
        data: {
          studentId: user._id,
          companyId,
        },
      });

      toast.success("Application cancelled successfully");
      await fetchUserApplications();
    } catch (error) {
      console.error("Error cancelling application:", error?.response || error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel application";
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleViewApplications = (companyId) => {
    if (companyId) {
      navigate(`/admin/applications/${companyId}`);
    } else {
      toast.error("Invalid company ID");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-lg mb-4">Error</div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchCompanies}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Admin/Counsellor View
  if (user?.role === "admin" || user?.role === "counsellor") {
    const handleEdit = (comp) => {
      if (comp && comp._id) {
        navigate("/companypage", { state: { company: comp } });
      } else {
        toast.error("Invalid company data");
      }
    };

    const handleDelete = async (id) => {
      if (!id) {
        toast.error("Invalid company ID");
        return;
      }

      if (window.confirm("Are you sure you want to delete this company?")) {
        try {
          await axiosInstance.delete(`/company/${id}`);
          toast.success("Company deleted successfully!");
          fetchCompanies();
        } catch (error) {
          console.error("Error deleting company:", error);
          toast.error(
            error?.response?.data?.message || "Error deleting company"
          );
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="container mx-auto">
          <div className="bg-white shadow-xl my-16 rounded-2xl overflow-hidden backdrop-blur-sm backdrop-filter">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold">Companies Overview</h2>
                  <p className="mt-1 text-indigo-100">
                    Manage and monitor company listings
                  </p>
                </div>
                {user?.role === "admin" && (
                  <button
                    onClick={() => navigate("/companypage")}
                    className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 group"
                  >
                    <Building2 className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
                    Add New Company
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    <div>
                      <p className="text-sm text-indigo-100">Total Companies</p>
                      <p className="text-2xl font-bold">
                        {companies?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  <select
                    value={recordsPerPage}
                    onChange={handleLimitChange}
                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  >
                    {[10, 25, 50, 100].map((value) => (
                      <option key={value} value={value}>
                        {value} per page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading === true ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <p className="mt-4 text-gray-500">Loading companies...</p>
                </div>
              ) : paginatedCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-16 w-16 text-gray-300" />
                  <p className="mt-4 text-gray-500">No companies found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Salary Range
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Links
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCompanies.map((comp) =>
                      comp && comp._id ? (
                        <tr
                          key={comp._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {comp.name || "Unnamed Company"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 text-gray-900 mr-2" />
                              <span className="text-sm text-gray-900">
                                {comp.domain || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-md break-words whitespace-normal">
                              {comp.description ? (
                                <>
                                  {comp.description.substring(0, 40)}
                                  {comp.description.length > 40 ? "..." : ""}
                                </>
                              ) : (
                                "No description available"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900">
                                {typeof comp.salary === "object" &&
                                comp.salary?.min &&
                                comp.salary?.max
                                  ? `₹${(
                                      comp.salary.min || 0
                                    ).toLocaleString()} - ₹${(
                                      comp.salary.max || 0
                                    ).toLocaleString()}`
                                  : comp.salary
                                  ? `₹${comp.salary.toLocaleString()}`
                                  : "Not specified"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              {comp.website && (
                                <a
                                  href={comp.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-indigo-600 transition-colors duration-200"
                                  title="Company Website"
                                >
                                  <Globe className="h-5 w-5 transform hover:scale-110 transition-transform" />
                                </a>
                              )}
                              {comp.linkedin && (
                                <a
                                  href={comp.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                                  title="LinkedIn Profile"
                                >
                                  <Linkedin className="h-5 w-5 transform hover:scale-110 transition-transform" />
                                </a>
                              )}
                              {!comp.website && !comp.linkedin && (
                                <span className="text-gray-400 text-sm">
                                  No links available
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewApplications(comp._id)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 group"
                              >
                                <Users className="h-4 w-4 mr-1 transform group-hover:scale-110 transition-transform" />
                                Applications
                              </button>
                              <button
                                onClick={() => handleEdit(comp)}
                                className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(comp._id)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {filteredCompanies.length > 0 ? startIndex + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      startIndex + recordsPerPage,
                      filteredCompanies.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredCompanies.length}
                  </span>{" "}
                  entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={
                      currentPage === 1 || filteredCompanies.length === 0
                    }
                    className={`p-2 rounded-lg border ${
                      currentPage === 1 || filteredCompanies.length === 0
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-indigo-500 transition-all duration-200"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-4 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={
                      currentPage === totalPages ||
                      filteredCompanies.length === 0
                    }
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages ||
                      filteredCompanies.length === 0
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-indigo-500 transition-all duration-200"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="container mx-auto">
        <div className="bg-white my-16 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm backdrop-filter">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold">Available Companies</h2>
                <p className="mt-1 text-indigo-100">
                  Explore and apply to companies
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/60 text-white"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Company Cards */}
          {loading === true ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-500">Loading companies...</p>
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-gray-600">
                Please login to view and apply to companies
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Login
              </button>
            </div>
          ) : paginatedCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-gray-500">
                {searchTerm
                  ? "No companies match your search criteria"
                  : "No companies found"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {paginatedCompanies.map((company) =>
                  company && company._id ? (
                    <div
                      key={company._id}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 flex flex-col min-h-[400px]"
                    >
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                              <Building2 className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {company.name || "Unnamed Company"}
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Company Website"
                              >
                                <Globe className="h-5 w-5 transform hover:scale-110 transition-transform" />
                              </a>
                            )}
                            {company.linkedin && (
                              <a
                                href={company.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="LinkedIn Profile"
                              >
                                <Linkedin className="h-5 w-5 transform hover:scale-110 transition-transform" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center text-sm">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Domain:</span>
                            <span className="ml-1 text-gray-900 font-medium">
                              {company.domain || "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Salary:</span>
                            <span className="ml-1 text-gray-900 font-medium">
                              {typeof company.salary === "object" &&
                              company.salary?.min &&
                              company.salary?.max
                                ? `₹${(
                                    company.salary.min || 0
                                  ).toLocaleString()} - ₹${(
                                    company.salary.max || 0
                                  ).toLocaleString()}`
                                : company.salary
                                ? `₹${company.salary.toLocaleString()}`
                                : "Not specified"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 max-w-md break-words whitespace-normal">
                            {company?.description ? (
                              <>
                                {company.description.substring(0, 40)}
                                {company.description.length > 40 ? "..." : ""}
                              </>
                            ) : (
                              "No description available"
                            )}
                          </div>
                        </div>
                        <div className="pt-4 mt-auto border-t border-gray-100">
                          {loading === company._id ? (
                            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center justify-center w-full">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              Processing...
                            </div>
                          ) : applications[company._id] ? (
                            <div className="flex items-center justify-end gap-2">
                              {applications[company._id] === "pending" ? (
                                <span className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg flex items-center group w-full justify-center">
                                  <div className="animate-pulse mr-2 h-2 w-2 bg-yellow-400 rounded-full"></div>
                                  Pending Approval
                                  <button
                                    onClick={() => handleCancel(company._id)}
                                    className="ml-2 text-yellow-600 hover:text-red-600 transition-colors"
                                    title="Cancel Application"
                                  >
                                    <X className="h-4 w-4 transform hover:scale-110 transition-transform" />
                                  </button>
                                </span>
                              ) : applications[company._id] === "approved" ? (
                                <span className="bg-green-50 text-green-800 px-4 py-2 rounded-lg flex items-center w-full justify-center">
                                  <div className="mr-2 h-2 w-2 bg-green-400 rounded-full"></div>
                                  Approved
                                  <button
                                    onClick={() => handleCancel(company._id)}
                                    className="ml-2 text-green-600 hover:text-red-600 transition-colors"
                                    title="Cancel Application"
                                  >
                                    <X className="h-4 w-4 transform hover:scale-110 transition-transform" />
                                  </button>
                                </span>
                              ) : applications[company._id] === "rejected" ? (
                                <span className="bg-red-50 text-red-800 px-4 py-2 rounded-lg flex items-center w-full justify-center">
                                  <div className="mr-2 h-2 w-2 bg-red-400 rounded-full"></div>
                                  Rejected
                                </span>
                              ) : (
                                <span className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg flex items-center w-full justify-center">
                                  Applied
                                  <button
                                    onClick={() => handleCancel(company._id)}
                                    className="ml-2 text-blue-600 hover:text-red-600 transition-colors"
                                    title="Cancel Application"
                                  >
                                    <X className="h-4 w-4 transform hover:scale-110 transition-transform" />
                                  </button>
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApply(company._id)}
                              className="relative inline-flex items-center justify-center w-full px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl hover:from-indigo-500 hover:to-blue-400 transform hover:scale-[1.02] transition-all duration-200 font-medium shadow-lg hover:shadow-xl active:scale-[0.98] group overflow-hidden"
                            >
                              <span className="absolute inset-0 bg-white/10 group-hover:scale-x-100 scale-x-0 transition-transform origin-left"></span>
                              <Briefcase className="h-5 w-5 mr-2 transform group-hover:rotate-12 transition-transform" />
                              <span className="relative">Apply Now</span>
                              <span className="absolute right-4 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
                                →
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {filteredCompanies.length > 0 ? startIndex + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    startIndex + recordsPerPage,
                    filteredCompanies.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredCompanies.length}</span>{" "}
                entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || filteredCompanies.length === 0}
                  className={`p-2 rounded-lg border ${
                    currentPage === 1 || filteredCompanies.length === 0
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-indigo-500 transition-all duration-200"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={
                    currentPage === totalPages || filteredCompanies.length === 0
                  }
                  className={`p-2 rounded-lg border ${
                    currentPage === totalPages || filteredCompanies.length === 0
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-indigo-500 transition-all duration-200"
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;
