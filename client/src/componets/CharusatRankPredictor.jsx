import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Calculator, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Star,
  BookOpen,
  Building2,
  Zap,
  TrendingUp,
  Users,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react';
import cutoffData from '../data/cutoffData.json';

const CharusatRankPredictor = () => {
  const [formData, setFormData] = useState({
    rank: '',
    category: '',
    stream: 'Science'
  });
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, analyzing, processing, complete
  const [showCommerceOption, setShowCommerceOption] = useState(false);

  const categories = ['OPEN', 'EWS', 'SEBC', 'SC', 'ST'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEligibilityStatus = (userRank, cutoffRank) => {
    if (!cutoffRank) return 'not-available';
    if (userRank <= cutoffRank) return 'eligible';
    if (userRank <= cutoffRank + 2000) return 'medium';
    return 'not-eligible';
  };

  const predictAdmission = () => {
    if (!formData.rank || !formData.category) {
      alert('Please fill all required fields');
      return;
    }

    // Scroll to animation area
    setTimeout(() => {
      const animationSection = document.getElementById('animation-section');
      if (animationSection) {
        animationSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
      }
    }, 100);

    setIsLoading(true);
    setAnimationPhase('analyzing');

    // Phase 1: Analyzing (2 seconds)
    setTimeout(() => {
      setAnimationPhase('processing');
    }, 2000);

    // Phase 2: Processing (1.5 seconds)
    setTimeout(() => {
      setAnimationPhase('complete');
    }, 3500);

    // Phase 3: Show results (0.5 seconds after complete)
    setTimeout(() => {
      const userRank = parseInt(formData.rank);
      let predictionResults = {
        rank: userRank,
        category: formData.category,
        stream: formData.stream,
        eligible: [],
        medium: [],
        notEligible: [],
        alternatives: []
      };

      // Helper function to get college logo
      const getCollegeLogo = (college) => {
        switch(college) {
          case 'CSPIT': return '/cspit.jpg';
          case 'DEPSTAR': return '/depstar.png';
          case 'CMPICA': return '/CMPICA.jpg';
          case 'IIIM': return '/iiim.png';
          default: return null;
        }
      };

      // Science stream - merge 2024 and 2025 data for trend analysis
      const collegeYearData = {
        'CSPIT': { '2024': cutoffData['CSPIT_2024'], '2025': cutoffData['CSPIT_2025'] },
        'DEPSTAR': { '2024': cutoffData['DEPSTAR_2024'], '2025': cutoffData['DEPSTAR_2025'] }
      };

      Object.entries(collegeYearData).forEach(([college, yearData]) => {
        // Get all unique branches from both years
        const allBranches = new Set([
          ...Object.keys(yearData['2024'] || {}),
          ...Object.keys(yearData['2025'] || {})
        ]);

        allBranches.forEach(branch => {
          const cutoff2024 = yearData['2024']?.[branch]?.[formData.category];
          const cutoff2025 = yearData['2025']?.[branch]?.[formData.category];
          
          // Skip if no cutoff data available for user's category
          if (!cutoff2024 && !cutoff2025) return;
          
          // Calculate trend and prediction
          let trendAnalysis = '';
          let predictedCutoff = null;
          let confidence = '';
          
          if (cutoff2024 && cutoff2025) {
            const difference = cutoff2025 - cutoff2024;
            const percentChange = ((difference / cutoff2024) * 100).toFixed(1);
            
            if (difference > 0) {
              trendAnalysis = `↗️ Increasing (+${Math.abs(difference).toLocaleString()}, +${Math.abs(percentChange)}%)`;
              predictedCutoff = cutoff2025 + Math.abs(difference * 0.5); // Conservative estimate
            } else if (difference < 0) {
              trendAnalysis = `↘️ Decreasing (-${Math.abs(difference).toLocaleString()}, -${Math.abs(percentChange)}%)`;
              predictedCutoff = cutoff2025 - Math.abs(difference * 0.3); // Conservative estimate
            } else {
              trendAnalysis = `→ Stable (No change)`;
              predictedCutoff = cutoff2025;
            }
            confidence = cutoff2024 === cutoff2025 ? 'High' : 'Medium';
          } else if (cutoff2025) {
            predictedCutoff = cutoff2025;
            trendAnalysis = `📊 2025 Data Only`;
            confidence = 'Medium';
          } else if (cutoff2024) {
            predictedCutoff = cutoff2024 + 500; // Add buffer for missing 2025 data
            trendAnalysis = `📊 2024 Data Only (+buffer)`;
            confidence = 'Low';
          }

          const status = getEligibilityStatus(userRank, predictedCutoff);
          
          const branchData = {
            college,
            branch,
            cutoffRank: predictedCutoff,
            cutoff2024,
            cutoff2025,
            trendAnalysis,
            confidence,
            status,
            allCutoffs: yearData['2025']?.[branch] || yearData['2024']?.[branch],
            icon: cutoffData.branchIcons[branch] || '🎓',
            logo: getCollegeLogo(college)
          };

          if (status === 'eligible') {
            predictionResults.eligible.push(branchData);
          } else if (status === 'medium') {
            predictionResults.medium.push(branchData);
          } else if (status === 'not-eligible') {
            predictionResults.notEligible.push(branchData);
          }
        });
      });

      // Sort by preference (CSPIT first, then by cutoff rank)
      const sortBranches = (branches) => {
        return branches.sort((a, b) => {
          if (a.college === 'CSPIT' && b.college !== 'CSPIT') return -1;
          if (b.college === 'CSPIT' && a.college !== 'CSPIT') return 1;
          return a.cutoffRank - b.cutoffRank;
        });
      };

      predictionResults.eligible = sortBranches(predictionResults.eligible);
      predictionResults.medium = sortBranches(predictionResults.medium);

      // Add alternatives for students who don't qualify or need more options
      if (predictionResults.eligible.length === 0 && predictionResults.medium.length === 0) {
        predictionResults.alternatives = [
          { college: 'CMPICA', branch: 'BCA', status: 'eligible', icon: cutoffData.branchIcons.BCA, description: 'Bachelor of Computer Applications', logo: '/CMPICA.jpg' },
          { college: 'CMPICA', branch: 'MCA', status: 'eligible', icon: cutoffData.branchIcons.MCA, description: 'Master of Computer Applications', logo: '/CMPICA.jpg' },
          { college: 'IIIM', branch: 'BBA', status: 'eligible', icon: cutoffData.branchIcons.BBA, description: 'Bachelor of Business Administration', logo: '/iiim.png' },
          { college: 'IIIM', branch: 'MBA', status: 'eligible', icon: cutoffData.branchIcons.MBA, description: 'Master of Business Administration', logo: '/iiim.png' },
        ];
      } else if (predictionResults.eligible.length > 0 || predictionResults.medium.length > 0) {
        // Show additional options for successful students too
        predictionResults.additionalOptions = [
          { college: 'CMPICA', branch: 'BCA', status: 'eligible', icon: cutoffData.branchIcons.BCA, description: 'Alternative: Computer Applications', logo: '/CMPICA.jpg' },
          { college: 'IIIM', branch: 'BBA', status: 'eligible', icon: cutoffData.branchIcons.BBA, description: 'Business Administration Option', logo: '/iiim.png' },
        ];
      }

      setResults(predictionResults);
      setShowResults(true);
      setIsLoading(false);
      setAnimationPhase('idle');
    }, 4000); // Total 4 seconds for complete animation
  };

  const handleCommerceRedirect = () => {
    setResults({
      stream: 'Commerce',
      alternatives: [
        { college: 'CMPICA', branch: 'BCA', status: 'eligible', icon: cutoffData.branchIcons.BCA, description: 'Bachelor of Computer Applications - Perfect for Commerce Students', logo: '/CMPICA.jpg' }
      ]
    });
    setShowResults(true);
    setShowCommerceOption(false);
  };

  const resetForm = () => {
    setFormData({ rank: '', category: '', stream: 'Science' });
    setResults(null);
    setShowResults(false);
    setShowCommerceOption(false);
    setAnimationPhase('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          {/* Top Header Box */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left Side - Title and Description */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 mb-2 leading-tight">
                    CHARUSAT
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                    Rank Predictor
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4"></div>
                </div>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                  Discover your admission possibilities for <span className="font-semibold text-blue-700">CHARUSAT University 2025</span>
                </p>

                {/* Feature Badges */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-medium text-sm">AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-full border border-emerald-200">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-800 font-medium text-sm">Accurate Results</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-2 rounded-full border border-purple-200">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800 font-medium text-sm">Personalized</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Quick Input Form */}
              <div className="lg:w-96">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-white to-blue-50 rounded-full shadow-lg border border-blue-200">
                      <Calculator className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Quick Prediction</h3>
                  
                  <div className="space-y-4">
                    {/* ACPC Rank Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                        <Target className="w-4 h-4 mr-1 text-blue-600" />
                        ACPC Rank
                      </label>
                      <input
                        type="number"
                        value={formData.rank}
                        onChange={(e) => handleInputChange('rank', e.target.value)}
                        placeholder="Enter rank (e.g., 5000)"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-sm"
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                        <Users className="w-4 h-4 mr-1 text-blue-600" />
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-sm"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={predictAdmission}
                        disabled={isLoading || !formData.rank || !formData.category}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Analyzing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Award className="w-4 h-4 mr-2" />
                            Predict Engineering
                          </div>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCommerceRedirect}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                      >
                        <div className="flex items-center justify-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Commerce Student?
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div id="animation-section">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <PredictionAnimation phase={animationPhase} userRank={formData.rank} userCategory={formData.category} />
            ) : !showResults ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <p className="text-lg text-gray-600">
                    Use the quick prediction form above to get instant results, or scroll down to see detailed information.
                  </p>
                </div>
              </motion.div>
            ) : (
              <ResultsDisplay
                results={results}
                onReset={resetForm}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const PredictionAnimation = ({ phase, userRank, userCategory }) => {
  const getPhaseContent = () => {
    switch (phase) {
      case 'analyzing':
        return {
          title: 'Analyzing Your Profile',
          subtitle: `Processing rank ${userRank} for ${userCategory} category`,
          icon: '🔍',
          color: 'blue',
          progress: 33
        };
      case 'processing':
        return {
          title: 'Processing Predictions',
          subtitle: 'Comparing with historical data and trends',
          icon: '⚙️',
          color: 'indigo',
          progress: 66
        };
      case 'complete':
        return {
          title: 'Prediction Complete!',
          subtitle: 'Preparing your personalized results',
          icon: '✅',
          color: 'green',
          progress: 100
        };
      default:
        return {
          title: 'Initializing...',
          subtitle: 'Getting ready to analyze',
          icon: '🚀',
          color: 'gray',
          progress: 0
        };
    }
  };

  const phaseContent = getPhaseContent();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-12 text-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-full">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${phaseContent.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r from-${phaseContent.color}-500 to-${phaseContent.color}-600 rounded-full`}
          ></motion.div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Animated Icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: phase === 'processing' ? [0, 360] : 0
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' }
            }}
            className="text-8xl mb-8"
          >
            {phaseContent.icon}
          </motion.div>
          
          {/* Title */}
          <motion.h2
            key={phase}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            {phaseContent.title}
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p
            key={phase + '_sub'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 mb-8"
          >
            {phaseContent.subtitle}
          </motion.p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  animate={{
                    scale: step <= Math.ceil(phaseContent.progress / 33) ? [1, 1.2, 1] : 1,
                    backgroundColor: step <= Math.ceil(phaseContent.progress / 33) ? '#3B82F6' : '#E5E7EB'
                  }}
                  transition={{ duration: 0.6, repeat: step <= Math.ceil(phaseContent.progress / 33) ? Infinity : 0 }}
                  className={`w-4 h-4 rounded-full`}
                ></motion.div>
              ))}
            </div>
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className={`w-3 h-3 bg-${phaseContent.color}-500 rounded-full`}
              ></motion.div>
            ))}
          </div>
          
          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-sm text-gray-500"
          >
            {phase === 'analyzing' && '🔍 Scanning 2000+ program combinations...'}
            {phase === 'processing' && '📊 Analyzing trends from 2024-2025 data...'}
            {phase === 'complete' && '🎯 Generating personalized recommendations...'}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const ResultsDisplay = ({ results, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto space-y-8"
    >
        

      {/* Results Cards */}
      {results.stream === 'Commerce' ? (
        <CommerceResults alternatives={results.alternatives} />
      ) : (
        <ScienceResults 
          eligible={results.eligible}
          medium={results.medium}
          notEligible={results.notEligible}
          alternatives={results.alternatives}
          additionalOptions={results.additionalOptions}
          results={results}
        />
      )}

      {/* Reset Button */}
      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="px-8 py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300"
        >
          Check Another Rank
        </motion.button>
      </div>
    </motion.div>
  );
};

