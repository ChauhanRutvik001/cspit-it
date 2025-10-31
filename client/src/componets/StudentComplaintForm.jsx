import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Info, 
  Send,
  Search,
  Eye,
  Clock
} from 'lucide-react';

const StudentComplaintForm = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'track', 'public'
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    relatedPlacementDrive: ''
  });
  
  // Track complaint state
  const [trackingId, setTrackingId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  
  // Public complaints state
  const [publicComplaints, setPublicComplaints] = useState([]);
  const [publicPage, setPublicPage] = useState(1);
  const [publicTotalPages, setPublicTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');

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
    if (user?.role !== 'student') {
      navigate('/browse');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicComplaints();
    }
  }, [activeTab, publicPage, selectedCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/complaints/submit', formData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 'Medium',
          relatedPlacementDrive: ''
        });
        
        // Show the complaint ID prominently
        setTimeout(() => {
          toast.success(`Save this ID to track your complaint: ${response.data.data.complaintId}`, {
            duration: 10000
          });
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackComplaint = async (e) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast.error('Please enter a complaint ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/complaints/status/${trackingId}`);
      
      if (response.data.success) {
        setTrackedComplaint(response.data.data);
        toast.success('Complaint found');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Complaint not found');
      setTrackedComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page: publicPage,
        limit: 10
      };
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await axiosInstance.get('/complaints/public', { params });
      
      if (response.data.success) {
        setPublicComplaints(response.data.data.complaints);
        setPublicTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch public complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Under Review': return 'text-blue-600 bg-blue-100';
      case 'Resolved': return 'text-green-600 bg-green-100';
      case 'Closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Complaint System</h1>
          <p className="text-gray-600">Submit anonymous complaints and track their status</p>
        </div>

        {/* Anonymous Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-800">Anonymous & Confidential</h3>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Your identity remains completely anonymous. No personal information is stored or revealed to anyone.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Submit Complaint
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'track'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Track Complaint
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Public Board
            </button>
          </nav>
        </div>

        {/* Submit Complaint Tab */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit New Complaint</h2>
            
            <form onSubmit={handleSubmitComplaint} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief title for your complaint"
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide detailed information about your complaint..."
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Please ensure your complaint is genuine and provides accurate information. 
                  You will receive a unique complaint ID to track the status of your submission.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Complaint
              </button>
            </form>
          </div>
        )}

        {/* Track Complaint Tab */}
        {activeTab === 'track' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Track Your Complaint</h2>
            
            <form onSubmit={handleTrackComplaint} className="mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint ID
                  </label>
                  <input
                    type="text"
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your complaint ID (e.g., COMP12345678ABCD)"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Track'}
                  </button>
                </div>
              </div>
            </form>

            {trackedComplaint && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{trackedComplaint.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trackedComplaint.status)}`}>
                    {trackedComplaint.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{trackedComplaint.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted On</p>
                    <p className="font-medium">{new Date(trackedComplaint.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {trackedComplaint.adminResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-green-800 mb-2">Admin Response</h4>
                    <p className="text-green-700">{trackedComplaint.adminResponse}</p>
                    {trackedComplaint.resolvedAt && (
                      <p className="text-sm text-green-600 mt-2">
                        Resolved on: {new Date(trackedComplaint.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Public Complaints Board Tab */}
        {activeTab === 'public' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Public Complaints Board</h2>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPublicPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {publicComplaints.map((complaint) => (
                <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                    <span className="text-xs text-gray-500">ID: {complaint.complaintId}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{complaint.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{complaint.category}</span>
                    <span>{new Date(complaint.resolvedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-1">Official Response</h4>
                    <p className="text-blue-700">{complaint.adminResponse}</p>
                  </div>
                </div>
              ))}
            </div>

            {publicTotalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPublicPage(Math.max(1, publicPage - 1))}
                    disabled={publicPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md">
                    Page {publicPage} of {publicTotalPages}
                  </span>
                  <button
                    onClick={() => setPublicPage(Math.min(publicTotalPages, publicPage + 1))}
                    disabled={publicPage === publicTotalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentComplaintForm;