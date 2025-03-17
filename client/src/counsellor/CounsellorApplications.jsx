import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Building, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";

const CounsellorApplications = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role !== "counsellor") {
      navigate("/browse");
    }
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get all applications where counsellor matches current user and status is pending
      const response = await axiosInstance.get('/application/counsellor/pending');
      setApplications(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleApproval = async (applicationId, approve) => {
    try {
      await axiosInstance.patch(`/application/${applicationId}/counsellor-approval`, {
        approve
      });
      toast.success(approve ? "Application approved" : "Application rejected");
      fetchApplications(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process approval");
    }
  };

  const filteredApplications = applications.filter((application) => {
    const studentName = application.student?.name || "";
    const studentEmail = application.student?.email || "";
    const companyName = application.company?.name || "";

    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
                  Pending Applications
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total Pending:</span>{" "}
                  <span className="font-bold">{applications.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Applications Table */}
          {loading ? (
            <div className="p-8 text-center">Loading applications...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending applications found</div>
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
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.student?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.student?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.company?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApproval(application._id, true)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleApproval(application._id, false)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounsellorApplications; 