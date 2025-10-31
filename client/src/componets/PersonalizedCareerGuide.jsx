import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, GraduationCap, AlertCircle, CheckCircle, Download, Share2,
  BookOpen, Building, Briefcase, Rocket, TrendingUp, Clock, MapPin,
  DollarSign, Target, Users, Award, FileText, Calendar, Phone,
  ExternalLink, ArrowRight, Star, Filter, Search, ChevronDown,
  ChevronUp, Lightbulb, Zap, BarChart3, Globe, Heart, Shield,
  Coffee, Laptop, Settings, Layers, Database, Code, PenTool, Loader,
  Sparkles, Brain, MessageCircle, BookMarked, TrendingDown, 
  PieChart, LineChart, Activity, BarChart2, TrendingUpDown
} from 'lucide-react';
import { generateCareerGuidePDF, generateQuickActionChecklist } from '../utils/pdfGenerator';
import GeminiCareerAdvisor from '../services/geminiAI';

// Helper function to clean AI response from markdown formatting
const cleanAIResponse = (text) => {
  if (!text) return '';
  
  return text
    // Remove markdown bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove markdown italic (*text*)
    .replace(/\*(.*?)\*/g, '$1')
    // Remove markdown headers (##, ###, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove markdown list markers (-, *, +)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    // Remove markdown numbered lists (1. 2. etc.)
    .replace(/^[\s]*\d+\.\s+/gm, '• ')
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Clean up extra whitespace and normalize line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim();
};

// Helper function to format text into structured sections
const formatResponseSections = (text) => {
  if (!text) return [];
  
  const cleanText = cleanAIResponse(text);
  const sections = [];
  
  // Split by double line breaks or section indicators
  const parts = cleanText.split(/\n\n+/);
  
  parts.forEach((part, index) => {
    if (part.trim()) {
      // Check if it's a title/header (contains colons or is all caps)
      const isTitle = part.includes(':') && part.length < 100;
      
      sections.push({
        id: index,
        content: part.trim(),
        isTitle: isTitle,
        type: isTitle ? 'header' : 'content'
      });
    }
  });
  
  return sections;
};

