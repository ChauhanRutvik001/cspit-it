import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  Search,
  Filter,
  Award,
  Target,
  Calendar,
  Clock,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';

const ComprehensiveStudentView = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const { driveId } = useParams();
  const [searchParams] = useSearchParams();
  const [drive, setDrive] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState('all');
  const [roundStatusFilter, setRoundStatusFilter] = useState('all'); // all | shortlisted | active | rejected
  const [expandedRounds, setExpandedRounds] = useState(new Set());

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/browse');
    }
    fetchDriveDetails();
  }, [user, navigate, driveId]);

  useEffect(() => {
    // Handle URL parameter for pre-selecting a round
    const roundParam = searchParams.get('round');
    if (roundParam) {
      setSelectedRound(roundParam);
    }
  }, [searchParams]);

  const fetchDriveDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/placement-drive/${driveId}`);
      const { placementDrive, rounds, studentProgress } = response.data.data;
      setDrive(placementDrive);
      setRounds(rounds);
      setStudentProgress(studentProgress);
      
      // Debug logging
      console.log('Drive details fetched:', {
        drive: placementDrive?.title,
        rounds: rounds.map(r => ({ number: r.roundNumber, name: r.roundName })),
        studentProgress: studentProgress.map(s => ({ 
          name: s.student?.name, 
          currentRound: s.currentRound,
          status: s.overallStatus 
        }))
      });
      
      // Initialize with all rounds expanded
      const allRoundNumbers = rounds.map(r => r.roundNumber);
      setExpandedRounds(new Set(allRoundNumbers));
    } catch (error) {
      console.error('Error fetching drive details:', error);
      toast.error('Failed to fetch drive details');
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

  const handleSelectAll = (roundNumber) => {
    const studentsInRound = getStudentsInRound(roundNumber);
    const studentIds = studentsInRound.map(student => student.student._id);
    
    if (selectedStudents.length === studentIds.length && 
        studentIds.every(id => selectedStudents.includes(id))) {
      setSelectedStudents(prev => prev.filter(id => !studentIds.includes(id)));
    } else {
      setSelectedStudents(prev => [...new Set([...prev, ...studentIds])]);
    }
  };

  const getStudentsInRound = (roundNumber) => {
    if (roundNumber === 'all') {
      return studentProgress;
    }
    const parsed = parseInt(roundNumber);
    // Include any student who has progress entry for the selected round,
    // not just those whose currentRound equals it (since shortlisted move ahead)
    const filtered = studentProgress.filter(student => {
      if (!Array.isArray(student.roundProgress)) return false;
      const hasThisRound = student.roundProgress.some(rp => rp.roundNumber === parsed);
      if (!hasThisRound) return false;
      // Enforce progression: for rounds > 1, student must be shortlisted in previous round
      if (parsed > 1) {
        const prev = student.roundProgress.find(rp => rp.roundNumber === parsed - 1);
        if (!prev || prev.status !== 'shortlisted') return false;
      }
      return true;
    });
    console.log(`Filtering for round ${roundNumber}:`, {
      totalStudents: studentProgress.length,
      filteredStudents: filtered.length,
      roundNumber: roundNumber,
      parsedRoundNumber: parsed
    });
    return filtered;
  };

  const getFilteredStudents = () => {
    let students = getStudentsInRound(selectedRound);
    console.log(`getFilteredStudents - selectedRound: ${selectedRound}, initial students: ${students.length}`);

    // Apply per-round status filter when a specific round is selected
    if (selectedRound !== 'all' && roundStatusFilter !== 'all') {
      const parsed = parseInt(selectedRound);
      students = students.filter(student => {
        const rp = Array.isArray(student.roundProgress)
          ? student.roundProgress.find(x => x.roundNumber === parsed)
          : null;
        if (!rp) return false;
        if (roundStatusFilter === 'shortlisted') return rp.status === 'shortlisted';
        if (roundStatusFilter === 'rejected') return rp.status === 'rejected';
        // active = not shortlisted and not rejected for that round
        return rp.status !== 'shortlisted' && rp.status !== 'rejected';
      });
      console.log(`After round status filter (${roundStatusFilter}): ${students.length}`);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      students = students.filter(student => 
        student.student.name.toLowerCase().includes(searchLower) ||
        student.student.email.toLowerCase().includes(searchLower) ||
        student.student.id.toLowerCase().includes(searchLower)
      );
      console.log(`After search filter: ${students.length}`);
    }

    console.log(`Final filtered students: ${students.length}`);
    return students;
  };

  const getStudentsByRound = () => {
    // For the "All Rounds" view, group students by each round they have progress for
    const filteredStudents = getFilteredStudents();
    const studentsByRound = {};

    const perRoundStudentIdSet = {};
    filteredStudents.forEach(student => {
      if (!Array.isArray(student.roundProgress)) return;
      student.roundProgress.forEach(rp => {
        const roundNum = rp.roundNumber;
        // Enforce progression: only include in round N if shortlisted in round N-1 (when N>1)
        if (roundNum > 1) {
          const prev = student.roundProgress.find(x => x.roundNumber === roundNum - 1);
          if (!prev || prev.status !== 'shortlisted') return;
        }
        if (!studentsByRound[roundNum]) {
          studentsByRound[roundNum] = [];
          perRoundStudentIdSet[roundNum] = new Set();
        }
        const studentId = student.student?._id || student.student; // handle populated vs id
        if (!perRoundStudentIdSet[roundNum].has(studentId)) {
          studentsByRound[roundNum].push(student);
          perRoundStudentIdSet[roundNum].add(studentId);
        }
      });
    });

    return studentsByRound;
  };

  const getStatusForRound = (student, roundNumber) => {
    const rp = Array.isArray(student.roundProgress)
      ? student.roundProgress.find(x => x.roundNumber === roundNumber)
      : null;
    return rp?.status || 'pending';
  };

  const handleUploadShortlist = async (roundNumber) => {
    const studentsInRound = getStudentsInRound(roundNumber);
    const roundStudents = studentsInRound.map(student => student.student._id);
    const selectedInRound = selectedStudents.filter(id => roundStudents.includes(id));
    
    if (selectedInRound.length === 0) {
      toast.error('Please select at least one student to shortlist');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending shortlist request:', {
        driveId,
        roundNumber,
        selectedStudents: selectedInRound
      });
      
      const response = await axiosInstance.post(`/placement-drive/${driveId}/round/${roundNumber}/shortlist`, {
        shortlistedStudentIds: selectedInRound
      });
      
      console.log('Shortlist response:', response.data);
      toast.success(`Successfully shortlisted ${selectedInRound.length} students`);
      setShowShortlistModal(false);
      setSelectedStudents([]);
      fetchDriveDetails();
    } catch (error) {
      console.error('Error uploading shortlist:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        toast.error(`Failed to upload shortlist: ${errorMessage}`);
      } else if (error.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error(`Failed to upload shortlist: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectStudents = async (roundNumber) => {
    const studentsInRound = getStudentsInRound(roundNumber);
    const roundStudents = studentsInRound.map(student => student.student._id);
    const selectedInRound = selectedStudents.filter(id => roundStudents.includes(id));
    
    if (selectedInRound.length === 0) {
      toast.error('Please select at least one student to reject');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending reject request:', {
        driveId,
        roundNumber,
        selectedStudents: selectedInRound
      });
      
      const response = await axiosInstance.post(`/placement-drive/${driveId}/round/${roundNumber}/reject`, {
        rejectedStudentIds: selectedInRound
      });
      
      console.log('Reject response:', response.data);
      toast.success(`Successfully rejected ${selectedInRound.length} students`);
      setShowRejectModal(false);
      setSelectedStudents([]);
      fetchDriveDetails();
    } catch (error) {
      console.error('Error rejecting students:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        toast.error(`Failed to reject students: ${errorMessage}`);
      } else if (error.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error(`Failed to reject students: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'placed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRoundExpansion = (roundNumber) => {
    setExpandedRounds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roundNumber)) {
        newSet.delete(roundNumber);
      } else {
        newSet.add(roundNumber);
      }
      return newSet;
    });
  };

  const isAllRoundsCompleted = () => {
    return rounds.length > 0 && rounds.every(round => round.status === 'completed');
  };

  const getShortlistedStudents = () => {
    // Final shortlisted = placed after last round
    return studentProgress.filter(student => student.overallStatus === 'placed');
  };

  const filteredStudents = getFilteredStudents();
  const studentsByRound = getStudentsByRound();
  const shortlistedStudents = getShortlistedStudents();

  if (loading && !drive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                onClick={() => navigate(`/admin/placement-drive/${driveId}`)}
                className="text-white hover:text-gray-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-white font-['Poppins']">
                  {drive?.company?.name} - Enrolled Students
                </h2 >
                <p className="text-blue-100 mt-1">
                  {drive?.title} - {studentProgress.length} Total Students
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{studentProgress.length} Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{rounds.length} Rounds</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>{shortlistedStudents.length} Shortlisted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Rounds</option>
                  {rounds.map(round => (
                    <option key={round.roundNumber} value={round.roundNumber}>
                      Round {round.roundNumber}: {round.roundName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRound !== 'all' && (
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={roundStatusFilter}
                    onChange={(e) => setRoundStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All statuses</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedStudents([])}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={() => {
                  if (selectedRound === 'all') {
                    toast.error('Please select a specific round to shortlist students');
                    return;
                  }
                  setShowShortlistModal(true);
                }}
                disabled={selectedStudents.length === 0}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="h-4 w-4" />
                Shortlist Selected ({selectedStudents.length})
              </button>
              <button
                onClick={() => {
                  if (selectedRound === 'all') {
                    toast.error('Please select a specific round to reject students');
                    return;
                  }
                  setShowRejectModal(true);
                }}
                disabled={selectedStudents.length === 0}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Reject Selected ({selectedStudents.length})
              </button>
              <span className="text-sm text-gray-600">
                {selectedStudents.length} selected
              </span>
            </div>
          </div>
        </div>

        {/* Shortlisted Students Section (if all rounds completed) */}
        {isAllRoundsCompleted() && shortlistedStudents.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-white" />
                <h3 className="text-xl font-bold text-white">Final Shortlisted Students</h3>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                  {shortlistedStudents.length} Students
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortlistedStudents.map((student) => (
                  <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{student.student.name}</h4>
                        <p className="text-sm text-gray-600">{student.student.id}</p>
                        <p className="text-sm text-gray-500">{student.student.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.overallStatus)}`}>
                        {student.overallStatus}
                      </span>
                      <span className="text-sm text-gray-500">
                        Avg: {student.averagePercentage?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rounds and Students */}
        <div className="space-y-6">
          {selectedRound === 'all' ? (
            // Show all rounds
            rounds.map(round => {
              // const studentsInRound = studentsByRound[round.roundNumber] || [];
              const studentsInRound = (studentsByRound[round.roundNumber] || []).filter(s => {
                // In all-rounds view we only apply search term above; keep all here
                return true;
              });
              const isExpanded = expandedRounds.has(round.roundNumber);
              
              return (
                <div key={round._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 cursor-pointer"
                    onClick={() => toggleRoundExpansion(round.roundNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-white">
                          Round {round.roundNumber}: {round.roundName}
                        </h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                          {studentsInRound.length} Students
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          round.status === 'completed' ? 'bg-green-100 text-green-800' :
                          round.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {round.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentsInRound.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAll(round.roundNumber);
                            }}
                            className="text-white hover:text-gray-200 text-sm"
                          >
                            {selectedStudents.length === studentsInRound.length && 
                             studentsInRound.every(s => selectedStudents.includes(s.student._id)) 
                              ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                        {isExpanded ? <EyeOff className="h-5 w-5 text-white" /> : <Eye className="h-5 w-5 text-white" />}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-200">
                      <span className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {round.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {round.maxMarks} marks
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(round.scheduledDate).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{round.description}</p>
                      
                      {studentsInRound.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Students</h4>
                          <p className="text-gray-500">No students are enrolled in this round</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.length === studentsInRound.length && 
                                             studentsInRound.every(s => selectedStudents.includes(s.student._id))}
                                    onChange={() => handleSelectAll(round.roundNumber)}
                                    className="rounded border-gray-300"
                                  />
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsInRound.map((student) => (
                                <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(student.student._id)}
                                      onChange={() => handleStudentSelect(student.student._id)}
                                      className="rounded border-gray-300"
                                    />
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-800">{student.student.name}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <IdCard className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600">{student.student.id}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600">{student.student.email}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {(() => {
                                      const status = getStatusForRound(student, round.roundNumber);
                                      return (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                          {status === 'pending' ? 'active' : status}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-sm text-gray-600">
                                      {student.totalMarks || 0} / {student.averagePercentage?.toFixed(1) || 0}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {studentsInRound.length > 0 && (
                        <div className="mt-4 flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setShowShortlistModal(true);
                              setSelectedRound(round.roundNumber);
                            }}
                            disabled={selectedStudents.length === 0}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            Shortlist Selected ({selectedStudents.filter(id => 
                              studentsInRound.some(s => s.student._id === id)
                            ).length})
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectModal(true);
                              setSelectedRound(round.roundNumber);
                            }}
                            disabled={selectedStudents.length === 0}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject Selected ({selectedStudents.filter(id => 
                              studentsInRound.some(s => s.student._id === id)
                            ).length})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Show specific round
            (() => {
              const round = rounds.find(r => r.roundNumber === parseInt(selectedRound));
              const studentsInRound = getFilteredStudents();
              
              console.log('Specific round view:', {
                selectedRound,
                round: round ? { number: round.roundNumber, name: round.roundName } : null,
                studentsInRound: studentsInRound.length,
                allStudents: studentProgress.length
              });
              
              if (!round) return null;
              
              return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-white">
                          Round {round.roundNumber}: {round.roundName}
                        </h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                          {studentsInRound.length} Students
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          round.status === 'completed' ? 'bg-green-100 text-green-800' :
                          round.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {round.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSelectAll(parseInt(selectedRound))}
                        className="text-white hover:text-gray-200 text-sm"
                      >
                        {selectedStudents.length === studentsInRound.length && 
                         studentsInRound.every(s => selectedStudents.includes(s.student._id)) 
                          ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{round.description}</p>
                    
                    {studentsInRound.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No Students</h4>
                        <p className="text-gray-500">No students are enrolled in this round</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.length === studentsInRound.length && 
                                           studentsInRound.every(s => selectedStudents.includes(s.student._id))}
                                  onChange={() => handleSelectAll(parseInt(selectedRound))}
                                  className="rounded border-gray-300"
                                />
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsInRound.map((student) => (
                              <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.student._id)}
                                    onChange={() => handleStudentSelect(student.student._id)}
                                    className="rounded border-gray-300"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800">{student.student.name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <IdCard className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{student.student.id}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{student.student.email}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {(() => {
                                    const status = getStatusForRound(student, parseInt(selectedRound));
                                    return (
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                        {status === 'pending' ? 'active' : status}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-600">
                                    {student.totalMarks || 0} / {student.averagePercentage?.toFixed(1) || 0}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {studentsInRound.length > 0 && (
                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setShowShortlistModal(true);
                            setSelectedRound(round.roundNumber);
                          }}
                          disabled={selectedStudents.length === 0}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Shortlist Selected ({selectedStudents.filter(id => 
                            studentsInRound.some(s => s.student._id === id)
                          ).length})
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectModal(true);
                            setSelectedRound(round.roundNumber);
                          }}
                          disabled={selectedStudents.length === 0}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject Selected ({selectedStudents.filter(id => 
                            studentsInRound.some(s => s.student._id === id)
                          ).length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          )}
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
                Selected students will be moved to the next round. Other students will remain in their current status.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowShortlistModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUploadShortlist(selectedRound)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Shortlist'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Rejection</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to reject <strong>{selectedStudents.length}</strong> students from this round?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Rejected students will be marked as rejected and removed from the placement process.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectStudents(selectedRound)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveStudentView;
