import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import { format } from "date-fns";
import {
  FaExternalLinkAlt,
  FaCog,
  FaClock,
  FaBook,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";
import ManageTests from "./ManageTests";

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showManagement, setShowManagement] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((store) => store.app.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchTests = async () => {
      try {
        console.log("Fetching tests...");
        const response = await axiosInstance.get("/tests");
        console.log("Response:", response);

        if (response.data && Array.isArray(response.data)) {
          console.log("Tests data:", response.data);
          setTests(response.data.filter((test) => test.isActive));
        } else {
          console.log("Invalid response format:", response.data);
          setTests([]);
          setError("No tests available - Invalid response format");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data,
        });

        const errorMessage =
          err.response?.data?.message || err.message || "Failed to load tests";
        setError(`${errorMessage}. Please try again later.`);
        setTests([]);
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleStartTest = (testId) => {
    navigate(`/tests/${testId}`);
  };

  const toggleManagement = () => {
    setShowManagement(!showManagement);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-red-500 text-xl mb-2">⚠️ Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
        zz
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 pt-24 pb-12 rounded-b-[40px] shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/10 p-3 rounded-2xl mr-4">
                <FaClipboardList className="text-white h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Tests</h1>
                <p className="text-blue-100 mt-1">Manage and take tests</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={toggleManagement}
                className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-white/20 shadow-lg hover:bg-white hover:text-blue-600 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                <FaCog className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">
                  {showManagement ? "Hide Quiz Management" : "Manage Quizzes"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-7xl mx-auto">
          {isAdmin && showManagement && (
            <div className="mb-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Quiz Management
                </h2>
              </div>
              <div className="p-8">
                <ManageTests />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Available Tests
              </h2>
              <p className="text-gray-600 mt-1">
                Select a test to begin your assessment
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tests.map((test) => (
                  <div
                    key={test._id}
                    className="group bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FaBook className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 mb-3">
                        {test.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-2">
                        {test.description}
                      </p>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                          <FaBook className="w-4 h-4 mr-3 text-blue-600" />
                          <span className="font-medium">Subject:</span>
                          <span className="ml-2">{test.subject}</span>
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                          <FaClock className="w-4 h-4 mr-3 text-blue-600" />
                          <span className="font-medium">Duration:</span>
                          <span className="ml-2">{test.duration}</span>
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                          <FaCalendarAlt className="w-4 h-4 mr-3 text-blue-600" />
                          <span className="font-medium">Available Until:</span>
                          <span className="ml-2">
                            {format(new Date(test.availableUntil), "PPP")}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartTest(test._id)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 font-medium"
                      >
                        Start Test
                        <FaExternalLinkAlt className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {tests.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">📚</span>
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">
                      No Tests Available
                    </h3>
                    <p className="text-gray-600">
                      Check back later for new tests.
                    </p>
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

export default Tests;
