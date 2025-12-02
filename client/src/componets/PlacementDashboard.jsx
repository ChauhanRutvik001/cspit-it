import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Scatter, ScatterChart, ZAxis, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  ChevronDown, TrendingUp, Users, Briefcase, Building2, Search, 
  Award, Target, Calendar, Star, Eye, X, Filter
} from 'lucide-react';

// Import placement data from JSON files
import placement_2019 from '../data/placement_2019.json';
import placement_2020 from '../data/placement_2020.json';
import placement_2021 from '../data/placement_2021.json';
import placement_2022 from '../data/placement_2022.json';
import placement_2023 from '../data/placement_2023.json';
import placement_2024 from '../data/placement_2024.json';
import placement_2025 from '../data/placement_2025.json';
// Import 2025 student data
import studentData2025 from '../data/2025_student_data.json';

// Data for charts (exclude 2025)
const chartPlacementData = [
  placement_2019,
  placement_2020,
  placement_2021,
  placement_2022,
  placement_2023,
  placement_2024,
];

// Data for tables and search (include 2025)
const allPlacementData = [
  placement_2019,
  placement_2020,
  placement_2021,
  placement_2022,
  placement_2023,
  placement_2024,
  placement_2025
];

const chartColors = {
  primary: '#2563eb',
  secondary: '#7c3aed', 
  accent: '#0891b2',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  purple: '#8b5cf6',
  violet: '#7c3aed',
  pink: '#ec4899',
  roseGold: '#f59e0b',
  indigo: '#6366f1',
  blue: '#3b82f6',
  orange: '#ea580c',
  green: '#16a34a',
  gradient1: 'url(#gradient1)',
  gradient2: 'url(#gradient2)',
  gradient3: 'url(#gradient3)'
};

const COLORS = [
  '#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#8b5cf6', '#ec4899', '#f59e0b', '#6366f1', '#3b82f6', '#16a34a'
];

// Enhanced Summary Card Component
const SummaryCard = ({ title, value, subtitle, icon, color, trend, action }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-3xl p-6 shadow-2xl hover:scale-105 transform transition-all duration-300 border border-white/10`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'transform rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium text-white/90 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-sm text-white/70 mb-3">{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 backdrop-blur-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  </div>
);

// Enhanced Company Card Component
const CompanyCard = ({ company, totalOffers, years, onClick, rank }) => (
  <div 
    className="group relative bg-white border border-gray-300 rounded-2xl p-5 cursor-pointer hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    onClick={() => onClick(company)}
  >
    {rank && rank <= 3 && (
      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        rank === 1 ? 'bg-yellow-500 text-white' : rank === 2 ? 'bg-gray-400 text-white' : 'bg-amber-600 text-white'
      }`}>
        {rank}
      </div>
    )}
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{company}</h4>
      <Award className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Alumni Placed:</span>
        <span className="text-gray-900 font-semibold">{totalOffers}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Active Years:</span>
        <span className="text-gray-900 font-semibold">{years}</span>
      </div>

    </div>
    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
        style={{ width: `${Math.min((totalOffers / 50) * 100, 100)}%` }}
      ></div>
    </div>
  </div>
);

