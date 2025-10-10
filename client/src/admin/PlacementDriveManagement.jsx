import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Calendar,
  Users,
  Building,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const PlacementDriveManagement = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [placementDrives, setPlacementDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [newDrive, setNewDrive] = useState({
    company: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalRounds: 1
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/browse');
    }
    fetchCompanies();
    fetchPlacementDrives();
  }, [user, navigate]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/company/list');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    }
  };

  const fetchPlacementDrives = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/placement-drive');
      setPlacementDrives(response.data.data || []);
    } catch (error) {
      console.error('Error fetching placement drives:', error);
      toast.error('Failed to fetch placement drives');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!newDrive.company || !newDrive.title || !newDrive.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/placement-drive/create', newDrive);
      toast.success('Placement drive created successfully');
      setShowCreateModal(false);
      setNewDrive({
        company: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        totalRounds: 1
      });
      fetchPlacementDrives();
    } catch (error) {
      console.error('Error creating placement drive:', error);
      toast.error(error.response?.data?.message || 'Failed to create placement drive');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/placement-drive/${driveId}`);
      toast.success('Placement drive deleted successfully');
      fetchPlacementDrives();
    } catch (error) {
      console.error('Error deleting placement drive:', error);
      toast.error('Failed to delete placement drive');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-8xl mx-auto pt-20 p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Building className="h-8 w-8 text-white" />
                <h2 className="text-3xl font-bold text-white font-['Poppins']">
                  Placement Drive Management
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Drive
              </button>
            </div>
          </div>
        </div>

        {/* Placement Drives Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placementDrives.map((drive) => (
              <div key={drive._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(drive.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(drive.status)}`}>
                        {drive.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/placement-drive/${drive._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDrive(drive._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{drive.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{drive.description}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{drive.company?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(drive.startDate).toLocaleDateString()} - {new Date(drive.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{drive.totalRounds} Round(s)</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/admin/placement-drive/${drive._id}`)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage Drive
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {placementDrives.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Placement Drives</h3>
            <p className="text-gray-500 mb-4">Create your first placement drive to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Drive
            </button>
          </div>
        )}

        {/* Create Drive Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Create Placement Drive</h3>
              <form onSubmit={handleCreateDrive}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company *
                    </label>
                    <select
                      value={newDrive.company}
                      onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drive Title *
                    </label>
                    <input
                      type="text"
                      value={newDrive.title}
                      onChange={(e) => setNewDrive({ ...newDrive, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Software Engineer Drive 2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={newDrive.description}
                      onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Describe the placement drive..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newDrive.startDate}
                        onChange={(e) => setNewDrive({ ...newDrive, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newDrive.endDate}
                        onChange={(e) => setNewDrive({ ...newDrive, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Rounds
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newDrive.totalRounds}
                      onChange={(e) => setNewDrive({ ...newDrive, totalRounds: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Drive'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementDriveManagement;