// Visual Progress Chart Component
const ProgressChart = ({ skills, title = "Skill Assessment" }) => {
  const skillLevels = skills.map(skill => ({
    name: skill,
    level: Math.floor(Math.random() * 40) + 60 // Random level between 60-100
  }));

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
        <BarChart2 className="mr-2 w-4 h-4 text-blue-600" />
        {title}
      </h4>
      <div className="space-y-3">
        {skillLevels.map((skill, index) => (
          <div key={index} className="flex items-center">
            <span className="text-sm font-medium text-gray-700 w-20 truncate">{skill.name}</span>
            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              />
            </div>
            <span className="text-xs text-gray-600 w-8">{skill.level}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Career Path Wheel - Visual representation of AI recommendations
const CareerPathWheel = ({ recommendations, studentData }) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const totalWeight = recommendations.reduce((sum, rec) => {
    const weight = rec.priority === 'High' ? 3 : rec.priority === 'Medium' ? 2 : 1;
    return sum + weight;
  }, 0);

  let currentAngle = 0;
  const segments = recommendations.map((rec, index) => {
    const weight = rec.priority === 'High' ? 3 : rec.priority === 'Medium' ? 2 : 1;
    const percentage = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
    const angle = (percentage / 100) * 360;
    
    const segment = {
      path: rec.path,
      percentage: Math.round(percentage),
      color: colors[index % colors.length],
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      weight: weight
    };
    
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Target className="mr-2 w-5 h-5 text-blue-600" />
        AI Career Path Analysis
      </h3>
      
      <div className="flex flex-col lg:flex-row items-center justify-between">
        {/* Circular Chart */}
        <div className="relative w-64 h-64 mb-6 lg:mb-0">
          <svg width="256" height="256" className="transform -rotate-90">
            <circle cx="128" cy="128" r="120" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
            {segments.map((segment, index) => {
              const radius = 120;
              const centerX = 128;
              const centerY = 128;
              
              const startAngleRad = (segment.startAngle * Math.PI) / 180;
              const endAngleRad = (segment.endAngle * Math.PI) / 180;
              
              const x1 = centerX + radius * Math.cos(startAngleRad);
              const y1 = centerY + radius * Math.sin(startAngleRad);
              const x2 = centerX + radius * Math.cos(endAngleRad);
              const y2 = centerY + radius * Math.sin(endAngleRad);
              
              const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
            
            {/* Center circle with profile info */}
            <circle cx="128" cy="128" r="40" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-sm font-bold text-gray-800">{studentData.branch}</div>
            <div className="text-xs text-gray-600">CGPA: {studentData.cgpa}</div>
          </div>
          
          {/* AI Recommendation Badge */}
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            AI
          </div>
        </div>
        
        {/* Legend and Insights */}
        <div className="flex-1 lg:ml-8">
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center flex-1">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <span className="font-medium text-gray-800">{segment.path}</span>
                </div>
                <div className="flex items-center">
                  {/* Visual indicator instead of numbers */}
                  <div className="flex space-x-1">
                    {[...Array(segment.weight)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      ></div>
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {segment.weight === 3 ? 'Best Match' : segment.weight === 2 ? 'Good Option' : 'Consider'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* AI Insights */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Brain className="w-4 h-4 mr-2 text-blue-600" />
              AI Recommendation Summary
            </h4>
            <p className="text-sm text-gray-700">
              Based on your {studentData.branch} background and {studentData.cgpa} CGPA, our AI suggests focusing on the highest weighted career path while keeping alternative options ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Career Path Visualization Component
const CareerPathVisual = ({ recommendations }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
        <TrendingUp className="mr-2 w-4 h-4 text-green-600" />
        Career Path Timeline
      </h4>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-blue-400"></div>
        {recommendations.slice(0, 4).map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative flex items-center mb-4"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
              {index + 1}
            </div>
            <div className="ml-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
              <h5 className="font-medium text-gray-800 text-sm">{rec.path}</h5>
              <p className="text-xs text-gray-600 mt-1">{rec.timeline}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PersonalizedCareerGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [studentData, setStudentData] = useState({
    name: '',
    branch: '',
    currentYear: '',
    cgpa: '',
    skills: [],
    interests: [],
    placementStatus: '',
    careerGoals: '',
    preferredLocation: '',
    salaryExpectation: '',
    workPreference: '',
    examsPrepared: [],
    internshipExperience: '',
    projects: '',
    certifications: []
  });
  
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [selectedAIFeature, setSelectedAIFeature] = useState(null);
  const [aiFeatureResult, setAiFeatureResult] = useState('');

  // Updated data for 2025
  const branches = ['IT', 'CSE', 'Civil', 'Mechanical', 'CE', 'Electrical', 'Electronics'];
  const currentYear = ['3rd Year', '4th Year', 'Recent Graduate', 'Gap Year'];
  const placementStatus = [
    'Not placed yet - Need guidance',
    'Have offers but looking for better options',
    'Preparing for competitive exams',
    'Considering higher studies',
    'Planning to start a business'
  ];

  const skillsOptions = {
    IT: ['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'Angular', 'Spring Boot', 'MySQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'DevOps', 'Cybersecurity'],
    CSE: ['C++', 'Python', 'Java', 'Machine Learning', 'Data Science', 'AI', 'Deep Learning', 'Blockchain', 'Cloud Computing', 'Mobile Development', 'Game Development'],
    Civil: ['AutoCAD', 'Revit', 'STAAD Pro', 'Project Management', 'Construction Management', 'Structural Design', 'Environmental Engineering', 'Transportation Planning'],
    Mechanical: ['CAD/CAM', 'SolidWorks', 'ANSYS', 'MATLAB', 'Manufacturing', 'Thermal Engineering', 'Robotics', 'Automation', 'Quality Control'],
    CE: ['Environmental Modeling', 'Water Treatment', 'Air Quality Management', 'Waste Management', 'GIS', 'Environmental Assessment', 'Sustainability Planning']
  };

  const interestOptions = [
    'Research & Development', 'Management & Leadership', 'Technical Implementation',
    'Entrepreneurship', 'Consulting', 'Teaching', 'Field Work', 'Remote Work',
    'Government Service', 'International Opportunities'
  ];

  const examOptions = ['GATE', 'UPSC ESE', 'GPSC', 'CAT', 'GRE', 'GMAT', 'IELTS', 'TOEFL', 'Company Tests'];

  // Career paths with detailed 2025 information
  const careerPaths = {
    'PSU/Government': {
      icon: <Building className="w-6 h-6" />,
      color: 'emerald',
      examsCutoffs: {
        'GATE 2025': {
          IT: '720+', CSE: '750+', Civil: '740+', Mechanical: '750+', CE: '730+'
        },
        'UPSC ESE 2025': {
          IT: 'Not applicable', CSE: 'Not applicable', Civil: '760/1300', Mechanical: '745/1300', CE: '750/1300'
        },
        'GPSC': {
          IT: '650-700', CSE: '680-720', Civil: '620-660', Mechanical: '640-680', CE: '610-650'
        }
      },
      companies: {
        IT: ['BSNL', 'RAILTEL', 'C-DOT', 'NIC', 'CDAC'],
        CSE: ['ISRO', 'DRDO', 'BARC', 'CDAC', 'NIC'],
        Civil: ['CPWD', 'PWD', 'NHAI', 'Indian Railways', 'Municipal Corps'],
        Mechanical: ['BHEL', 'SAIL', 'NTPC', 'HAL', 'Indian Oil'],
        CE: ['CPCB', 'State Pollution Boards', 'Municipal Corps', 'NWDA']
      },
      salary: '₹6-15 LPA + Benefits',
      jobSecurity: 'Very High',
      workLifeBalance: 'Excellent'
    },
    'Private Sector': {
      icon: <Briefcase className="w-6 h-6" />,
      color: 'blue',
      companies: {
        IT: ['TCS', 'Infosys', 'Wipro', 'Google', 'Microsoft', 'Amazon', 'Flipkart'],
        CSE: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Uber', 'PayPal'],
        Civil: ['L&T', 'Tata Projects', 'Godrej Properties', 'DLF', 'Shapoorji Pallonji'],
        Mechanical: ['Tata Motors', 'Mahindra', 'Bajaj Auto', 'Maruti Suzuki', 'Bosch'],
        CE: ['Enviro Tech', 'IL&FS Environmental', 'Ramky Enviro', 'VA Tech Wabag']
      },
      salary: '₹4-50+ LPA',
      growth: 'High',
      innovation: 'Very High'
    },
    'Higher Studies': {
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'purple',
      options: {
        'M.Tech/MS (India)': {
          exams: ['GATE'],
          institutions: ['IITs', 'NITs', 'IIITs', 'Central Universities'],
          duration: '2 years',
          cost: '₹2-8 Lakhs'
        },
        'MS (Abroad)': {
          exams: ['GRE', 'IELTS/TOEFL'],
          institutions: ['MIT', 'Stanford', 'CMU', 'UC Berkeley'],
          duration: '2 years',
          cost: '$40-80k'
        },
        'MBA': {
          exams: ['CAT', 'GMAT'],
          institutions: ['IIMs', 'ISB', 'Harvard', 'Wharton'],
          duration: '2 years',
          cost: '₹20-50 Lakhs'
        }
      },
      futureEarning: '₹15-50+ LPA'
    },
    'Entrepreneurship': {
      icon: <Rocket className="w-6 h-6" />,
      color: 'orange',
      sectors: {
        IT: ['EdTech', 'FinTech', 'HealthTech', 'E-commerce', 'SaaS'],
        CSE: ['AI/ML Solutions', 'Blockchain', 'IoT', 'Gaming', 'Apps'],
        Civil: ['Smart City Solutions', 'Green Building', 'PropTech'],
        Mechanical: ['Manufacturing Tech', 'Automotive', 'Robotics'],
        CE: ['CleanTech', 'Water Tech', 'Waste Management', 'Renewable Energy']
      },
      funding: 'Government schemes, Angel investors, VCs',
      risk: 'High',
      potential: 'Unlimited'
    }
  };

  const handleInputChange = (field, value) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInput = (field, value) => {
    setStudentData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generateRecommendations = async () => {
    setIsGeneratingAI(true);
    let recs = [];
    
    try {
      // Use Gemini AI to generate personalized recommendations
      const aiResponse = await GeminiCareerAdvisor.generateCareerRecommendations(studentData);
      
      if (aiResponse && aiResponse.recommendations) {
        // Clean AI responses from markdown formatting
        setAiAnalysis(cleanAIResponse(aiResponse.analysis));
        setMotivationalMessage(cleanAIResponse(aiResponse.motivationalMessage));
        recs = aiResponse.recommendations;
      } else {
        // Fallback to static recommendations if AI fails
        recs = generateStaticRecommendations();
      }
    } catch (error) {
      console.error('AI recommendation failed:', error);
      // Fallback to static recommendations
      recs = generateStaticRecommendations();
    }
    
    setRecommendations(recs);
    setShowResults(true);
    setIsGeneratingAI(false);
  };

  const generateStaticRecommendations = () => {
    let recs = [];
    
    // Analyze student situation (existing logic)
    if (studentData.placementStatus === 'Not placed yet - Need guidance') {
      if (parseFloat(studentData.cgpa) >= 7.5) {
        recs.push({
          priority: 'High',
          path: 'Private Sector',
          reason: 'Your CGPA is strong for private companies',
          immediateActions: [
            'Update resume with projects and skills',
            'Practice coding on LeetCode/HackerRank',
            'Apply to off-campus drives',
            'Network on LinkedIn',
            'Prepare for technical interviews'
          ],
          timeline: '1-3 months',
          companies: careerPaths['Private Sector'].companies[studentData.branch]
        });
      }
      
      if (studentData.examsPrepared.includes('GATE')) {
        // Extract cutoffs for the specific branch
        const branchCutoffs = {};
        const examsCutoffs = careerPaths['PSU/Government'].examsCutoffs;
        
        Object.keys(examsCutoffs).forEach(exam => {
          if (examsCutoffs[exam][studentData.branch]) {
            branchCutoffs[exam] = examsCutoffs[exam][studentData.branch];
          }
        });
        
        recs.push({
          priority: 'High',
          path: 'PSU/Government',
          reason: 'GATE preparation shows government sector interest',
          immediateActions: [
            'Focus on GATE preparation',
            'Apply for PSU jobs through GATE',
            'Prepare for UPSC ESE if eligible',
            'Consider state government exams'
          ],
          timeline: '6-12 months',
          cutoffs: branchCutoffs
        });
      }
      
      recs.push({
        priority: 'Medium',
        path: 'Higher Studies',
        reason: 'Additional qualification can improve prospects',
        immediateActions: [
          'Decide between M.Tech and MBA',
          'Prepare for entrance exams',
          'Research institutions and courses',
          'Arrange recommendation letters'
        ],
        timeline: '1-2 years',
        options: careerPaths['Higher Studies'].options
      });
    }

    // Add more specific recommendations based on other factors
    if (studentData.interests.includes('Entrepreneurship')) {
      recs.push({
        priority: 'Medium',
        path: 'Entrepreneurship',
        reason: 'Your interest in starting own business',
        immediateActions: [
          'Validate your business idea',
          'Create a business plan',
          'Apply to incubators',
          'Build MVP/prototype',
          'Network with other entrepreneurs'
        ],
        timeline: '6-18 months',
        sectors: careerPaths['Entrepreneurship'].sectors[studentData.branch]
      });
    }

    return recs;
  };

  const downloadGuidePDF = () => {
    try {
      generateCareerGuidePDF(studentData, recommendations);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text file
      const content = `
Career Guidance Report for ${studentData.name}

Branch: ${studentData.branch}
CGPA: ${studentData.cgpa}
Current Status: ${studentData.placementStatus}

RECOMMENDATIONS:
${recommendations.map((rec, index) => `
${index + 1}. ${rec.path} (${rec.priority} Priority)
   Reason: ${rec.reason}
   Timeline: ${rec.timeline}
   
   Immediate Actions:
   ${rec.immediateActions.map(action => `   • ${action}`).join('\n')}
`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career_guide_${studentData.name.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadQuickChecklist = () => {
    try {
      generateQuickActionChecklist(recommendations);
    } catch (error) {
      console.error('Error generating checklist:', error);
      alert('Error generating checklist. Please try again.');
    }
  };

  const testGeminiConnection = async () => {
    try {
      const isConnected = await GeminiCareerAdvisor.testConnection();
      if (isConnected) {
        alert('✅ Gemini AI connection successful!');
      } else {
        alert('❌ Gemini AI connection failed. Please check API key.');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      alert('❌ Connection test failed: ' + error.message);
    }
  };

  const handleAIFeature = async (featureType, additionalData = '') => {
    setSelectedAIFeature(featureType);
    setAiFeatureResult('Generating AI response...');
    
    try {
      let result = '';
      
      switch (featureType) {
        case 'interview-tips':
          result = await GeminiCareerAdvisor.generateInterviewTips(studentData, additionalData);
          break;
        case 'skill-gap':
          result = await GeminiCareerAdvisor.analyzeSkillGaps(studentData, additionalData);
          break;
        case 'study-plan':
          result = await GeminiCareerAdvisor.generateStudyPlan(studentData, additionalData);
          break;
        case 'resume-improve':
          result = await GeminiCareerAdvisor.improveResume(studentData);
          break;
        case 'motivation':
          result = await GeminiCareerAdvisor.generateMotivationalSupport(studentData);
          break;
        case 'company-prep':
          result = await GeminiCareerAdvisor.generateCompanyPrep(studentData, additionalData);
          break;
        default:
          result = 'Feature not available';
      }
      
      // Clean the AI response from markdown formatting
      const cleanedResult = cleanAIResponse(result);
      setAiFeatureResult(cleanedResult);
    } catch (error) {
      console.error('AI feature error:', error);
      setAiFeatureResult('Sorry, AI service is temporarily unavailable. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <Sparkles className="mr-3 text-yellow-500" />
            🎯 AI-Powered Career Guide
            <Sparkles className="ml-3 text-yellow-500" />
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get <strong>AI-generated personalized career recommendations</strong> based on your profile, especially if you're not placed yet. 
            Our advanced Gemini AI analyzes your situation and provides tailored guidance with interview prep, skill analysis, and study plans!
          </p>
          <div className="mt-4 flex justify-center items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Brain className="mr-1 w-4 h-4 text-purple-500" />
              <span>AI Analysis</span>
            </div>
            <div className="flex items-center">
              <Target className="mr-1 w-4 h-4 text-blue-500" />
              <span>Personalized Plans</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="mr-1 w-4 h-4 text-green-500" />
              <span>Interview Prep</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && <div className={`w-16 h-1 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep}: {
              currentStep === 1 ? 'Personal Information' :
              currentStep === 2 ? 'Skills & Preferences' :
              'Career Recommendations'
            }
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="mr-3 text-blue-600" />
                Tell us about yourself
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={studentData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Engineering Branch</label>
                  <select
                    value={studentData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Year/Status</label>
                  <select
                    value={studentData.currentYear}
                    onChange={(e) => handleInputChange('currentYear', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your current status</option>
                    {currentYear.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CGPA/Percentage</label>
                  <input
                    type="number"
                    value={studentData.cgpa}
                    onChange={(e) => handleInputChange('cgpa', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 8.5 or 85"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Placement Status</label>
                <div className="space-y-2">
                  {placementStatus.map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        name="placementStatus"
                        value={status}
                        checked={studentData.placementStatus === status}
                        onChange={(e) => handleInputChange('placementStatus', e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={testGeminiConnection}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
                >
                  <Zap className="mr-2 w-4 h-4" />
                  Test AI Connection
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!studentData.name || !studentData.branch || !studentData.currentYear || !studentData.cgpa || !studentData.placementStatus}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next Step <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills & Preferences */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Target className="mr-3 text-blue-600" />
                Skills & Preferences
              </h2>

              {/* Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Technical Skills</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {skillsOptions[studentData.branch]?.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={studentData.skills.includes(skill)}
                        onChange={() => handleArrayInput('skills', skill)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Career Interests</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {interestOptions.map(interest => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={studentData.interests.includes(interest)}
                        onChange={() => handleArrayInput('interests', interest)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exams Prepared */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Exams Prepared/Planning to Prepare</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {examOptions.map(exam => (
                    <label key={exam} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={studentData.examsPrepared.includes(exam)}
                        onChange={() => handleArrayInput('examsPrepared', exam)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{exam}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Location</label>
                  <select
                    value={studentData.preferredLocation}
                    onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select preference</option>
                    <option value="Anywhere in India">Anywhere in India</option>
                    <option value="Metro Cities">Metro Cities Only</option>
                    <option value="Home State">Home State</option>
                    <option value="International">Open to International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Expectation (LPA)</label>
                  <select
                    value={studentData.salaryExpectation}
                    onChange={(e) => handleInputChange('salaryExpectation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select range</option>
                    <option value="3-6 LPA">3-6 LPA</option>
                    <option value="6-10 LPA">6-10 LPA</option>
                    <option value="10-15 LPA">10-15 LPA</option>
                    <option value="15+ LPA">15+ LPA</option>
                  </select>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell us more about your situation</label>
                <textarea
                  value={studentData.careerGoals}
                  onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="e.g., I'm in final year but haven't been placed yet. I'm confused between higher studies and job. I have prepared for GATE but also want to try for private companies..."
                />
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    generateRecommendations();
                    setCurrentStep(3);
                  }}
                  disabled={isGeneratingAI}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="flex items-center">
                        <Loader className="mr-2 w-4 h-4 animate-spin" />
                        <Sparkles className="mr-1 w-3 h-3 animate-pulse" />
                        <span>AI is analyzing your profile...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Get My AI Career Plan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Loading or Recommendations */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              {/* Show loading if generating AI */}
              {isGeneratingAI && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-500 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Creating Your Personalized Career Plan</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Our AI is analyzing your profile, skills, and career goals to create a customized roadmap just for you.
                    </p>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show results when ready */}
              {showResults && !isGeneratingAI && (
                <>
                  {/* Header with download option */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Target className="mr-3 text-green-600" />
                    Your Personalized Career Plan
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadGuidePDF}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Download Guide
                    </button>
                    <button
                      onClick={downloadQuickChecklist}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Quick Checklist
                    </button>
                    <button
                      onClick={() => {
                        navigator.share({
                          title: 'My Career Plan',
                          text: 'Check out my personalized career guidance plan!',
                          url: window.location.href
                        }).catch(() => {
                          // Fallback for browsers that don't support Web Share API
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        });
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Share2 className="mr-2 w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Hello {studentData.name}!</strong> Based on your profile and current situation, 
                    here are personalized recommendations to help you advance your career:
                  </p>
                  {motivationalMessage && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-purple-800 font-medium flex items-center">
                        <Heart className="mr-2 w-4 h-4" />
                        AI Motivation: {motivationalMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Career Path Wheel - Visual AI Analysis */}
              <CareerPathWheel recommendations={recommendations} studentData={studentData} />

              {/* Visual Analytics Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-6"
              >
                <CareerPathVisual recommendations={recommendations} />
              </motion.div>

              {/* AI Analysis Section */}
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Brain className="mr-3 text-purple-600" />
                    AI Profile Analysis
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{aiAnalysis}</p>
                </motion.div>
              )}

              {/* AI-Powered Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <Sparkles className="mr-3 text-yellow-600" />
                    AI-Powered Career Tools
                  </h3>
                  <button
                    onClick={() => setShowAIFeatures(!showAIFeatures)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center"
                  >
                    {showAIFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="ml-2">{showAIFeatures ? 'Hide' : 'Show'} AI Tools</span>
                  </button>
                </div>

                {showAIFeatures && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
                  >
                    <button
                      onClick={() => handleAIFeature('interview-tips', recommendations[0]?.path || 'Software Developer')}
                      className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="w-6 h-6 text-green-600 mb-2" />
                      <h4 className="font-semibold text-green-800">Interview Preparation</h4>
                      <p className="text-sm text-green-600">Get AI-generated interview questions and tips</p>
                    </button>

                    <button
                      onClick={() => handleAIFeature('skill-gap', recommendations[0]?.path || 'Software Developer')}
                      className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                    >
                      <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
                      <h4 className="font-semibold text-orange-800">Skill Gap Analysis</h4>
                      <p className="text-sm text-orange-600">Identify missing skills and learning path</p>
                    </button>

                    <button
                      onClick={() => handleAIFeature('study-plan', studentData.examsPrepared[0] || 'GATE')}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <BookMarked className="w-6 h-6 text-blue-600 mb-2" />
                      <h4 className="font-semibold text-blue-800">Study Plan Generator</h4>
                      <p className="text-sm text-blue-600">Personalized exam preparation schedule</p>
                    </button>

                    <button
                      onClick={() => handleAIFeature('resume-improve')}
                      className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                    >
                      <FileText className="w-6 h-6 text-purple-600 mb-2" />
                      <h4 className="font-semibold text-purple-800">Resume Optimizer</h4>
                      <p className="text-sm text-purple-600">AI suggestions to improve your resume</p>
                    </button>

                    <button
                      onClick={() => handleAIFeature('motivation')}
                      className="p-4 bg-pink-50 rounded-lg border border-pink-200 hover:bg-pink-100 transition-colors"
                    >
                      <Heart className="w-6 h-6 text-pink-600 mb-2" />
                      <h4 className="font-semibold text-pink-800">Motivation Boost</h4>
                      <p className="text-sm text-pink-600">Personalized encouragement and mindset tips</p>
                    </button>

                    <button
                      onClick={() => {
                        const company = prompt('Enter company name for specific preparation:');
                        if (company) handleAIFeature('company-prep', company);
                      }}
                      className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      <Building className="w-6 h-6 text-indigo-600 mb-2" />
                      <h4 className="font-semibold text-indigo-800">Company-Specific Prep</h4>
                      <p className="text-sm text-indigo-600">Targeted preparation for specific companies</p>
                    </button>
                  </motion.div>
                )}

                {/* AI Feature Result Display */}
                {selectedAIFeature && aiFeatureResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                  >
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Zap className="mr-2 w-4 h-4 text-blue-600" />
                      AI Response:
                    </h4>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {aiFeatureResult === 'Generating AI response...' ? (
                        <div className="flex flex-col items-center py-8">
                          <div className="relative">
                            <Loader className="w-8 h-8 animate-spin text-blue-600" />
                            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-purple-500 animate-pulse" />
                          </div>
                          <span className="mt-3 text-blue-600 font-medium animate-pulse">
                            AI is analyzing your profile...
                          </span>
                          <div className="mt-2 flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Enhanced AI Response Display */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                            {formatResponseSections(aiFeatureResult).map((section, index) => (
                              <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${section.isTitle ? 'mb-3' : 'mb-4'}`}
                              >
                                {section.isTitle ? (
                                  <h5 className="font-semibold text-gray-800 flex items-center">
                                    <Star className="mr-2 w-4 h-4 text-yellow-500" />
                                    {section.content}
                                  </h5>
                                ) : (
                                  <div className="text-gray-700 leading-relaxed pl-6 border-l-2 border-blue-300">
                                    {section.content.split('\n').map((line, lineIndex) => (
                                      <p key={lineIndex} className="mb-2">
                                        {line.startsWith('•') ? (
                                          <span className="flex items-start">
                                            <CheckCircle className="mr-2 w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{line.substring(2)}</span>
                                          </span>
                                        ) : (
                                          line
                                        )}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAIFeature(null);
                        setAiFeatureResult('');
                      }}
                      className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* Recommendations */}
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-600' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {careerPaths[rec.path]?.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{rec.path}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Timeline</div>
                      <div className="font-semibold text-gray-800">{rec.timeline}</div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{rec.reason}</p>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <CheckCircle className="mr-2 w-4 h-4 text-green-600" />
                      Immediate Action Plan:
                    </h4>
                    <ul className="space-y-2">
                      {rec.immediateActions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional details based on path type */}
                  {rec.companies && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Target Companies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.companies.slice(0, 5).map((company, companyIndex) => (
                          <span key={companyIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.cutoffs && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Exam Cutoffs for {studentData.branch}:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(rec.cutoffs).map(([exam, cutoff]) => (
                          <div key={exam} className="bg-yellow-50 p-3 rounded-lg">
                            <div className="font-medium text-yellow-800">{exam}</div>
                            <div className="text-yellow-700">{cutoff}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedOption(selectedOption === index ? null : index)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <span>View Detailed Roadmap</span>
                    {selectedOption === index ? 
                      <ChevronUp className="ml-2 w-4 h-4" /> : 
                      <ChevronDown className="ml-2 w-4 h-4" />
                    }
                  </button>

                  {selectedOption === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-blue-50 rounded-lg"
                    >
                      <h4 className="font-semibold text-blue-800 mb-3">Detailed Roadmap & Resources:</h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-blue-700">Week 1-2: Preparation</h5>
                          <ul className="text-sm text-blue-600 ml-4 list-disc">
                            <li>Research and understand the field</li>
                            <li>Update your resume and LinkedIn profile</li>
                            <li>Identify skill gaps and create learning plan</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-700">Month 1-2: Skill Building</h5>
                          <ul className="text-sm text-blue-600 ml-4 list-disc">
                            <li>Complete relevant online courses</li>
                            <li>Work on portfolio projects</li>
                            <li>Practice interview questions</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-700">Month 2-3: Application Phase</h5>
                          <ul className="text-sm text-blue-600 ml-4 list-disc">
                            <li>Apply to relevant positions/programs</li>
                            <li>Network with professionals in the field</li>
                            <li>Attend virtual events and webinars</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Emergency Resources Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="mr-3 text-orange-600" />
                  Immediate Help Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Career Counseling</h4>
                    <p className="text-sm text-gray-600 mb-2">Free counseling sessions</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      Book Session <ExternalLink className="ml-1 w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Skill Assessment</h4>
                    <p className="text-sm text-gray-600 mb-2">Identify your strengths</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      Take Test <ExternalLink className="ml-1 w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Job Alerts</h4>
                    <p className="text-sm text-gray-600 mb-2">Get notified of openings</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      Subscribe <ExternalLink className="ml-1 w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Phone className="mr-3 text-green-600" />
                  Need Personal Guidance?
                </h3>
                <p className="text-gray-600 mb-4">
                  Our career counselors are here to help you one-on-one. Schedule a free consultation session.
                </p>
                <div className="flex space-x-4">
                  <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                    <Calendar className="mr-2 w-4 h-4" />
                    Schedule Consultation
                  </button>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                    <Phone className="mr-2 w-4 h-4" />
                    Call Now: +91 99999 99999
                  </button>
                </div>
              </div>

              {/* Restart Button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setStudentData({
                      name: '', branch: '', currentYear: '', cgpa: '', skills: [],
                      interests: [], placementStatus: '', careerGoals: '', preferredLocation: '',
                      salaryExpectation: '', workPreference: '', examsPrepared: [],
                      internshipExperience: '', projects: '', certifications: []
                    });
                    setRecommendations([]);
                    setShowResults(false);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Start Over with New Profile
                </button>
              </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PersonalizedCareerGuide;