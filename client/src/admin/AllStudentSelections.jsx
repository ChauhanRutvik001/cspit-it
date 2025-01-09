import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Header from "../componets/Header";

const AllStudentSelections = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("studentId.name");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);

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
              sortBy,
              order,
              search: searchQuery,
            },
          }
        );
        const { data, pagination } = response.data;
        setSelections(data || []);
        setTotalPages(pagination.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchSelections();
  }, [currentPage, limit, sortBy, order, searchQuery]);

  const handleSort = (field) => {
    setSortBy(field);
    setOrder(order === "asc" ? "desc" : "asc");
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto min-h-screen">
      <Header />
      <div className="p-4 pt-20">
        <h1 className="text-3xl font-semibold text-center mb-6">
          All Student Domain Selections
        </h1>
        {error && <div className="text-red-600 text-center">{error}</div>}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            className="border border-gray-300 p-2 rounded-md w-full"
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                {[
                  { label: "Student ID", field: "studentId.id" },
                  { label: "Student Name", field: "studentId.name" },
                ].map(({ label, field }) => (
                  <th
                    key={field}
                    className="px-6 py-3 border-b text-left font-medium text-gray-700 cursor-pointer"
                    onClick={() => handleSort(field)}
                  >
                    {label} {sortBy === field && (order === "asc" ? "↑" : "↓")}
                  </th>
                ))}
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
                    <div className="flex justify-center items-center h-64">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
                        <p className="mt-4 text-blue-500 text-lg font-medium">
                          Loading, please wait...
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : selections.length > 0 ? (
                selections.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b text-gray-800">
                      {student.studentId?.id || "N/A"}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-800">
                      {student.studentId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {student.selections
                        .map((selection) => selection.domain)
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-600">
                      {student.selections
                        .flatMap((selection) =>
                          selection.subdomains.map(
                            (subdomain) => subdomain.subdomain
                          )
                        )
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-500">
                      {student.selections
                        .flatMap((selection) =>
                          selection.subdomains.flatMap(
                            (subdomain) => subdomain.topics
                          )
                        )
                        .join(", ") || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No selections available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
              {[5, 10, 20, 50].map((value) => (
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
