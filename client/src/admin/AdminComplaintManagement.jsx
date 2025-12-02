import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { 
  MessageSquare, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Users,
  TrendingUp,
  X,
  Send,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FaGoogle, FaArrowLeft } from "react-icons/fa";

const AdminComplaintManagement = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'stats'
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    page: 1
  });
  
  const [totalPages, setTotalPages] = useState(0);
  const [totalComplaints, setTotalComplaints] = useState(0);
  
  // Response form
  const [responseForm, setResponseForm] = useState({
    status: '',
    adminResponse: '',
    isPublic: false,
    internalNotes: ''
  });

  const statuses = ['Pending', 'Under Review', 'Resolved', 'Closed'];
  const categories = [
    'Unfair Behavior',
    'Cheating in Placement Drive',
    'Mobile Phone Usage During Exam',
    'Misconduct',
    'Faculty Related',
    'Placement Process',
    'Infrastructure',
    'Other'
  ];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/browse');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchComplaints();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await axiosInstance.get('/complaints/admin/all', { params });
      
      if (response.data.success) {
        setComplaints(response.data.data.complaints);
        setTotalPages(response.data.data.totalPages);
        setTotalComplaints(response.data.data.totalComplaints);
      }
    } catch (error) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/complaints/admin/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      page: 1
    });
  };

  const openResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseForm({
      status: complaint.status,
      adminResponse: complaint.adminResponse || '',
      isPublic: complaint.isPublic || false,
      internalNotes: complaint.internalNotes || ''
    });
    setShowResponseModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setSelectedComplaint(null);
    setResponseForm({
      status: '',
      adminResponse: '',
      isPublic: false,
      internalNotes: ''
    });
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseForm.status) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/complaints/admin/${selectedComplaint.complaintId}`,
        responseForm
      );
      
      if (response.data.success) {
        toast.success('Complaint updated successfully');
        closeResponseModal();
        fetchComplaints(); // Refresh the list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Under Review': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Resolved': return 'text-green-600 bg-green-100 border-green-200';
      case 'Closed': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'text-green-600 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">


      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">

        <button
          className="relative mb-5 z-10 bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        {/* Header */}

        <div className='bg-white rounded-xl shadow-xl overflow-hidden'>

        <div className="bg-white overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <MessageSquare className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white font-['Poppins']">Complaint Management</h1>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total Complaints:</span>{" "}
                  <span className="font-bold">{totalComplaints}</span>
                </span>
              </div>
            </div>
            <p className="text-indigo-100 mt-2 text-lg">Manage and respond to student complaints</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-2">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              All Complaints
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Statistics
            </button>
          </nav>
        </div>

        {/* All Complaints Tab */}
        {activeTab === 'all' && (
          <div>
            {/* Filter Section */}
            <div className="bg-white overflow-hidden mb-6">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Complaints</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">All Priorities</option>
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
                      <span className="font-medium">Filtered:</span> {complaints.length} complaints
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-lg shadow-md">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg font-medium">Loading complaints...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="p-16 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No complaints found</h3>
                  <p className="text-gray-600">No complaints match your current filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Complaint ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {complaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {complaint.complaintId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              <div className="font-medium truncate">{complaint.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{complaint.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openResponseModal(complaint)}
                              className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 shadow-sm"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="font-medium">View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="text-sm text-gray-700">
                      Page <span className="font-medium">{filters.page}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={filters.page === 1}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                        Page {filters.page} of {totalPages}
                      </div>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                        disabled={filters.page === totalPages}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading statistics...</p>
              </div>
            ) : stats && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.overview.total}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.overview.pending}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Under Review</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.overview.underReview}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.overview.resolved}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Complaints by Category</h3>
                  <div className="space-y-3">
                    {stats.categoryStats.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item._id}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / stats.overview.total) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedComplaint && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  Complaint Details & Response
                </h3>
                <button
                  onClick={closeResponseModal}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content - Two Column Layout */}
              <div className="flex flex-col lg:flex-row h-[calc(95vh-80px)]">
                {/* Left Column - Complaint Details */}
                <div className="lg:w-1/2 p-6 bg-gray-50 overflow-y-auto">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 truncate pr-4">{selectedComplaint.title}</h4>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                          {selectedComplaint.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                          {selectedComplaint.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ID:</span>
                        <span className="text-gray-600 ml-1">{selectedComplaint.complaintId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <span className="text-gray-600 ml-1">{selectedComplaint.category}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <span className="text-gray-600 ml-1">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Student:</span>
                        <span className="text-gray-600 ml-1">{selectedComplaint.studentId || 'Anonymous'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Description:</h5>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
                        {selectedComplaint.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Response Form */}
                <div className="lg:w-1/2 p-6 overflow-y-auto">
                  <form onSubmit={handleResponseSubmit} className="space-y-4 h-full flex flex-col">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status *
                          </label>
                          <select
                            value={responseForm.status}
                            onChange={(e) => setResponseForm(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Response
                          </label>
                          <textarea
                            value={responseForm.adminResponse}
                            onChange={(e) => setResponseForm(prev => ({ ...prev, adminResponse: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Provide your response to the student..."
                            maxLength={1500}
                          />
                          <p className="text-xs text-gray-500 mt-1">{responseForm.adminResponse.length}/1500 characters</p>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={responseForm.isPublic}
                            onChange={(e) => setResponseForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                            <Globe className="w-4 h-4 inline mr-1" />
                            Make visible on public board (only if resolved)
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Internal Notes (Admin Only)
                          </label>
                          <textarea
                            value={responseForm.internalNotes}
                            onChange={(e) => setResponseForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Internal notes for admin reference..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                      <button
                        type="button"
                        onClick={closeResponseModal}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center font-medium transition-colors"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Update Complaint
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

    </div>
  );
};

export default AdminComplaintManagement;