import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
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
  FaSearch,
  FaRedo,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";

// Lazy load the ManageTests component to improve initial load time
const ManageTests = lazy(() => import("./ManageTests"));

// Skeleton loader component for test cards
const TestCardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow p-6">
    <div className="bg-gray-200 w-12 h-12 rounded-2xl mb-4"></div>
    <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-6"></div>
    <div className="space-y-4 mb-6">
      <div className="h-12 bg-gray-100 rounded-xl"></div>
      <div className="h-12 bg-gray-100 rounded-xl"></div>
      <div className="h-12 bg-gray-100 rounded-xl"></div>
    </div>
    <div className="h-14 bg-gray-200 rounded-xl"></div>
  </div>
);

// Test card component extracted for better separation of concerns and memoization
const TestCard = React.memo(({ test, onStartTest }) => {
  // Pre-format date to avoid formatting in every render
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(test.availableUntil), "PPP");
    } catch (error) {
      return "Date unavailable";
    }
  }, [test.availableUntil]);

  return (
    <div className="group bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="p-6">
        <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <FaBook className="w-6 h-6 text-blue-600" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          {test.title || "Untitled Test"}
        </h2>
        <p className="text-gray-600 mb-6 line-clamp-2">
          {test.description || "No description provided"}
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
            <FaBook className="w-4 h-4 mr-3 text-blue-600" aria-hidden="true" />
            <span className="font-medium">Subject:</span>
            <span className="ml-2">{test.subject || "General"}</span>
          </div>
          <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
            <FaClock className="w-4 h-4 mr-3 text-blue-600" aria-hidden="true" />
            <span className="font-medium">Duration:</span>
            <span className="ml-2">{test.duration || "Not specified"}</span>
          </div>
          <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
            <FaCalendarAlt className="w-4 h-4 mr-3 text-blue-600" aria-hidden="true" />
            <span className="font-medium">Available Until:</span>
            <span className="ml-2">{formattedDate}</span>
          </div>
        </div>

        <button
          onClick={() => onStartTest(test._id)}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 font-medium"
          aria-label={`Start ${test.title} test`}
        >
          Start Test
          <FaExternalLinkAlt className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

// Empty state component
const EmptyState = ({ onRetry }) => (
  <div className="col-span-full text-center py-16">
    <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <span className="text-4xl" role="img" aria-label="Books emoji">📚</span>
    </div>
    <h3 className="text-xl font-medium text-gray-800 mb-2">
      No Tests Available
    </h3>
    <p className="text-gray-600 mb-4">
      Check back later for new tests.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition duration-200"
        aria-label="Retry loading tests"
      >
        <FaRedo className="w-4 h-4" aria-hidden="true" /> 
        Refresh Tests
      </button>
    )}
  </div>
);

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showManagement, setShowManagement] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("title"); // default sort by title
  const [sortDirection, setSortDirection] = useState("asc"); // default ascending
  const [filterSubject, setFilterSubject] = useState("all");

  const navigate = useNavigate();
  const user = useSelector((store) => store.app?.user);
  const isAdmin = user?.role === "admin";

  // Extract fetch tests logic to a separate function for reusability
  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get("/tests");
      
      if (response?.data && Array.isArray(response.data)) {
        const activeTests = response.data.filter((test) => test?.isActive === true);
        setTests(activeTests);
        setFilteredTests(activeTests);
      } else {
        setTests([]);
        setFilteredTests([]);
        setError("No tests available - Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load tests";
      setError(`${errorMessage}. Please try again later.`);
      setTests([]);
      setFilteredTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTests();
    
    // Setup a cleanup function
    return () => {
      // Any cleanup code if needed
    };
  }, [fetchTests]);

  // Handle search and filtering
  useEffect(() => {
    if (!tests.length) {
      setFilteredTests([]);
      return;
    }

    let result = [...tests];
    
    // Apply search term
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(test => 
        (test.title?.toLowerCase().includes(lowercasedTerm) || 
         test.description?.toLowerCase().includes(lowercasedTerm) ||
         test.subject?.toLowerCase().includes(lowercasedTerm))
      );
    }
    
    // Apply subject filter
    if (filterSubject !== "all") {
      result = result.filter(test => test.subject?.toLowerCase() === filterSubject.toLowerCase());
    }
    
    // Apply sorting
    result.sort((a, b) => {
      // Handle null values first
      if (!a[sortKey] && !b[sortKey]) return 0;
      if (!a[sortKey]) return 1;
      if (!b[sortKey]) return -1;
      
      // Compare values
      const compareA = a[sortKey].toString().toLowerCase();
      const compareB = b[sortKey].toString().toLowerCase();
      
      if (sortDirection === "asc") {
        return compareA.localeCompare(compareB);
      } else {
        return compareB.localeCompare(compareA);
      }
    });
    
    setFilteredTests(result);
  }, [tests, searchTerm, filterSubject, sortKey, sortDirection]);

  // Extract unique subjects for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(tests.map(test => test.subject).filter(Boolean));
    return ["all", ...Array.from(subjects)];
  }, [tests]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleStartTest = useCallback((testId) => {
    if (!testId) {
      toast.error("Invalid test selection");
      return;
    }
    
    // Provide visual feedback before navigation
    setLoading(true);
    setTimeout(() => {
      navigate(`/tests/${testId}`);
    }, 300);
  }, [navigate]);

  const toggleManagement = useCallback(() => {
    setShowManagement(prev => !prev);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSortChange = useCallback((key) => {
    setSortKey(key);
    setSortDirection(current => current === "asc" ? "desc" : "asc");
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilterSubject(e.target.value);
  }, []);

  // Loading state with skeleton loaders
  if (loading && !filteredTests.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header - kept consistent with the main view */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 pt-24 pb-12 rounded-b-[40px] shadow-xl">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-white/10 p-3 rounded-2xl mr-4">
                  <FaClipboardList className="text-white h-8 w-8" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Tests</h1>
                  <p className="text-blue-100 mt-1">Manage and take tests</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Available Tests
                </h2>
                <p className="text-gray-600 mt-1">
                  Loading tests...
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <TestCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="bg-red-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-red-500 text-3xl">⚠️</span>
          </div>
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button 
            onClick={fetchTests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors duration-200 font-medium"
            aria-label="Retry loading tests"
          >
            <span className="flex items-center gap-2 justify-center">
              <FaRedo className="w-4 h-4" aria-hidden="true" /> 
              Retry
            </span>
          </button>
        </div>
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
                <FaClipboardList className="text-white h-8 w-8" aria-hidden="true" />
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
                aria-expanded={showManagement}
                aria-controls="management-panel"
              >
                <FaCog 
                  className={`h-5 w-5 transition-transform duration-300 ${showManagement ? 'rotate-90' : ''}`} 
                  aria-hidden="true"
                />
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
          {/* Admin Management Section */}
          {isAdmin && showManagement && (
            <div id="management-panel" className="mb-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Quiz Management
                </h2>
              </div>
              <div className="p-8">
                <Suspense fallback={
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading management tools...</p>
                  </div>
                }>
                  <ManageTests onTestsUpdated={fetchTests} />
                </Suspense>
              </div>
            </div>
          )}

          {/* Tests Display Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Available Tests
              </h2>
              <p className="text-gray-600 mt-1">
                Select a test to begin your assessment
              </p>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    aria-label="Search tests"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <select 
                      value={filterSubject} 
                      onChange={handleFilterChange}
                      className="appearance-none pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      aria-label="Filter by subject"
                    >
                      <option value="all">All Subjects</option>
                      {uniqueSubjects
                        .filter(subject => subject !== "all")
                        .map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))
                      }
                    </select>
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  </div>
                  
                  <button 
                    onClick={() => handleSortChange("title")}
                    className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                      sortKey === "title" 
                        ? "bg-blue-50 border-blue-200 text-blue-600" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    aria-pressed={sortKey === "title"}
                    aria-label="Sort by title"
                  >
                    <FaSortAmountDown className={`h-4 w-4 transition-transform ${
                      sortKey === "title" && sortDirection === "desc" ? "transform rotate-180" : ""
                    }`} aria-hidden="true" /> 
                    Title
                  </button>
                  
                  <button 
                    onClick={() => handleSortChange("availableUntil")}
                    className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                      sortKey === "availableUntil" 
                        ? "bg-blue-50 border-blue-200 text-blue-600" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    aria-pressed={sortKey === "availableUntil"}
                    aria-label="Sort by date"
                  >
                    <FaSortAmountDown className={`h-4 w-4 transition-transform ${
                      sortKey === "availableUntil" && sortDirection === "desc" ? "transform rotate-180" : ""
                    }`} aria-hidden="true" /> 
                    Date
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <TestCard 
                      key={test._id} 
                      test={test} 
                      onStartTest={handleStartTest} 
                    />
                  ))
                ) : (
                  <EmptyState 
                    onRetry={searchTerm || filterSubject !== "all" ? null : fetchTests}
                  />
                )}
              </div>
              
              {/* No results state when filtering */}
              {searchTerm && filteredTests.length === 0 && tests.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No tests matching "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    aria-label="Clear search"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tests;