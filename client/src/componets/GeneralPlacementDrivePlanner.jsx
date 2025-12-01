import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  Users,
  Search,
  Filter,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const GeneralPlacementDrivePlanner = ({ isOpen, onClose }) => {
  const [plannerMonth, setPlannerMonth] = useState(new Date());
  const [selectedPlannerDate, setSelectedPlannerDate] = useState(null);
  const [plannerDrives, setPlannerDrives] = useState([]);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // date, company, rounds

  useEffect(() => {
    if (isOpen) {
      fetchAllPlacementDrives();
    }
  }, [isOpen, statusFilter]);

  useEffect(() => {
    console.log("Planner drives updated:", plannerDrives);
    console.log("Total drives:", plannerDrives.length);
  }, [plannerDrives]);

  const fetchAllPlacementDrives = async () => {
    try {
      setPlannerLoading(true);
      setPlannerError("");
      
      // Use student endpoint to fetch all placement drives
      const response = await axiosInstance.get("/placement-drive/student/list", {
        params: {
          limit: 500,
        },
      });

      let drives = response.data?.data || [];
      
      console.log("Fetched drives:", drives, "Total count:", drives.length);
      
      // Apply status filter only if user selected a specific status (not "all")
      if (statusFilter !== "all") {
        drives = drives.filter((drive) => drive.status === statusFilter);
        console.log("Filtered by status:", statusFilter, "Remaining:", drives.length);
      }

      // Log drive dates for debugging
      drives.forEach(drive => {
        console.log(`Drive: ${drive.title}, Start: ${new Date(drive.startDate)}, End: ${new Date(drive.endDate)}, Status: ${drive.status}`);
      });

      setPlannerDrives(drives);
    } catch (error) {
      console.error("Error fetching placement drives:", error?.response || error);
      setPlannerError(
        error?.response?.data?.message ||
        "Failed to load placement drives. Please try again later."
      );
    } finally {
      setPlannerLoading(false);
    }
  };

  if (!isOpen) return null;

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

  const startWeekday = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const daysArray = [];
  for (let i = 0; i < startWeekday; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(new Date(plannerMonth.getFullYear(), plannerMonth.getMonth(), d));
  }

  const normalizeDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    // Create a date at midnight in the local timezone
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };

  const getDrivesForDate = (date) => {
    if (!date) return [];
    const target = normalizeDate(date);
    console.log("Looking for drives on:", new Date(target)); // Debug
    
    return plannerDrives.filter((drive) => {
      if (!drive.startDate || !drive.endDate) {
        console.log("Drive missing dates:", drive.title);
        return false;
      }
      
      const startNorm = normalizeDate(drive.startDate);
      const endNorm = normalizeDate(drive.endDate);
      
      console.log(`Checking drive "${drive.title}": ${new Date(startNorm)} to ${new Date(endNorm)} against ${new Date(target)}`);
      
      const isInRange = target >= startNorm && target <= endNorm;
      if (isInRange) {
        console.log(`✓ Drive "${drive.title}" matches!`);
      }
      return isInRange;
    });
  };

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

  const filteredDrives = plannerDrives.filter((drive) => {
    const companyName = drive.company?.name || "";
    const matchesSearch =
      searchCompany === "" ||
      companyName.toLowerCase().includes(searchCompany.toLowerCase());
    return matchesSearch;
  });

  const selectedDateDrives = selectedPlannerDate
    ? getDrivesForDate(selectedPlannerDate).filter((drive) => {
        const companyName = drive.company?.name || "";
        const matchesSearch =
          searchCompany === "" ||
          companyName.toLowerCase().includes(searchCompany.toLowerCase());
        return matchesSearch;
      })
    : [];

  const getSortedDrives = (drives) => {
    if (sortBy === "company") {
      return [...drives].sort((a, b) =>
        (a.company?.name || "").localeCompare(b.company?.name || "")
      );
    } else if (sortBy === "rounds") {
      return [...drives].sort((a, b) => (b.totalRounds || 1) - (a.totalRounds || 1));
    }
    // date is default
    return [...drives].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  };

  const displayDrives = selectedPlannerDate
    ? getSortedDrives(selectedDateDrives)
    : getSortedDrives(
        selectedPlannerDate ? selectedDateDrives : filteredDrives
      );

  const uniqueCompanies = [...new Set(plannerDrives.map((d) => d.company?.name))].filter(
    Boolean
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              All Companies Placement Drive Planner
            </h2>
            <p className="text-xs text-emerald-100 mt-2">
              View all placement drives scheduled across all companies in one calendar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-6">
          {/* Left: Calendar */}
          <div className="w-full lg:w-1/3 border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col">
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

            <div className="grid grid-cols-7 gap-1 text-xs flex-1 mb-4">
              {daysArray.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="h-10" />;
                }

                const drivesOnThisDay = getDrivesForDate(date);
                if (drivesOnThisDay.length > 0) {
                  console.log(`Date ${date.toLocaleDateString()} has ${drivesOnThisDay.length} drives`);
                }
                
                const isToday =
                  normalizeDate(date) === normalizeDate(new Date());
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
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : drivesOnThisDay.length > 0
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    } ${isToday && !isSelected ? "ring-1 ring-emerald-400" : ""}`}
                  >
                    <span>{date.getDate()}</span>
                    {drivesOnThisDay.length > 0 && (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-xs text-gray-600 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Drive scheduled
                  </span>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">{plannerDrives.length}</span> Total Drives
                  </p>
                  <p>
                    <span className="font-semibold">{uniqueCompanies}</span> Companies
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Drive List & Filters */}
          <div className="w-full lg:w-2/3 border border-gray-200 rounded-xl p-4 bg-white flex flex-col overflow-hidden">
            {/* Filters */}
            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by company name..."
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      // Re-fetch with new status filter
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="company">Sort by Company</option>
                  <option value="rounds">Sort by Rounds</option>
                </select>
              </div>
            </div>

            {/* Drives List */}
            <div className="flex-1 overflow-y-auto">
              {plannerLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                  <div className="animate-spin">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="ml-2">Loading placement drives...</span>
                </div>
              ) : plannerError ? (
                <div className="flex items-center justify-center h-32 text-red-500 text-sm text-center px-4">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {plannerError}
                </div>
              ) : displayDrives.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
                  <Briefcase className="w-10 h-10 text-gray-300 mb-2" />
                  {selectedPlannerDate
                    ? `No drives scheduled on ${selectedPlannerDate.toLocaleDateString()}`
                    : "No placement drives found"}
                </div>
              ) : (
                <div className="space-y-3 pr-2">
                  {displayDrives.map((drive) => (
                    <div
                      key={drive._id}
                      className="border border-gray-200 rounded-lg p-4 text-xs bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            {drive.company?.name || "Unknown Company"}
                          </div>
                          <div className="text-gray-700 font-medium mt-1">
                            {drive.title}
                          </div>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 capitalize flex-shrink-0">
                          {drive.status}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {drive.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600 mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          {new Date(drive.startDate).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          to {new Date(drive.endDate).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-600" />
                          {drive.totalRounds || 1} round(s)
                        </span>
                      </div>

                      {drive.company?.domain && (
                        <p className="text-[10px] text-gray-500">
                          Domain: <span className="font-medium">{drive.company.domain}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Info */}
            {selectedPlannerDate && !plannerLoading && displayDrives.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                Showing <span className="font-semibold">{displayDrives.length}</span> drive(s) for{" "}
                <span className="font-semibold">
                  {selectedPlannerDate.toLocaleDateString()}
                </span>
                {searchCompany && (
                  <>
                    {" "}
                    with company name containing{" "}
                    <span className="font-semibold">"{searchCompany}"</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralPlacementDrivePlanner;
