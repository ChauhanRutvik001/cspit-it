import React, { useState, useEffect, useMemo, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import GeneralPlacementDrivePlanner from "./GeneralPlacementDrivePlanner";
import {
  X,
  Globe,
  Linkedin,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FileDown,
  Building2,
  Briefcase,
  DollarSign,
  Users,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Mail,
  Phone,
  PlusCircle,
  Award,
  AlertCircle,
  UserCheck,
  UserX,
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
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [studentProgress, setStudentProgress] = useState([]);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [plannerCompany, setPlannerCompany] = useState(null);
  const [plannerDrives, setPlannerDrives] = useState([]);
  const [plannerMonth, setPlannerMonth] = useState(() => new Date());
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState("");
  const [selectedPlannerDate, setSelectedPlannerDate] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [sectionPagination, setSectionPagination] = useState({
    placed: { page: 1, limit: 6 },
    pending: { page: 1, limit: 6 },
    approved: { page: 1, limit: 6 },
    rejected: { page: 1, limit: 6 },
    available: { page: 1, limit: 12 }
  });
  const [expandedSections, setExpandedSections] = useState({
    placed: true,
    pending: true,
    approved: true,
    rejected: false, // Start collapsed for less important sections
    available: true
  });
  const [showGeneralPlanner, setShowGeneralPlanner] = useState(false);
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

      // Check if user is placed in any company (even without direct application)
      if (user?.isPlaced && user?.placedCompany) {
        applicationMap[user.placedCompany] = "placed";
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

  // Generate search suggestions with priority order
  const generateSuggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 1) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const companySuggestions = [];
    const domainSuggestions = [];
    const locationSuggestions = [];
    
    companies.forEach(company => {
      if (!company) return;
      
      // Company name suggestions - prioritize companies that START with the search term
      if (company.name?.toLowerCase().startsWith(searchLower)) {
        companySuggestions.unshift({
          type: 'company',
          value: company.name,
          label: company.name,
          icon: Building2,
          category: 'Companies',
          priority: 1 // Highest priority for exact start matches
        });
      } else if (company.name?.toLowerCase().includes(searchLower)) {
        companySuggestions.push({
          type: 'company',
          value: company.name,
          label: company.name,
          icon: Building2,
          category: 'Companies',
          priority: 2 // Lower priority for contains matches
        });
      }
      
      // Domain suggestions
      if (company.domain?.toLowerCase().startsWith(searchLower)) {
        domainSuggestions.unshift({
          type: 'domain',
          value: company.domain,
          label: company.domain,
          icon: Briefcase,
          category: 'Domains',
          priority: 1
        });
      } else if (company.domain?.toLowerCase().includes(searchLower)) {
        domainSuggestions.push({
          type: 'domain',
          value: company.domain,
          label: company.domain,
          icon: Briefcase,
          category: 'Domains',
          priority: 2
        });
      }
      
      // Location suggestions
      if (company.location?.toLowerCase().startsWith(searchLower)) {
        locationSuggestions.unshift({
          type: 'location',
          value: company.location,
          label: company.location,
          icon: MapPin,
          category: 'Locations',
          priority: 1
        });
      } else if (company.location?.toLowerCase().includes(searchLower)) {
        locationSuggestions.push({
          type: 'location',
          value: company.location,
          label: company.location,
          icon: MapPin,
          category: 'Locations',
          priority: 2
        });
      }
    });
    
    // Remove duplicates using Set with custom key
    const uniqueCompanies = Array.from(
      new Map(companySuggestions.map(item => [item.value.toLowerCase(), item])).values()
    );
    const uniqueDomains = Array.from(
      new Map(domainSuggestions.map(item => [item.value.toLowerCase(), item])).values()
    );
    const uniqueLocations = Array.from(
      new Map(locationSuggestions.map(item => [item.value.toLowerCase(), item])).values()
    );
    
    // Combine in priority order: Companies (starting with) -> Companies (containing) -> Domains -> Locations
    const allSuggestions = [
      ...uniqueCompanies.slice(0, 4), // Top 4 companies
      ...uniqueDomains.slice(0, 2),   // Top 2 domains
      ...uniqueLocations.slice(0, 2)  // Top 2 locations
    ];
    
    return allSuggestions.slice(0, 8); // Limit to 8 suggestions total
  }, [companies, searchTerm]);

  // Update suggestions when search term changes
  useEffect(() => {
    setSearchSuggestions(generateSuggestions);
    setSelectedSuggestionIndex(-1);
  }, [generateSuggestions]);

  // Handle search input changes
  const handleSearch = useCallback((e) => {
    const value = e?.target?.value || "";
    setSearchTerm(value);
    setShowSuggestions(value.trim().length > 0);
    setCurrentPage(1);
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchTerm(suggestion.value);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, []);

  // Handle keyboard navigation for suggestions
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(searchSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, searchSuggestions, selectedSuggestionIndex, handleSuggestionSelect]);

  const handleLimitChange = (e) => {
    const value = Number(e?.target?.value);
    setRecordsPerPage(isNaN(value) ? 10 : value);
    setCurrentPage(1);
  };

  // Memoized filtered companies for performance
  const filteredCompanies = useMemo(() => {
    if (!Array.isArray(companies)) return [];
    
    if (!searchTerm.trim()) return companies;
    
    const searchLower = searchTerm.toLowerCase();
    return companies.filter((company) => {
      if (!company) return false;
      
      return (
        company.name?.toLowerCase().includes(searchLower) ||
        company.domain?.toLowerCase().includes(searchLower) ||
        company.location?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [companies, searchTerm]);

  // Legacy pagination for admin/counsellor view
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

  const handleViewCompanyDetails = async (company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
    
    // Fetch student progress for this company if user is a student
    if (user?.role === "student" && user?._id) {
      await fetchStudentProgress(company._id);
    }
  };

  const fetchStudentProgress = async (companyId) => {
    try {
      setProgressLoading(true);
      const response = await axiosInstance.get(`/placement-round/student/${user._id}/company/${companyId}`);
      setStudentProgress(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      setStudentProgress([]);
    } finally {
      setProgressLoading(false);
    }
  };

  const closeCompanyModal = () => {
    setShowCompanyModal(false);
    setSelectedCompany(null);
    setStudentProgress([]);
  };

  const openPlannerForCompany = async (company) => {
    if (!company?._id) return;

    setPlannerCompany(company);
    setShowPlannerModal(true);
    setPlannerMonth(new Date());
    setSelectedPlannerDate(null);
    setPlannerError("");
    setPlannerDrives([]);

    try {
      setPlannerLoading(true);
      const response = await axiosInstance.get(`/placement-drive/company/${company._id}`);
      setPlannerDrives(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching placement drives for planner:", error?.response || error);
      setPlannerError(
        error?.response?.data?.message ||
        "Failed to load placement drives for this company."
      );
      setPlannerDrives([]);
    } finally {
      setPlannerLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      shortlisted: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      selected: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      placed: { bg: "bg-purple-100", text: "text-purple-800", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      active: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
    };
    
    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: Clock };
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewApplications = (companyId) => {
    if (companyId) {
      navigate(`/admin/applications/${companyId}`);
    } else {
      toast.error("Invalid company ID");
    }
  };

  // Memoized company categorization for performance
  const companiesByStatus = useMemo(() => {
    const placed = [];
    const pending = [];
    const approved = [];
    const rejected = [];
    const available = [];

    filteredCompanies.forEach(company => {
      if (!company?._id) return;
      
      const status = applications[company._id];
      switch (status) {
        case "placed":
          placed.push(company);
          break;
        case "pending":
          pending.push(company);
          break;
        case "approved":
          approved.push(company);
          break;
        case "rejected":
          rejected.push(company);
          break;
        default:
          available.push(company);
      }
    });

    return { placed, pending, approved, rejected, available };
  }, [filteredCompanies, applications]);

  // Pagination calculations for each section
  const getSectionData = useCallback((sectionKey) => {
    const companies = companiesByStatus[sectionKey] || [];
    const pagination = sectionPagination[sectionKey];
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    
    return {
      companies: companies.slice(startIndex, endIndex),
      totalCompanies: companies.length,
      totalPages: Math.ceil(companies.length / pagination.limit),
      currentPage: pagination.page,
      hasMore: endIndex < companies.length
    };
  }, [companiesByStatus, sectionPagination]);

  // Handle section pagination
  const handleSectionPagination = useCallback((section, action) => {
    setSectionPagination(prev => {
      const current = prev[section];
      let newPage = current.page;
      
      if (action === 'next') {
        const maxPage = Math.ceil(companiesByStatus[section]?.length / current.limit) || 1;
        newPage = Math.min(current.page + 1, maxPage);
      } else if (action === 'prev') {
        newPage = Math.max(current.page - 1, 1);
      } else if (action === 'loadMore') {
        // For "Load More" functionality, increase the limit
        return {
          ...prev,
          [section]: {
            ...current,
            limit: current.limit + (section === 'available' ? 12 : 6)
          }
        };
      }
      
      return {
        ...prev,
        [section]: { ...current, page: newPage }
      };
    });
  }, [companiesByStatus]);

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Filter companies by status for sections (kept for backward compatibility but optimized)
  const getCompaniesByStatus = useCallback((status) => {
    return companiesByStatus[status] || [];
  }, [companiesByStatus]);

  const getCompaniesWithoutApplication = useCallback(() => {
    return companiesByStatus.available || [];
  }, [companiesByStatus]);

  const placedCompanies = getCompaniesByStatus("placed");
  const pendingCompanies = getCompaniesByStatus("pending");
  const approvedCompanies = getCompaniesByStatus("approved");
  const rejectedCompanies = getCompaniesByStatus("rejected");
  const availableCompanies = getCompaniesWithoutApplication();

  // Optimized CompanySection with lazy loading and pagination
  const CompanySection = React.memo(({ 
    title, 
    sectionKey, 
    sectionColor, 
    icon: Icon, 
    isSpecial = false 
  }) => {
    const sectionData = getSectionData(sectionKey);
    const isExpanded = expandedSections[sectionKey];
    
    if (sectionData.totalCompanies === 0) return null;
    
    return (
      <div className={`mb-8 ${isSpecial ? 'order-first' : ''}`}>
        <div 
          className={`flex items-center justify-between mb-4 cursor-pointer ${
            isSpecial 
              ? 'bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200' 
              : 'p-2 hover:bg-gray-50 rounded-lg'
          }`}
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center">
            {Icon && <Icon className={`h-6 w-6 mr-3 ${sectionColor}`} />}
            <h2 className={`text-xl font-bold ${isSpecial ? 'text-purple-800' : 'text-gray-800'}`}>
              {title} ({sectionData.totalCompanies})
            </h2>
            {isSpecial && (
              <div className="ml-3">
                <span className="text-2xl animate-bounce">🎉</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Show pagination info */}
            {sectionData.totalCompanies > sectionPagination[sectionKey].limit && (
              <span className="text-sm text-gray-500">
                Showing {Math.min(sectionData.companies.length, sectionData.totalCompanies)} of {sectionData.totalCompanies}
              </span>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Collapsible Content */}
        {isExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionData.companies.map((company, index) => (
                <CompanyCard 
                  key={`${company._id}-${index}`} 
                  company={company} 
                  priority={isSpecial ? 'high' : 'normal'}
                  onOpenPlanner={openPlannerForCompany}
                />
              ))}
            </div>
            
            {/* Load More / Pagination Controls */}
            {sectionData.totalCompanies > sectionData.companies.length && (
              <div className="flex justify-center items-center space-x-4 pt-4">
                <button
                  onClick={() => handleSectionPagination(sectionKey, 'loadMore')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Load More ({sectionData.totalCompanies - sectionData.companies.length} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  });

  // Optimized CompanyCard with lazy loading and memoization
  const CompanyCard = React.memo(({ company, priority = 'normal', onOpenPlanner }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority === 'high'); // Load immediately for special sections
    
    // Intersection Observer for lazy loading
    const cardRef = useCallback(node => {
      if (node && !isInView) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          },
          { threshold: 0.1, rootMargin: '50px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
      }
    }, [isInView]);
    
    if (!isInView && priority !== 'high') {
      return (
        <div 
          ref={cardRef}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-96 flex items-center justify-center"
        >
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      );
    }
    
    return (
      <div 
        ref={cardRef}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {company.name}
                </h3>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {company.location || "Location not specified"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
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
            <div className="text-sm text-gray-900 max-w-md break-words whitespace-normal line-clamp-3">
              {company?.description ? (
                company.description
              ) : (
                "No description available"
              )}
            </div>
          </div>
          <div className="pt-4 mt-auto border-t border-gray-100 space-y-3">
            {/* Planner Button */}
            <button
              onClick={() => onOpenPlanner && onOpenPlanner(company)}
              className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center text-sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Drive Planner
            </button>

            {/* View Details Button */}
            <button
              onClick={() => handleViewCompanyDetails(company)}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </button>
            
            {/* Application Status */}
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
                ) : applications[company._id] === "placed" ? (
                  <span className="bg-gradient-to-r from-purple-50 to-violet-50 text-purple-800 px-4 py-2 rounded-lg flex items-center w-full justify-center font-semibold border border-purple-200 shadow-md">
                    <div className="mr-2 h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                    🎉 Placed in {company.name}
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
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  });

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
        <div className="mx-auto">
          <div className="bg-white shadow-xl  rounded-2xl overflow-hidden backdrop-blur-sm backdrop-filter">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
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
          </div>
        </div>
      </div>
    );
  }

  // Company Detail Modal Component
  const CompanyDetailModal = () => {
    if (!showCompanyModal || !selectedCompany) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedCompany.name}</h2>
                <p className="text-indigo-100 mt-1">{selectedCompany.domain}</p>
              </div>
              <button
                onClick={closeCompanyModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                  Company Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 mt-1">{selectedCompany.description || "No description available"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Domain</label>
                      <p className="text-gray-900 mt-1">{selectedCompany.domain}</p>
                    </div>
                    {selectedCompany.salary && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Salary Range</label>
                        <p className="text-gray-900 mt-1 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {selectedCompany.salary.min ? 
                            `₹${selectedCompany.salary.min}L - ₹${selectedCompany.salary.max}L` : 
                            "Not specified"
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4">
                    {selectedCompany.website && (
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    )}
                    {selectedCompany.linkedin && (
                      <a
                        href={selectedCompany.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                  Application Status
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  {applications[selectedCompany._id] ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Current Status:</span>
                      {getStatusBadge(applications[selectedCompany._id])}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">You haven't applied to this company yet.</p>
                      <button
                        onClick={() => handleApply(selectedCompany._id)}
                        disabled={loading === selectedCompany._id}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-indigo-400"
                      >
                        {loading === selectedCompany._id ? "Applying..." : "Apply Now"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Progress */}
            {user?.role === "student" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  My Progress
                </h3>

                {progressLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : studentProgress.length > 0 ? (
                  <div className="space-y-3">
                    {studentProgress.map((round, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {round.roundNumber}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{round.roundName}</h4>
                              <p className="text-sm text-gray-500">{round.roundType}</p>
                            </div>
                          </div>
                          {getStatusBadge(round.status)}
                        </div>
                        
                        {round.scheduledDate && (
                          <div className="flex items-center text-sm text-gray-600 mt-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(round.scheduledDate).toLocaleDateString()} at {round.scheduledTime}
                          </div>
                        )}
                        
                        {round.marks !== undefined && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Score: </span>
                            <span className="font-medium text-gray-900">
                              {round.marks}/{round.maxMarks || 100}
                            </span>
                          </div>
                        )}
                        
                        {round.feedback && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Feedback:</p>
                            <p className="text-sm text-gray-900 mt-1">{round.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No progress information available</p>
                    <p className="text-sm">Apply to this company to see your progress</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Company Drive Planner Modal
  const CompanyDrivePlannerModal = () => {
    if (!showPlannerModal || !plannerCompany) return null;

    const monthYearLabel = plannerMonth.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });

    const startOfMonth = new Date(
      plannerMonth.getFullYear(),
      plannerMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      plannerMonth.getFullYear(),
      plannerMonth.getMonth() + 1,
      0
    );

    const startWeekday = startOfMonth.getDay(); // 0-6
    const daysInMonth = endOfMonth.getDate();

    const daysArray = [];
    for (let i = 0; i < startWeekday; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      daysArray.push(new Date(plannerMonth.getFullYear(), plannerMonth.getMonth(), d));
    }

    const normalizeDate = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    const getDrivesForDate = (date) => {
      if (!date) return [];
      const target = normalizeDate(date);
      return plannerDrives.filter((drive) => {
        if (!drive.startDate || !drive.endDate) return false;
        const start = new Date(drive.startDate);
        const end = new Date(drive.endDate);
        const startNorm = normalizeDate(start);
        const endNorm = normalizeDate(end);
        return target >= startNorm && target <= endNorm;
      });
    };

    const selectedDateDrives = selectedPlannerDate
      ? getDrivesForDate(selectedPlannerDate)
      : [];

    const changeMonth = (direction) => {
      const delta = direction === "prev" ? -1 : 1;
      const newMonth = new Date(
        plannerMonth.getFullYear(),
        plannerMonth.getMonth() + delta,
        1
      );
      setPlannerMonth(newMonth);
      setSelectedPlannerDate(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Drive Planner - {plannerCompany.name}
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                See when this company&apos;s placement drives are scheduled.
              </p>
            </div>
            <button
              onClick={() => {
                setShowPlannerModal(false);
                setPlannerCompany(null);
                setPlannerDrives([]);
                setSelectedPlannerDate(null);
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeMonth("prev")}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div className="text-sm font-semibold text-gray-800">
                  {monthYearLabel}
                </div>
                <button
                  onClick={() => changeMonth("next")}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-gray-500 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs">
                {daysArray.map((date, idx) => {
                  if (!date) {
                    return <div key={idx} className="h-10" />;
                  }

                  const drivesOnThisDay = getDrivesForDate(date);
                  const isToday =
                    normalizeDate(date) ===
                    normalizeDate(new Date());
                  const isSelected =
                    selectedPlannerDate &&
                    normalizeDate(selectedPlannerDate) === normalizeDate(date);

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        setSelectedPlannerDate(
                          selectedPlannerDate &&
                            normalizeDate(selectedPlannerDate) === normalizeDate(date)
                            ? null
                            : date
                        )
                      }
                      className={`h-10 rounded-lg flex flex-col items-center justify-center border text-[11px] transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : drivesOnThisDay.length > 0
                          ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      } ${isToday && !isSelected ? "ring-1 ring-blue-400" : ""}`}
                    >
                      <span>{date.getDate()}</span>
                      {drivesOnThisDay.length > 0 && (
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Drive day
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    No drive
                  </span>
                </div>
                <span>
                  Total drives: {plannerDrives?.length || 0}
                </span>
              </div>
            </div>

            {/* Drive list / details */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                {plannerCompany.name} - Drives
              </h3>

              {plannerLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  Loading drives...
                </div>
              ) : plannerError ? (
                <div className="flex-1 flex items-center justify-center text-red-500 text-sm text-center px-4">
                  {plannerError}
                </div>
              ) : plannerDrives.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm">
                  <Calendar className="w-10 h-10 text-gray-300 mb-2" />
                  No placement drives found for this company yet.
                </div>
              ) : selectedPlannerDate && selectedDateDrives.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm text-center px-4">
                  <Calendar className="w-8 h-8 text-gray-300 mb-1" />
                  No drives scheduled on{" "}
                  {selectedPlannerDate.toLocaleDateString()}.
                  <span className="block text-xs mt-1">
                    Try selecting a different date with a blue dot.
                  </span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(selectedPlannerDate ? selectedDateDrives : plannerDrives).map(
                    (drive) => (
                      <div
                        key={drive._id}
                        className="border border-gray-200 rounded-lg p-3 text-xs bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="font-semibold text-gray-900">
                            {drive.title}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                            {drive.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1 line-clamp-2">
                          {drive.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(drive.startDate).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(drive.endDate).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {drive.totalRounds || 1} round(s)
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {selectedPlannerDate && !plannerLoading && plannerDrives.length > 0 && (
                <p className="mt-2 text-[11px] text-gray-500">
                  Showing drives for{" "}
                  <span className="font-medium">
                    {selectedPlannerDate.toLocaleDateString()}
                  </span>
                  . Click again on the date to reset and see all drives.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Student View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="container mx-auto">
        <div className="bg-white my-16 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm backdrop-filter">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-bold">Available Companies</h2>
                <p className="mt-1 text-indigo-100">
                  Explore and apply to companies
                </p>
              </div>
              {user?.role === 'student' && (
                <button
                  onClick={() => setShowGeneralPlanner(true)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center gap-2 text-white font-medium whitespace-nowrap"
                >
                  <Calendar className="w-5 h-5" />
                  View All Drives Calendar
                </button>
              )}
            </div>
            <div className="relative w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search companies, domains, locations..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(searchTerm.trim().length > 0)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/60 text-white"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-2">
                        Search Suggestions
                      </div>
                      {searchSuggestions.map((suggestion, index) => {
                        const IconComponent = suggestion.icon;
                        // Highlight matching text
                        const highlightText = (text, searchTerm) => {
                          if (!searchTerm) return text;
                          const regex = new RegExp(`(${searchTerm})`, 'gi');
                          const parts = text.split(regex);
                          return parts.map((part, i) => 
                            regex.test(part) ? 
                              <span key={i} className="font-semibold text-indigo-600">{part}</span> : 
                              part
                          );
                        };
                        
                        return (
                          <button
                            key={`${suggestion.type}-${suggestion.value}-${index}`}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                              index === selectedSuggestionIndex
                                ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                                : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                            }`}
                          >
                            <IconComponent className={`h-4 w-4 mr-3 ${
                              index === selectedSuggestionIndex ? 'text-indigo-500' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="font-medium">
                                {highlightText(suggestion.label, searchTerm)}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                {suggestion.category}
                                {suggestion.priority === 1 && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                    Exact match
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Placement Drives Section for Students */}
          {user?.role === 'student' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">My Placement Progress</h3>
                      <p className="text-sm text-gray-600">Track your progress in placement drives</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/placement-drives')}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>View Progress</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Check your placement drive progress, round status, and selection results
                </div>
              </div>
            </div>
          )}

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
            <div className="p-6 space-y-8">
              {/* Congratulations Section for Placed Students */}
              <CompanySection 
                title="🎉 Congratulations! You're Placed"
                sectionKey="placed"
                sectionColor="text-purple-600"
                icon={Award}
                isSpecial={true}
              />

              {/* Pending Applications */}
              <CompanySection 
                title="⏳ Pending Approval"
                sectionKey="pending"
                sectionColor="text-yellow-600"
                icon={Clock}
              />

              {/* Approved Applications */}
              <CompanySection 
                title="✅ Approved Applications"
                sectionKey="approved"
                sectionColor="text-green-600"
                icon={UserCheck}
              />

              {/* Rejected Applications */}
              <CompanySection 
                title="❌ Rejected Applications"
                sectionKey="rejected"
                sectionColor="text-red-600"
                icon={UserX}
              />

              {/* Available Companies to Apply */}
              <CompanySection 
                title="🚀 Available Companies"
                sectionKey="available"
                sectionColor="text-blue-600"
                icon={Building2}
              />

              {/* Show message if no companies in any section */}
              {filteredCompanies.length === 0 && (
                <div className="text-center py-16">
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or check back later for new opportunities.</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Performance Stats (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p><strong>Performance Stats:</strong></p>
                  <p>Total Companies: {companies.length}</p>
                  <p>Filtered Companies: {filteredCompanies.length}</p>
                  <p>Placed: {companiesByStatus.placed?.length || 0}</p>
                  <p>Pending: {companiesByStatus.pending?.length || 0}</p>
                  <p>Approved: {companiesByStatus.approved?.length || 0}</p>
                  <p>Rejected: {companiesByStatus.rejected?.length || 0}</p>
                  <p>Available: {companiesByStatus.available?.length || 0}</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-700">
                <span className="font-medium">
                  Total Companies: {filteredCompanies.length}
                </span>
              </div>
            </div>
          </div>
        {/* Company Detail Modal */}
        <CompanyDetailModal />
        <CompanyDrivePlannerModal />
        
        {/* General Placement Drive Planner Modal */}
        <GeneralPlacementDrivePlanner 
          isOpen={showGeneralPlanner}
          onClose={() => setShowGeneralPlanner(false)}
        />
      </div>
    </div>
  );
};

export default Company;