// Animated Stat Card
const StatCard = ({ label, value, unit = '', icon, color = 'from-blue-500 to-purple-500' }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/10`}>
    <div className="flex justify-center mb-3">
      <div className="p-3 bg-white/20 rounded-full">
        {icon}
      </div>
    </div>
    <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
    <p className="text-3xl font-bold text-white">
      {value}
      {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
    </p>
  </div>
);

const PlacementDashboard = () => {
  const navigate = useNavigate();
  const authStatus = useSelector((store) => store.app.authStatus);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'chart'

  // Process data for analytics
  const processedData = useMemo(() => {
    // Year-wise summary with enhanced metrics (for charts - exclude 2025)
    const yearWiseData = chartPlacementData.map(yearData => {
      const totalOffers = yearData.companies.reduce((sum, company) => sum + company.offers, 0);
      const totalCompanies = yearData.companies.length;
      const companiesWithOffers = yearData.companies.filter(company => company.offers > 0).length;
      
      // Estimate placement rate based on typical batch size of ~120 students
      const estimatedBatchSize = 68;
      const estimatedPlacementRate = totalOffers > 0 ? Math.min((totalOffers / estimatedBatchSize) * 100, 100) : 0;

      return {
        year: yearData.year,
        totalOffers,
        totalCompanies,
        companiesWithOffers,
        companySuccessRate: totalCompanies > 0 ? ((companiesWithOffers / totalCompanies) * 100).toFixed(1) : 0,
        placementRate: estimatedPlacementRate.toFixed(1),
        efficiency: totalOffers / totalCompanies || 0
      };
    });

    // Enhanced company analytics
    const companyAnalytics = {};
    allPlacementData.forEach(yearData => {
      yearData.companies.forEach(company => {
        if (!companyAnalytics[company.company]) {
          companyAnalytics[company.company] = {
            name: company.company,
            totalOffers: 0,
            years: [],
            yearlyData: {}
          };
        }
        
        const analytics = companyAnalytics[company.company];
        analytics.totalOffers += company.offers;
        
        if (!analytics.years.includes(yearData.year)) {
          analytics.years.push(yearData.year);
        }
        
        // Package information removed due to policy
        
        analytics.yearlyData[yearData.year] = {
          offers: company.offers,
          remarks: company.remarks || ''
        };
      });
    });

    // Package calculation removed due to policy

    // Top companies with enhanced metrics
    const topCompanies = Object.values(companyAnalytics)
      .sort((a, b) => b.totalOffers - a.totalOffers)
      .slice(0, 20);

    // Radar chart data for top companies
    const radarData = topCompanies.slice(0, 6).map(company => ({
      company: company.name.length > 15 ? company.name.substring(0, 15) + '...' : company.name,
      offers: company.totalOffers,
      consistency: (company.years.length / chartPlacementData.length) * 100
    }));

    // Growth trend data
    const growthData = yearWiseData.map((year, index) => {
      const prevYear = index > 0 ? yearWiseData[index - 1] : year;
      const growth = index > 0 ? ((year.totalOffers - prevYear.totalOffers) / prevYear.totalOffers * 100).toFixed(1) : 0;
      
      return {
        ...year,
        growth: parseFloat(growth),
        cumulativeOffers: yearWiseData.slice(0, index + 1).reduce((sum, y) => sum + y.totalOffers, 0)
      };
    });

    return {
      yearWiseData: growthData,
      companyAnalytics,
      topCompanies,
      radarData
    };
  }, []);

  const selectedYearData = allPlacementData.find(d => d.year === selectedYear);

  // Filter companies based on search term
  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return processedData.topCompanies;
    return Object.values(processedData.companyAnalytics)
      .filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.totalOffers - a.totalOffers)
      .slice(0, 20);
  }, [searchTerm, processedData.companyAnalytics, processedData.topCompanies]);

  const summaryStats = useMemo(() => {
    // Include 2025 data in total students placed count
    const totalStudentsPlaced = processedData.yearWiseData.reduce((sum, year) => sum + year.totalOffers, 0) + 
                               (placement_2025?.companies?.reduce((sum, company) => sum + company.offers, 0) || 0);
    const totalCompaniesVisited = Object.keys(processedData.companyAnalytics).length;
    const avgPlacementRate = processedData.yearWiseData.reduce((sum, year) => sum + parseFloat(year.placementRate), 0) / processedData.yearWiseData.length;
    const topRecruiter = processedData.topCompanies[0];
    const currentYear = processedData.yearWiseData[processedData.yearWiseData.length - 1];
    const prevYear = processedData.yearWiseData[processedData.yearWiseData.length - 2];
    const growthTrend = prevYear ? ((currentYear.totalOffers - prevYear.totalOffers) / prevYear.totalOffers * 100) : 0;

    return {
      totalStudentsPlaced,
      totalCompaniesVisited,
      avgPlacementRate: avgPlacementRate.toFixed(1),
      topRecruiter: topRecruiter ? topRecruiter.name : 'N/A',
      topRecruiterCount: topRecruiter ? topRecruiter.totalOffers : 0,
      growthTrend: growthTrend.toFixed(1)
    };
  }, [processedData]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-400 rounded-xl p-4 shadow-xl">
          <p className="text-gray-900 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- Company Search Analytics for 2025 ---
  const companySearchSummary = useMemo(() => {
    if (!searchTerm) return null;
    const searchLower = searchTerm.trim().toLowerCase();
    // Collect year-wise placement counts (2018-2025)
    const yearWiseCounts = {};
    allPlacementData.forEach(yearData => {
      const count = yearData.companies
        .filter(c => c.company && c.company.toLowerCase().includes(searchLower))
        .reduce((sum, c) => sum + (c.offers || 0), 0);
      yearWiseCounts[yearData.year] = count;
    });
    // For 2025, get student names placed in searched company
    const students2025 = studentData2025
      .filter(s =>
        s["Company Name"] &&
        s["Company Name"].toLowerCase().includes(searchLower)
      )
      .map(s => s["Full Name"]);
    // Add 2025 count
    yearWiseCounts["2024-2025"] = students2025.length;

    return {
      yearWiseCounts,
      students2025
    };
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 text-gray-900 font-sans relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Hero Section */}
        <div className="relative text-center rounded-3xl p-8 md:p-12 mb-8 overflow-hidden bg-gray-950 dient-to-r from-blue-600 via-indigo-700 to-purple-700 shadow-2xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm mr-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                CSPIT Placement Analytics
              </h1>
            </div>
            <p className="mt-4 text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">
              Comprehensive placement insights, company analytics, and alumni tracking across 7 years (2018-2025)
            </p>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Total Alumni Placed" 
            value={summaryStats.totalStudentsPlaced}
            subtitle="Across all years"
            trend={parseFloat(summaryStats.growthTrend)}
            icon={<Users size={24} className="text-white"/>} 
            color="from-blue-600 to-indigo-700" 
            action={authStatus ? {
              label: "View Alumni",
              onClick: () => navigate('/alumni-2022')
            } : undefined}
          />
          <SummaryCard 
            title="Partner Companies" 
            value={summaryStats.totalCompaniesVisited}
            subtitle="Industry leaders"
            icon={<Building2 size={24} className="text-white"/>} 
            color="from-indigo-600 to-purple-700" 
          />
          <SummaryCard 
            title="Top Recruiter" 
            value={summaryStats.topRecruiter}
            subtitle={`${summaryStats.topRecruiterCount} placements`}
            icon={<Star size={24} className="text-white"/>} 
            color="from-purple-600 to-pink-700" 
          />
          <SummaryCard 
            title="Placement Rate" 
            value={`${summaryStats.avgPlacementRate}%`}
            subtitle="Average placement rate"
            icon={<Target size={24} className="text-white"/>} 
            color="from-green-600 to-emerald-700" 
          />
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Year Selection with Stats */}
          <div className="lg:col-span-1 bg-white border border-gray-300 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center text-gray-900">
                <Calendar className="w-5 h-5 mr-2" />
                Year Analytics
              </h2>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-gray-400 rounded-xl py-3 pl-4 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  {allPlacementData.map(d => <option key={d.year} value={d.year}>{d.year}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
              </div>
            </div>
            
            {selectedYearData && (
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Total Offers"
                  value={selectedYearData.companies.reduce((sum, company) => sum + company.offers, 0)}
                  icon={<Briefcase className="w-5 h-5 text-white" />}
                  color="from-gray-900 to-gray-700"
                />
                <StatCard
                  label="Companies"
                  value={selectedYearData.companies.length}
                  icon={<Building2 className="w-5 h-5 text-white" />}
                  color="from-gray-700 to-gray-900"
                />
              </div>
            )}
          </div>

          {/* Enhanced Company Search */}
          <div className="lg:col-span-2 bg-white border border-gray-300 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <Search className="w-5 h-5 mr-2" />
              Company Explorer
            </h2>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="🔍 Search companies (e.g., TCS, Infosys, CrestData)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-blue-50 border border-blue-300 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                />
              </div>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'chart' : 'grid')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center text-white font-semibold shadow"
              >
                <Eye className="w-5 h-5 mr-2" />
                {viewMode === 'grid' ? 'Chart View' : 'Grid View'}
              </button>
            </div>
            <button
              onClick={() => setShowCompanyModal(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-blue-800 transition-all font-semibold shadow"
            >
              Explore All Companies ({Object.keys(processedData.companyAnalytics).length})
            </button>
          </div>
        </div>

        {searchTerm && (
          <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 border border-blue-200 rounded-3xl p-8 shadow-2xl mb-10 animate-fade-in">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-blue-600 drop-shadow" />
                <span className="font-extrabold text-2xl text-blue-900 tracking-tight">
                  Search Results for <span className="bg-blue-100 px-3 py-1 rounded-lg shadow text-blue-700">{searchTerm}</span>
                </span>
              </div>
              <hr className="my-2 border-blue-100" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Year-wise Placement Stats */}
                <div>
                  <div className="font-semibold text-lg text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Placements by Year
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {companySearchSummary &&
                      Object.entries(companySearchSummary.yearWiseCounts).map(([year, count]) => (
                        <div
                          key={year}
                          className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow border transition-all duration-300 ${
                            year === "2024-2025"
                              ? "bg-green-100 border-green-300"
                              : "bg-blue-100 border-blue-300"
                          }`}
                        >
                          <span className="font-bold text-blue-700">{year}</span>
                          <span
                            className={`font-bold text-lg ${
                              count > 0
                                ? year === "2024-2025"
                                  ? "text-green-700"
                                  : "text-blue-700"
                                : "text-gray-400"
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                {/* 2025 Placed Students */}
                {companySearchSummary && companySearchSummary.students2025.length > 0 && (
                  <div>
                    <div className="font-semibold text-lg text-green-700 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      2025 Placed Students
                      <span className="ml-2 bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold shadow">
                        {companySearchSummary.students2025.length}
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-2">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {studentData2025
                          .filter(s =>
                            s["Company Name"] &&
                            s["Company Name"].toLowerCase().includes(searchTerm.trim().toLowerCase())
                          )
                          .map((s, idx) => (
                            <li
                              key={idx}
                              className="flex flex-col gap-1 bg-white border border-green-100 rounded-xl px-4 py-2 shadow hover:bg-green-50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center font-extrabold text-green-700 text-base shadow">
                                  {s["Full Name"]
                                    .split(" ")
                                    .map(n => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                                <span className="text-gray-900 font-semibold">{s["Full Name"]}</span>
                              </div>
                              <div className="ml-12 text-xs text-gray-700">
                                <span className="font-medium">Charusat ID:</span> {s["CHARUSAT Email Id"] || "-"}
                              </div>
                              {s["personal email id"] && (
                                <div className="ml-12 text-xs text-gray-700">
                                  <span className="font-medium">Personal Email:</span> {s["personal email id"]}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Growth Trend Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-300 rounded-3xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
              <TrendingUp className="w-6 h-6 mr-3" />
              Comprehensive Placement Analytics
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={processedData.yearWiseData}>
                <defs>
                  <linearGradient id="gradientStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="gradientCompanies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: '#475569', fontSize: 12 }} 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Students Placed - Primary focus */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalOffers" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#gradientStudents)" 
                  name="Students Placed"
                />
                
                {/* Companies Visited - Secondary metric */}
                <Bar 
                  yAxisId="right"
                  dataKey="totalCompanies" 
                  fill="url(#gradientCompanies)" 
                  name="Companies Visited" 
                  radius={[8, 8, 0, 0]}
                  opacity={0.8}
                />
                
                {/* Growth Line */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#059669" 
                  strokeWidth={4} 
                  name="Growth %" 
                  dot={{ fill: '#059669', r: 8, strokeWidth: 3, stroke: '#ffffff' }}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* Chart Legend with metrics */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center bg-blue-50 rounded-xl p-3">
                <div className="w-4 h-4 bg-gradient-to-b from-blue-600 to-blue-200 rounded mr-3"></div>
                <span className="text-sm font-semibold text-blue-800">
                  Total Students: {processedData.yearWiseData.reduce((sum, year) => sum + year.totalOffers, 0)}
                </span>
              </div>
              <div className="flex items-center justify-center bg-purple-50 rounded-xl p-3">
                <div className="w-4 h-4 bg-gradient-to-b from-purple-600 to-purple-200 rounded mr-3"></div>
                <span className="text-sm font-semibold text-purple-800">
                  Partner Companies: {Object.keys(processedData.companyAnalytics).length}
                </span>
              </div>
              <div className="flex items-center justify-center bg-green-50 rounded-xl p-3">
                <div className="w-4 h-2 bg-green-600 rounded mr-3" style={{ borderStyle: 'dashed' }}></div>
                <span className="text-sm font-semibold text-green-800">
                  Avg Growth: {(processedData.yearWiseData.reduce((sum, year) => sum + year.growth, 0) / processedData.yearWiseData.length).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Company Performance Radar */}
          <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <Target className="w-5 h-5 mr-2" />
              Top Companies Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={processedData.radarData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
                <PolarAngleAxis dataKey="company" tick={{ fill: '#475569', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar 
                  name="Offers" 
                  dataKey="offers" 
                  stroke="#2563eb" 
                  fill="#2563eb" 
                  fillOpacity={0.3} 
                  strokeWidth={2}
                />
                <Radar 
                  name="Consistency" 
                  dataKey="consistency" 
                  stroke="#7c3aed" 
                  fill="#7c3aed" 
                  fillOpacity={0.3} 
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Placement Rate Distribution */}
          <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <Award className="w-5 h-5 mr-2" />
              Placement Rate Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedData.yearWiseData}>
                <defs>
                  <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="placementRate" 
                  stroke="#059669" 
                  fillOpacity={1} 
                  fill="url(#gradient3)" 
                  name="Placement Rate (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Search Result Summary UI (below chart, improved UI) --- */}
        

        {/* Top Companies Showcase */}
        <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center text-gray-900">
              <Building2 className="w-6 h-6 mr-3" />
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Top Recruiting Partners'}
            </h3>
            <div className="text-sm text-gray-700 font-medium">
              Showing {filteredCompanies.length} companies
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCompanies.map((company, index) => (
                <CompanyCard
                  key={index}
                  company={company.name}
                  totalOffers={company.totalOffers}
                  years={company.years.length}
                  rank={!searchTerm ? index + 1 : null}
                  onClick={(companyName) => {
                    setSelectedCompany(processedData.companyAnalytics[companyName]);
                    setShowCompanyModal(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredCompanies.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#475569', fontSize: 12 }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalOffers" name="Total Alumni">
                  {filteredCompanies.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Enhanced Year Details Table */}
        {selectedYearData && (
          <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-xl mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
              <Calendar className="w-6 h-6 mr-3" />
              Companies in {selectedYear}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-400">
                    <th className="py-4 px-6 text-left text-gray-900 font-bold">Rank</th>
                    <th className="py-4 px-6 text-left text-gray-900 font-bold">Company</th>
                    <th className="py-4 px-6 text-center text-gray-900 font-bold">Offers</th>
                    <th className="py-4 px-6 text-left text-gray-900 font-bold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearData.companies
                    .sort((a, b) => b.offers - a.offers)
                    .slice(0, 15)
                    .map((company, index) => (
                    <tr key={index} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{company.company}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          company.offers > 0 ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {company.offers}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 text-sm font-medium">{company.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Company Modal */}
        {showCompanyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[85vh] overflow-y-auto border border-gray-200 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  {selectedCompany ? (
                    <>
                      <Building2 className="w-8 h-8 mr-3" />
                      {selectedCompany.name} - Alumni Analytics
                    </>
                  ) : (
                    <>
                      <Building2 className="w-8 h-8 mr-3" />
                      All Partner Companies
                    </>
                  )}
                </h2>
                <button
                  onClick={() => {
                    setShowCompanyModal(false);
                    setSelectedCompany(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              
              {selectedCompany ? (
                <div>
                  {/* Enhanced Company Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                      label="Total Alumni"
                      value={selectedCompany.totalOffers}
                      icon={<Users className="w-5 h-5 text-white" />}
                      color="from-blue-500 to-purple-500"
                    />
                    <StatCard
                      label="Active Years"
                      value={selectedCompany.years.length}
                      icon={<Calendar className="w-5 h-5 text-white" />}
                      color="from-purple-500 to-pink-500"
                    />
                    <StatCard
                      label="Alumni Growth"
                      value={`${((selectedCompany.totalOffers / selectedCompany.years.length) || 0).toFixed(1)}`}
                      unit=" per year"
                      icon={<Target className="w-5 h-5 text-white" />}
                      color="from-green-500 to-teal-500"
                    />
                    <StatCard
                      label="First Visited"
                      value={selectedCompany.years[0]}
                      icon={<Award className="w-5 h-5 text-white" />}
                      color="from-amber-500 to-orange-500"
                    />
                  </div>

                  {/* Year-wise Performance Chart */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800">Placement History</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={selectedCompany.years.map(year => ({
                          year,
                          offers: selectedCompany.yearlyData[year].offers
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis dataKey="year" tick={{ fill: '#cbd5e1' }} />
                          <YAxis tick={{ fill: '#cbd5e1' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="offers" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Year-wise Details */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Detailed Placement Records</h3>
                    <div className="grid gap-4">
                      {selectedCompany.years.map(year => {
                        const yearData = selectedCompany.yearlyData[year];
                        return (
                          <div key={year} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Year</p>
                                <p className="text-white text-lg font-bold">{year}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Students Placed</p>
                                <p className="text-green-400 text-lg font-bold">{yearData.offers}</p>
                              </div>

                              <div>
                                <p className="text-gray-400 text-sm font-medium">Additional Info</p>
                                <p className="text-gray-300 text-sm">{yearData.remarks || 'No additional information'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                  {Object.values(processedData.companyAnalytics)
                    .sort((a, b) => b.totalOffers - a.totalOffers)
                    .map((company, index) => (
                    <CompanyCard
                      key={index}
                      company={company.name}
                      totalOffers={company.totalOffers}
                      years={company.years.length}
                      rank={index + 1}
                      onClick={(companyName) => {
                        setSelectedCompany(processedData.companyAnalytics[companyName]);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementDashboard;
