import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Users,
  Upload,
  CheckCircle,
  XCircle,
  User,
  Mail,
  IdCard,
  FileText,
  Download,
  Search,
  Filter
} from 'lucide-react';

const StudentRoundView = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const { driveId, roundNumber } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [driveInfo, setDriveInfo] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/browse');
    }
    fetchStudents();
    fetchDriveInfo();
  }, [user, navigate, driveId, roundNumber]);

  const fetchDriveInfo = async () => {
    try {
      const response = await axiosInstance.get(`/placement-drive/${driveId}`);
      setDriveInfo(response.data.data.placementDrive);
    } catch (error) {
      console.error('Error fetching drive info:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/placement-drive/${driveId}/round/${roundNumber}/students`);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.student._id));
    }
  };

  const handleUploadShortlist = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student to shortlist');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending shortlist request:', {
        driveId,
        roundNumber,
        selectedStudents
      });
      
      const response = await axiosInstance.post(`/placement-drive/${driveId}/round/${roundNumber}/shortlist`, {
        shortlistedStudentIds: selectedStudents
      });
      
      console.log('Shortlist response:', response.data);
      toast.success(`Successfully shortlisted ${selectedStudents.length} students`);
      setShowShortlistModal(false);
      setSelectedStudents([]);
      fetchStudents();
      // Navigate back to drive details
      navigate(`/admin/placement-drive/${driveId}`);
    } catch (error) {
      console.error('Error uploading shortlist:', error);
      
      // Provide more detailed error information
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        toast.error(`Failed to upload shortlist: ${errorMessage}`);
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        toast.error('No response from server. Please check your connection.');
        console.error('Network error:', error.request);
      } else {
        // Something else happened
        toast.error(`Failed to upload shortlist: ${error.message}`);
        console.error('Other error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student.name.toLowerCase().includes(searchLower) ||
      student.student.email.toLowerCase().includes(searchLower) ||
      student.student.id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto pt-20 p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate(`/admin/placement-drive/${driveId}`)}
                className="text-white hover:text-gray-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-white font-['Poppins']">
                  Round {roundNumber} Students
                </h2>
                <p className="text-blue-100 mt-1">
                  {driveInfo?.title} - {driveInfo?.company?.name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{students.length} Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{selectedStudents.length} Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => setShowShortlistModal(true)}
                disabled={selectedStudents.length === 0}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="h-4 w-4" />
                Shortlist Selected ({selectedStudents.length})
              </button>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Students in Round {roundNumber}</h3>
            
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Students Found</h4>
                <p className="text-gray-500">
                  {searchTerm ? 'No students match your search criteria' : 'No students are enrolled in this round'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((studentProgress) => (
                      <tr key={studentProgress._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(studentProgress.student._id)}
                            onChange={() => handleStudentSelect(studentProgress.student._id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{studentProgress.student.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <IdCard className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{studentProgress.student.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{studentProgress.student.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(studentProgress.overallStatus)}`}>
                              {studentProgress.overallStatus}
                            </span>
                            <span className="text-xs text-gray-500">
                              Round {studentProgress.currentRound}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleStudentSelect(studentProgress.student._id)}
                              className={`p-1 rounded ${
                                selectedStudents.includes(studentProgress.student._id)
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-gray-400 hover:text-green-600'
                              }`}
                              title="Toggle Selection"
                            >
                              {selectedStudents.includes(studentProgress.student._id) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Shortlist Confirmation Modal */}
        {showShortlistModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Shortlist</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to shortlist <strong>{selectedStudents.length}</strong> students for the next round?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Students not selected will be marked as rejected and removed from the placement process.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowShortlistModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadShortlist}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Shortlist'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRoundView;
