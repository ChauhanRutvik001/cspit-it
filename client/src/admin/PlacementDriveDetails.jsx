import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Calendar,
  Users,
  Building,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  UserCheck,
  UserX,
  Award,
  Target,
  X
} from 'lucide-react';

const PlacementDriveDetails = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const { driveId } = useParams();
  const [drive, setDrive] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRoundModal, setShowCreateRoundModal] = useState(false);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [currentRoundForShortlist, setCurrentRoundForShortlist] = useState(null);
  const [studentsInCurrentRound, setStudentsInCurrentRound] = useState([]);
  const [shortlistedStudentIds, setShortlistedStudentIds] = useState([]);
  const [newRound, setNewRound] = useState({
    roundNumber: 1,
    roundName: '',
    roundType: 'aptitude',
    description: '',
    instructions: '',
    duration: 60,
    maxMarks: 100,
    passingMarks: 50,
    scheduledDate: '',
    scheduledTime: '',
    venue: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/browse');
    }
    fetchDriveDetails();
  }, [user, navigate, driveId]);

  const fetchDriveDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/placement-drive/${driveId}`);
      const { placementDrive, rounds, studentProgress } = response.data.data;
      setDrive(placementDrive);
      setRounds(rounds);
      setStudentProgress(studentProgress);
      
      // Set next round number - always start from 1 for each company's drive
      if (rounds.length > 0) {
        const maxRoundNumber = Math.max(...rounds.map(r => r.roundNumber));
        console.log('Current rounds for this drive:', rounds.map(r => r.roundNumber));
        console.log('Setting next round number to:', maxRoundNumber + 1);
        setNewRound(prev => ({
          ...prev,
          roundNumber: maxRoundNumber + 1
        }));
      } else {
        console.log('No existing rounds for this drive, setting round number to 1');
        setNewRound(prev => ({
          ...prev,
          roundNumber: 1
        }));
      }
    } catch (error) {
      console.error('Error fetching drive details:', error);
      toast.error('Failed to fetch drive details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!newRound.roundName || !newRound.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const roundData = {
        ...newRound,
        placementDrive: driveId
      };
      console.log('Creating round with data:', roundData);
      await axiosInstance.post('/placement-round/create', roundData);
      toast.success('Placement round created successfully');
      setShowCreateRoundModal(false);
      setNewRound({
        roundNumber: 1, // Reset to 1, will be updated in fetchDriveDetails
        roundName: '',
        roundType: 'aptitude',
        description: '',
        instructions: '',
        duration: 60,
        maxMarks: 100,
        passingMarks: 50,
        scheduledDate: '',
        scheduledTime: '',
        venue: ''
      });
      fetchDriveDetails();
    } catch (error) {
      console.error('Error creating round:', error);
      toast.error(error.response?.data?.message || 'Failed to create round');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRound = async (roundId) => {
    try {
      await axiosInstance.patch(`/placement-round/${roundId}/start`);
      toast.success('Round started successfully');
      fetchDriveDetails();
    } catch (error) {
      console.error('Error starting round:', error);
      toast.error('Failed to start round');
    }
  };

  const handleCompleteRound = async (roundId) => {
    try {
      // First, get the students who are in this round
      const round = rounds.find(r => r._id === roundId);
      const studentsResponse = await axiosInstance.get(`/placement-drive/${driveId}/round/${round?.roundNumber}/students`);
      const studentsInRound = studentsResponse.data.students || [];
      
      if (studentsInRound.length === 0) {
        toast.error('No students found in this round');
        return;
      }

      // Show confirmation dialog with student count
      const confirmMessage = `Are you sure you want to complete this round?\n\nThis will:\n- Mark all ${studentsInRound.length} pending students as either shortlisted or rejected\n- Automatically advance shortlisted students to the next round\n- Mark rejected students as eliminated from the placement drive\n\nNote: You can view and manage individual students by clicking the "View Students" button first.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }

      // For now, we'll complete the round with an empty shortlist
      // In a real implementation, you would want to show a student selection UI
      // The backend will automatically handle all pending students as rejected unless they're in the shortlisted array
      await axiosInstance.patch(`/placement-round/${roundId}/complete`, {
        shortlistedStudents: [] // Empty array means all students will be marked as rejected
      });
      
      toast.success('Round completed successfully. All pending students have been marked as rejected. Use "View Students" to manage individual student progress.');
      fetchDriveDetails();
    } catch (error) {
      console.error('Error completing round:', error);
      toast.error('Failed to complete round');
    }
  };

  const handleOpenShortlistModal = async (roundId) => {
    try {
      setLoading(true);
      const round = rounds.find(r => r._id === roundId);
      const studentsResponse = await axiosInstance.get(`/placement-drive/${driveId}/round/${round?.roundNumber}/students`);
      const studentsInRound = studentsResponse.data.students || [];
      
      setCurrentRoundForShortlist(round);
      setStudentsInCurrentRound(studentsInRound);
      setShortlistedStudentIds([]);
      setShowShortlistModal(true);
    } catch (error) {
      console.error('Error fetching students for shortlist:', error);
      toast.error('Failed to load students for shortlisting');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRoundWithShortlist = async () => {
    try {
      setLoading(true);
      
      await axiosInstance.patch(`/placement-round/${currentRoundForShortlist._id}/complete`, {
        shortlistedStudents: shortlistedStudentIds
      });
      
      const shortlistedCount = shortlistedStudentIds.length;
      const rejectedCount = studentsInCurrentRound.length - shortlistedCount;
      
      toast.success(`Round completed successfully! ${shortlistedCount} students shortlisted, ${rejectedCount} students rejected.`);
      setShowShortlistModal(false);
      fetchDriveDetails();
    } catch (error) {
      console.error('Error completing round with shortlist:', error);
      toast.error('Failed to complete round');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentShortlist = (studentId) => {
    setShortlistedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoundTypeColor = (type) => {
    switch (type) {
      case 'aptitude':
        return 'bg-blue-100 text-blue-800';
      case 'coding':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-purple-100 text-purple-800';
      case 'hr':
        return 'bg-orange-100 text-orange-800';
      case 'group_discussion':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !drive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Drive Not Found</h3>
          <button
            onClick={() => navigate('/admin/placement-drives')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Drives
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-8xl mx-auto pt-20 p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate('/admin/placement-drives')}
                className="text-white hover:text-gray-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-white font-['Poppins']">
                  {drive.title}
                </h2>
                <p className="text-blue-100 mt-1">{drive.company?.name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(drive.startDate).toLocaleDateString()} - {new Date(drive.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{studentProgress.length} Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{drive.totalRounds} Rounds</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rounds Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Placement Rounds</h3>
                <button
                  onClick={() => setShowCreateRoundModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Round
                </button>
              </div>

              <div className="space-y-4">
                {rounds.map((round) => (
                  <div key={round._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(round.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
                            {round.status}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoundTypeColor(round.roundType)}`}>
                          {round.roundType}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {round.status === 'scheduled' && (
                          <button
                            onClick={() => handleStartRound(round._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Start Round"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {round.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => handleOpenShortlistModal(round._id)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              title="Shortlist Students"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCompleteRound(round._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Complete Round (All Rejected)"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                                                 <button
                           onClick={() => navigate(`/admin/placement-drive/${driveId}/students?round=${round.roundNumber}`)}
                           className="text-blue-600 hover:text-blue-800"
                           title="View Students"
                         >
                             <Edit className="h-4 w-4" />
                         </button>
                         {/* <button
                           onClick={() => navigate(`/admin/placement-round/${round._id}`)}
                           className="text-gray-600 hover:text-gray-800"
                           title="View Details"
                         >
                         
                         </button> */}
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Round {round.roundNumber}: {round.roundName}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">{round.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Duration:</span> {round.duration} min
                      </div>
                      <div>
                        <span className="font-medium">Max Marks:</span> {round.maxMarks}
                      </div>
                      <div>
                        <span className="font-medium">Passing:</span> {round.passingMarks}%
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(round.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rounds.length === 0 && (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Rounds Created</h4>
                  <p className="text-gray-500 mb-4">Create your first round to start the placement process</p>
                  <button
                    onClick={() => setShowCreateRoundModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Round
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Student Progress Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Student Progress</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Active</span>
                  </div>
                  <span className="text-green-600 font-bold">
                    {studentProgress.filter(s => s.overallStatus === 'active').length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">Shortlisted</span>
                  </div>
                  <span className="text-blue-600 font-bold">
                    {studentProgress.filter(s => s.overallStatus === 'placed').length}

                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UserX className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 font-medium">Rejected</span>
                  </div>
                  <span className="text-red-600 font-bold">
                    {studentProgress.filter(s => s.overallStatus === 'rejected').length}
                  </span>
                </div>
              </div>

                             <div className="mt-6 pt-6 border-t">
                 <button
                   onClick={() => navigate(`/admin/placement-drive/${driveId}/students`)}
                   className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                 >
                   View All Students
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Create Round Modal */}
        {showCreateRoundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create Placement Round</h3>
              <form onSubmit={handleCreateRound}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newRound.roundNumber}
                      onChange={(e) => setNewRound({ ...newRound, roundNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round Name *
                    </label>
                    <input
                      type="text"
                      value={newRound.roundName}
                      onChange={(e) => setNewRound({ ...newRound, roundName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Aptitude Test"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round Type *
                    </label>
                    <select
                      value={newRound.roundType}
                      onChange={(e) => setNewRound({ ...newRound, roundType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="aptitude">Aptitude</option>
                      <option value="coding">Coding</option>
                      <option value="technical">Technical</option>
                      <option value="hr">HR Interview</option>
                      <option value="group_discussion">Group Discussion</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newRound.duration}
                      onChange={(e) => setNewRound({ ...newRound, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newRound.maxMarks}
                      onChange={(e) => setNewRound({ ...newRound, maxMarks: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={newRound.maxMarks}
                      value={newRound.passingMarks}
                      onChange={(e) => setNewRound({ ...newRound, passingMarks: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={newRound.scheduledDate}
                      onChange={(e) => setNewRound({ ...newRound, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={newRound.scheduledTime}
                      onChange={(e) => setNewRound({ ...newRound, scheduledTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newRound.description}
                    onChange={(e) => setNewRound({ ...newRound, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Describe this round..."
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={newRound.instructions}
                    onChange={(e) => setNewRound({ ...newRound, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Instructions for students..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={newRound.venue}
                    onChange={(e) => setNewRound({ ...newRound, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Computer Lab 1"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoundModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Round'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Shortlist Students Modal */}
        {showShortlistModal && currentRoundForShortlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  Complete {currentRoundForShortlist.roundName} - Round {currentRoundForShortlist.roundNumber}
                </h3>
                <button
                  onClick={() => setShowShortlistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Select Students to Shortlist</h4>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Students you select will advance to the next round. Unselected students will be automatically rejected and eliminated from the placement drive.
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    {shortlistedStudentIds.length} of {studentsInCurrentRound.length} students selected
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setShortlistedStudentIds(studentsInCurrentRound.map(s => s.student._id))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setShortlistedStudentIds([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {studentsInCurrentRound.map((studentData) => (
                  <div 
                    key={studentData.student._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      shortlistedStudentIds.includes(studentData.student._id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleStudentShortlist(studentData.student._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          shortlistedStudentIds.includes(studentData.student._id)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {shortlistedStudentIds.includes(studentData.student._id) && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {studentData.student.fullName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {studentData.student.email} • {studentData.student.enrollmentNumber}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {studentData.student.branch} • {studentData.student.semester}th Sem
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              studentData.currentStatus === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : studentData.currentStatus === 'shortlisted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {studentData.currentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          Round {studentData.currentRound}
                        </div>
                        {studentData.student.cgpa && (
                          <div className="text-sm text-gray-500">
                            CGPA: {studentData.student.cgpa}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-green-600">{shortlistedStudentIds.length}</span> will advance to next round • 
                  <span className="font-semibold text-red-600 ml-1">{studentsInCurrentRound.length - shortlistedStudentIds.length}</span> will be rejected
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowShortlistModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteRoundWithShortlist}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Completing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Complete Round</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementDriveDetails;

