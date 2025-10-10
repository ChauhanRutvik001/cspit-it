import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import {
  Building,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';

const StudentPlacementDrives = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/browse');
      return;
    }
    fetchStudentProgress();
  }, [user, navigate]);

  const fetchStudentProgress = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/placement-drive/student/progress');
      setStudentProgress(response.data.data || []);
    } catch (error) {
      console.error('Error fetching student progress:', error);
      toast.error('Failed to fetch student progress');
    } finally {
      setLoading(false);
    }
  };


  const getProgressStatusIcon = (status) => {
    switch (status) {
      case 'shortlisted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'placed':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'placed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="container mx-auto">
        <div className="bg-white my-16 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm backdrop-filter">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold">My Placement Progress</h2>
                <p className="mt-1 text-indigo-100">
                  Track your progress in placement drives
                </p>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">Total Drives:</span>{" "}
                  <span className="font-bold">{studentProgress.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* My Progress Section */}
          <div className="p-6">
          <div>
            {studentProgress.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Placement Progress</h3>
                <p className="text-gray-500">You haven't participated in any placement drives yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {studentProgress.map((progress) => (
                  <div key={progress._id} className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Building className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{progress.placementDrive?.title}</h3>
                            <p className="text-gray-600">{progress.placementDrive?.company?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getProgressStatusIcon(progress.overallStatus)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressStatusColor(progress.overallStatus)}`}>
                            {progress.overallStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-blue-700">Current Round</span>
                          </div>
                          <p className="text-xl font-bold text-blue-900">Round {progress.currentRound}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                              <Target className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-green-700">Total Rounds</span>
                          </div>
                          <p className="text-xl font-bold text-green-900">{progress.placementDrive?.totalRounds}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-yellow-700">Average Score</span>
                          </div>
                          <p className="text-xl font-bold text-yellow-900">{progress.averagePercentage?.toFixed(1) || 0}%</p>
                        </div>
                      </div>

                      {/* Round Progress */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Round Progress</h4>
                        <div className="space-y-2">
                          {progress.roundProgress
                            ?.filter((round, index, self) => 
                              // Remove duplicates based on roundNumber
                              index === self.findIndex(r => r.roundNumber === round.roundNumber)
                            )
                            ?.sort((a, b) => a.roundNumber - b.roundNumber) // Sort by round number
                            ?.map((round, index) => (
                            <div key={`${round.roundNumber}-${index}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">Round {round.roundNumber}</span>
                                <span className="text-sm text-gray-600">{round.roundName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  round.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                  round.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  round.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  round.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {round.status}
                                </span>
                                {round.marksObtained > 0 && (
                                  <span className="text-sm text-gray-600">
                                    {round.marksObtained}/{round.maxMarks} ({round.percentage?.toFixed(1)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {progress.finalResult && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Final Result:</span>
                              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                progress.finalResult === 'selected' ? 'bg-green-100 text-green-800' :
                                progress.finalResult === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {progress.finalResult}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementDrives;
