import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const CompanyList = ({ studentId }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(null); // Track loading for each company

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/company/list");
      if (response.status === 200) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error fetching companies", error);
    }
  };

  const handleApprove = async (companyId) => {
    setLoading(companyId);
    try {
      const response = await axiosInstance.post("/company/approve", {
        studentId: "your-student-id-here", // Ensure studentId is passed
        companyId,
      });

      console.log("Approval Response:", response.data); // Debugging log
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error("Error approving company", error.response?.data || error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-purple-900 mb-4">
        Company Listings
      </h2>
      {companies.length === 0 ? (
        <p className="text-gray-500">No companies available.</p>
      ) : (
        <ul className="space-y-2">
          {companies.map((comp) => (
            <li
              key={comp._id}
              className="p-3 border border-gray-300 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{comp.name}</h3>
                <p className="text-gray-600">Domain: {comp.domain}</p>
                <p className="text-gray-600">Salary: ${comp.salary}</p>
                <p className="text-green-600">
                  Approved by:{" "}
                  {Array.isArray(comp.approvedBy) ? comp.approvedBy.length : 0}{" "}
                  students
                </p>
              </div>
              <button
                onClick={() => handleApprove(comp._id)}
                disabled={
                  loading === comp._id ||
                  (comp.approvedBy || []).includes(studentId)
                }
                className={`px-4 py-2 rounded-lg transition duration-150 ${
                  loading === comp._id
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : (comp.approvedBy || []).includes(studentId)
                    ? "bg-blue-500 text-white cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {loading === comp._id
                  ? "Approving..."
                  : (comp.approvedBy || []).includes(studentId)
                  ? "Approved"
                  : "Approve"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompanyList;