const CommerceResults = ({ alternatives }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-2">Perfect Program for Commerce Students!</h3>
        <p className="text-gray-600">CHARUSAT welcomes Commerce students with this excellent program</p>
      </div>
      
      <div className="flex justify-center">
        <div className="max-w-md w-full">
          {alternatives.map((program, index) => (
            <motion.div
              key={`${program.college}-${program.branch}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg"
            >
              <div className="text-center">
                {/* College Logo */}
                <div className="mb-4">
                  <img 
                    src="/CMPICA.jpg" 
                    alt="CMPICA Logo" 
                    className="w-20 h-20 mx-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-6xl" style={{display: 'none'}}>{program.icon}</div>
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">{program.college}</h4>
                <h5 className="text-xl font-semibold text-emerald-600 mb-4">{program.branch}</h5>
                <p className="text-gray-600 mb-6">{program.description}</p>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  ✅ Admission Available
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScienceResults = ({ eligible, medium, notEligible, alternatives, additionalOptions, results }) => {
  
  // Component for college cutoff summary table
  const CollegeCutoffTable = ({ collegeName, year, data, userCategory, userRank }) => {
    const categories = ['OPEN', 'EWS', 'SEBC', 'SC', 'ST'];
    
    const getCellStyle = (cutoff, category) => {
      if (!cutoff) return 'text-gray-500 bg-gray-50';
      if (category !== userCategory) return 'text-gray-600 bg-white';
      
      if (userRank <= cutoff) return 'text-green-800 bg-green-50 font-semibold';
      if (userRank <= cutoff + 2000) return 'text-amber-800 bg-amber-50 font-semibold';
      return 'text-red-800 bg-red-50 font-semibold';
    };

    const getHeaderStyle = (category) => {
      if (category === userCategory) {
        return 'bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold opacity-100 visible';
      }
      return 'bg-purple-100/50 text-purple-700 font-medium opacity-10 visible transition-all duration-300';
    };

    const getColumnVisibility = (category) => {
      if (category === userCategory) {
        return 'opacity-100 visible';
      }
      return 'opacity-10 visible transition-all duration-300';
    };
    
    return (
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200 shadow-xl mb-8 overflow-hidden hover:border-purple-300 hover:shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-6">
          <div className="flex items-center space-x-4">
            {/* College Logo */}
            <div className="w-14 h-14 bg-white/90 rounded-xl shadow-lg flex items-center justify-center border-2 border-white/50 backdrop-blur-sm">
              <img 
                src={collegeName === 'CSPIT' ? '/cspit.jpg' : '/depstar.png'}
                alt={`${collegeName} Logo`}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="text-2xl hidden items-center justify-center" style={{display: 'none'}}>
                {collegeName === 'CSPIT' ? '🏛️' : '🎓'}
              </div>
            </div>
            
            {/* College Info */}
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-white mb-2 font-['Poppins']">
                {collegeName} Cutoff Analysis ({year})
              </h4>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <p className="text-purple-100">
                  Your Category: <span className="font-semibold text-white bg-white/20 px-3 py-1 rounded-lg">{userCategory}</span>
                </p>
                <span className="hidden md:inline text-purple-200">•</span>
                <p className="text-purple-100">
                  Your Rank: <span className="font-bold text-white">{userRank.toLocaleString()}</span>
                </p>
              </div>
              <p className="text-sm text-purple-200 mt-2">
                💡 Hover over other categories to view their cutoffs
              </p>
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-gradient-to-r from-purple-100 via-violet-100 to-indigo-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-purple-800 uppercase tracking-wider border-r border-purple-300 bg-white/50">
                  Department
                </th>
                {categories.map(cat => (
                  <th 
                    key={cat} 
                    scope="col"
                    className={`px-4 py-4 text-center text-xs font-bold text-purple-800 uppercase tracking-wider border-r border-purple-300 last:border-r-0 ${getHeaderStyle(cat)} group/column transition-all duration-200 hover:bg-purple-50 bg-white/30`}
                    title={cat !== userCategory ? `Hover to view ${cat} category cutoffs` : `Your selected category: ${cat}`}
                    onMouseEnter={() => {
                      if (cat !== userCategory) {
                        // Add 80% opacity to hovered column
                        const header = document.querySelector(`th[title*="${cat} category"]`);
                        if (header) {
                          header.classList.remove('opacity-10');
                          header.classList.add('opacity-80');
                        }
                        document.querySelectorAll(`[data-category="${cat}"]`).forEach(cell => {
                          cell.classList.remove('opacity-10');
                          cell.classList.add('opacity-80');
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (cat !== userCategory) {
                        // Return to 10% opacity for non-user category
                        const header = document.querySelector(`th[title*="${cat} category"]`);
                        if (header) {
                          header.classList.remove('opacity-80');
                          header.classList.add('opacity-10');
                        }
                        document.querySelectorAll(`[data-category="${cat}"]`).forEach(cell => {
                          cell.classList.remove('opacity-80');
                          cell.classList.add('opacity-10');
                        });
                      }
                    }}
                  >
                    {cat}
                    {cat === userCategory && (
                      <div className="text-xs mt-1 opacity-90">Your Category</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-200">
              {Object.entries(data).map(([department, cutoffs]) => (
                <tr key={department} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300">
                  <td className="px-6 py-4 text-sm font-bold text-purple-900 bg-gradient-to-r from-purple-100/80 to-violet-100/60 border-r border-purple-200">
                    {department}
                  </td>
                  {categories.map(category => {
                    const cutoff = cutoffs[category];
                    const isUserCategory = category === userCategory;
                    
                    return (
                      <td 
                        key={category} 
                        data-category={category}
                        className={`px-4 py-4 text-center text-sm border-r border-purple-200 last:border-r-0 ${getCellStyle(cutoff, category)} ${isUserCategory ? 'border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-50 to-violet-50' : ''} ${getColumnVisibility(category)} transition-all duration-300`}
                        title={!isUserCategory ? `${category} category: ${cutoff ? cutoff.toLocaleString() : 'Vacant'}` : ''}
                        onMouseEnter={() => {
                          if (category !== userCategory) {
                            // Add 80% opacity to hovered column
                            const header = document.querySelector(`th[title*="${category} category"]`);
                            if (header) {
                              header.classList.remove('opacity-10');
                              header.classList.add('opacity-80');
                            }
                            document.querySelectorAll(`[data-category="${category}"]`).forEach(cell => {
                              cell.classList.remove('opacity-10');
                              cell.classList.add('opacity-80');
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          if (category !== userCategory) {
                            // Return to 10% opacity for non-user category
                            const header = document.querySelector(`th[title*="${category} category"]`);
                            if (header) {
                              header.classList.remove('opacity-80');
                              header.classList.add('opacity-10');
                            }
                            document.querySelectorAll(`[data-category="${category}"]`).forEach(cell => {
                              cell.classList.remove('opacity-80');
                              cell.classList.add('opacity-10');
                            });
                          }
                        }}
                      >
                        <div className="font-medium">
                          {cutoff ? cutoff.toLocaleString() : 'Vacant'}
                        </div>
                        {isUserCategory && cutoff && (
                          <div className="text-xs mt-1 opacity-80">
                            {userRank <= cutoff ? 'Eligible' : 
                             userRank <= cutoff + 2000 ? 'Close' : 'Difficult'}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer Legend */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-100 border-t border-purple-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-purple-200">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
              <span className="font-medium text-purple-800">Eligible</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-purple-200">
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
              <span className="font-medium text-purple-800">Medium Chance</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-purple-200">
              <div className="w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
              <span className="font-medium text-purple-800">Difficult</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-purple-300"></div>
            <span className="font-semibold text-white bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 px-4 py-2 rounded-lg shadow-sm">
              Showing {userCategory} category • Hover others to view
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* College Summary Tables */}
      {(eligible.length > 0 || medium.length > 0) && (
        <div className="space-y-4">
          <div className="text-center bg-gradient-to-r from-purple-100 via-violet-50 to-indigo-100 rounded-3xl border-2 border-purple-200 shadow-2xl p-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent mb-3">
                📊 Complete Cutoff Overview
              </h3>
              <p className="text-gray-700 font-medium text-lg">
                Your selected category ({results?.category}) is highlighted with color-coded results
              </p>
              <div className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-lg">
                <span className="animate-pulse">💡</span>
                <span className="font-semibold">CMPICA-Style Enhanced Analysis</span>
              </div>
            </div>
          </div>
          
          {/* CSPIT Table */}
          <CollegeCutoffTable 
            collegeName="CSPIT"
            year="2025"
            data={cutoffData.CSPIT_2025}
            userCategory={results?.category}
            userRank={parseInt(results?.rank || 0)}
          />
          
          {/* DEPSTAR Table */}
          <CollegeCutoffTable 
            collegeName="DEPSTAR"
            year="2025"
            data={cutoffData.DEPSTAR_2025}
            userCategory={results?.category}
            userRank={parseInt(results?.rank || 0)}
          />
        </div>
      )}

      {/* Additional Options for Successful Students */}
      {additionalOptions && additionalOptions.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">💡 Additional Options Available:</h3>
            <p className="text-gray-600">Explore these alternative programs as well</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {additionalOptions.map((option, index) => (
              <EligibilityCard
                key={`${option.college}-${option.branch}-additional`}
                data={option}
                index={index}
                type="additional"
                results={results}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not Eligible - Show Alternatives */}
      {alternatives && alternatives.length > 0 && (
        <div className="space-y-6">
          <div className="text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Don't Worry! Excellent Alternatives Available</h3>
            <p className="text-gray-600 mb-6">
              Your rank might not qualify for engineering, but CHARUSAT offers these fantastic programs:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {alternatives.map((alternative, index) => (
              <EligibilityCard
                key={`${alternative.college}-${alternative.branch}-alt`}
                data={alternative}
                index={index}
                isAlternative={true}
                results={results}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show some engineering options even if not eligible */}
      {notEligible.length > 0 && eligible.length === 0 && medium.length === 0 && !alternatives && (
        <ResultSection
          title="🏢 Reference Information (Red = Difficult to Get):"
          subtitle="These might be difficult with your current rank, but consider them for reference"
          branches={notEligible.slice(0, 6)}
          type="not-eligible"
          results={results}
        />
      )}
    </div>
  );
};

const ResultSection = ({ title, subtitle, branches, type, results }) => {
  const getSectionConfig = () => {
    switch (type) {
      case 'eligible':
        return {
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'medium':
        return {
          bgGradient: 'from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'not-eligible':
        return {
          bgGradient: 'from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      default:
        return {
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
    }
  };

  const config = getSectionConfig();

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`bg-gradient-to-br ${config.bgGradient} rounded-3xl border-2 ${config.borderColor} p-8 shadow-xl`}
      >
        <div className="text-center">
          <div className={`inline-flex p-4 ${config.iconBg} rounded-2xl mb-4`}>
            <Trophy className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <h3 className="text-4xl font-bold text-gray-800 mb-4">{title}</h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          <div className="mt-6">
            <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border border-white/50">
              <span className="text-lg font-bold text-gray-800">{branches.length}</span>
              <span className="text-gray-600">programs found</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {branches.map((branch, index) => (
          <EligibilityCard
            key={`${branch.college}-${branch.branch}`}
            data={branch}
            index={index}
            type={type}
            results={results}
          />
        ))}
      </div>
    </div>
  );
};

const EligibilityCard = ({ data, index, type = 'eligible', isAlternative = false, results }) => {
  const getStatusConfig = () => {
    if (isAlternative) {
      return {
        bgGradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        borderColor: 'border-emerald-300',
        icon: CheckCircle,
        iconColor: 'text-emerald-600',
        statusText: 'Available',
        statusBg: 'bg-emerald-500',
        statusTextColor: 'text-white',
        accentColor: 'text-emerald-600'
      };
    }

    switch (type) {
      case 'eligible':
        return {
          bgGradient: 'bg-gradient-to-br from-green-50 to-emerald-50',
          borderColor: 'border-green-300',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          statusText: 'High Chance',
          statusBg: 'bg-green-500',
          statusTextColor: 'text-white',
          accentColor: 'text-green-600'
        };
      case 'medium':
        return {
          bgGradient: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-300',
          icon: AlertCircle,
          iconColor: 'text-yellow-600',
          statusText: 'Medium Chance',
          statusBg: 'bg-yellow-500',
          statusTextColor: 'text-white',
          accentColor: 'text-yellow-600'
        };
      case 'not-eligible':
        return {
          bgGradient: 'bg-gradient-to-br from-red-50 to-pink-50',
          borderColor: 'border-red-300',
          icon: XCircle,
          iconColor: 'text-red-600',
          statusText: 'Challenging',
          statusBg: 'bg-red-500',
          statusTextColor: 'text-white',
          accentColor: 'text-red-600'
        };
      case 'additional':
        return {
          bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          borderColor: 'border-blue-300',
          icon: Star,
          iconColor: 'text-blue-600',
          statusText: 'Alternative',
          statusBg: 'bg-blue-500',
          statusTextColor: 'text-white',
          accentColor: 'text-blue-600'
        };
      default:
        return {
          bgGradient: 'bg-gradient-to-br from-gray-50 to-slate-50',
          borderColor: 'border-gray-300',
          icon: Star,
          iconColor: 'text-gray-600',
          statusText: 'Available',
          statusBg: 'bg-gray-500',
          statusTextColor: 'text-white',
          accentColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // Helper function to get appropriate logo based on college and branch
  const getDisplayLogo = () => {
    if (data.logo) return data.logo;
    
    // Fallback logic based on college name
    switch(data.college) {
      case 'CSPIT': return '/cspit.jpg';
      case 'DEPSTAR': return '/depstar.png';
      case 'CMPICA': return '/CMPICA.jpg';
      case 'IIIM': 
        return (data.branch === 'BBA' || data.branch === 'MBA') ? '/iiim.png' : '/iiim.png';
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -8 }}
      className={`${config.bgGradient} rounded-3xl border-2 ${config.borderColor} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full ${config.accentColor.replace('text-', 'bg-')} rounded-full blur-2xl`}></div>
      </div>
      
      {/* Header Section */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          {/* College Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 border-white">
                <img 
                  src={getDisplayLogo()}
                  alt={`${data.college} Logo`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="text-2xl hidden items-center justify-center" style={{display: 'none'}}>{data.icon}</div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-1">{data.college} {data.year && `(${data.year})`}</h4>
              <p className="text-sm text-gray-600 font-medium">University College</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`${config.statusBg} ${config.statusTextColor} px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-bold">{config.statusText}</span>
          </div>
        </div>

        {/* Branch Information */}
        <div className="mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
            <h5 className="text-2xl font-bold text-gray-800 mb-2">{data.branch}</h5>
            {data.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{data.description}</p>
            )}
            
            {!isAlternative && data.cutoffRank && (
              <div className="mt-3 space-y-3">
                {/* Current Predicted Cutoff */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${config.statusBg} rounded-full`}></div>
                    <span className="text-sm font-medium text-gray-700">Predicted Cutoff ({results?.category})</span>
                  </div>
                  <span className="text-lg font-bold ${config.accentColor}">{Math.round(data.cutoffRank).toLocaleString()}</span>
                </div>

                {/* Historical Data & Trend */}
                {(data.cutoff2024 || data.cutoff2025) && (
                  <div className="bg-gray-50 rounded-lg p-3 text-xs">
                    <div className="font-medium text-gray-700 mb-2">Trend Analysis:</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-center">
                        <div className="font-medium text-gray-600">2024</div>
                        <div className="font-bold text-gray-800">
                          {data.cutoff2024 ? data.cutoff2024.toLocaleString() : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-600">2025</div>
                        <div className="font-bold text-gray-800">
                          {data.cutoff2025 ? data.cutoff2025.toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-xs">
                      <span className="font-medium">{data.trendAnalysis}</span>
                      <span className="ml-2 text-gray-500">(Confidence: {data.confidence})</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CharusatRankPredictor;