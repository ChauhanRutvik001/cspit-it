import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Briefcase,
  GraduationCap,
  Users,
  Award,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  ExternalLink,
  Rocket,
  X,
  TrendingUp,
  BookOpen,
  Building,
  Globe,
  Filter,
  ArrowRight,
  Target,
  DollarSign,
  Trophy,
  Users2,
  Building2,
  Lightbulb,
  CheckCircle,
  Download,
  Share2,
  BarChart3,
  Clock,
  FileText,
  Zap,
  ArrowDown,
  Calculator,
  Percent,
  Star,
} from "lucide-react";


const CareerGuidanceSection = () => {
  const [selectedBranch, setSelectedBranch] = useState("IT");
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedInterest, setSelectedInterest] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [userGPA, setUserGPA] = useState("");

  const branches = ["IT", "CSE", "Civil", "Mechanical", "CE"];
  const interests = ["Research", "Field Job", "Management", "Start-up"];

  // TODO: Update cutoff data annually - Last updated: 2025
  const cutoffData = {
    IT: {
      government: { gate: "720-760", ese: "740/1300", gpsc: "650-700" },
      study: { gate: "600+", gre: "320+", ielts: "7.0+" },
      private: { cgpa: "7.5+", skills: "Programming, Cloud, AI/ML" }
    },
    CSE: {
      government: { gate: "750-800", ese: "760/1300", gpsc: "680-720" },
      study: { gate: "650+", gre: "325+", ielts: "7.5+" },
      private: { cgpa: "8.0+", skills: "DSA, System Design, DevOps" }
    },
    Civil: {
      government: { gate: "740-780", ese: "756/1300", gpsc: "620-660" },
      study: { gate: "580+", gre: "315+", ielts: "6.5+" },
      private: { cgpa: "7.0+", skills: "AutoCAD, Revit, Project Management" }
    },
    Mechanical: {
      government: { gate: "750-790", ese: "745/1300", gpsc: "640-680" },
      study: { gate: "590+", gre: "318+", ielts: "7.0+" },
      private: { cgpa: "7.2+", skills: "CAD, Simulation, Manufacturing" }
    },
    CE: {
      government: { gate: "730-770", ese: "750/1300", gpsc: "610-650" },
      study: { gate: "570+", gre: "312+", ielts: "6.5+" },
      private: { cgpa: "7.0+", skills: "Environmental Tech, Project Planning" }
    }
  };

  // TODO: Add/Update official links here
  const officialLinks = {
    government: {
      gate: "https://gate.iitm.ac.in/",
      ese: "https://www.upsc.gov.in/",
      gpsc: "https://gpsc.gujarat.gov.in/",
      psus: "https://www.psuconnect.in/"
    },
    study: {
      gate: "https://gate.iitm.ac.in/",
      gre: "https://www.ets.org/gre",
      ielts: "https://www.ielts.org/",
      universities: "https://www.universitygrants.gov.in/"
    },
    private: {
      placement: "https://www.naukri.com/",
      internships: "https://internshala.com/",
      skills: "https://www.coursera.org/"
    },
    startup: {
      funding: "https://startupindia.gov.in/",
      incubators: "https://www.startupindia.gov.in/content/sih/en/ams.html",
      competitions: "https://www.startupindia.gov.in/"
    }
  };

  const careerPaths = [
    {
      id: 1,
      title: "Government/PSU Jobs",
      icon: <Building className="w-8 h-8" />,
      description: "Secure government positions and PSU opportunities",
      gradient: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      details: {
        [selectedBranch]: {
          overview: "Government and PSU jobs offer job security, good work-life balance, and opportunities to serve the nation.",
          exams: ["GATE", "UPSC ESE", "GPSC", "SSC JE", "Railway Recruitment"],
          cutoffs: cutoffData[selectedBranch]?.government,
          institutions: selectedBranch === "Civil" ? 
            ["CPWD", "PWD", "Indian Railways", "NHAI", "Municipal Corporations", "State PWDs"] :
            selectedBranch === "Mechanical" ?
            ["BHEL", "SAIL", "Indian Oil", "NTPC", "HAL", "DRDO"] :
            ["BSNL", "RAILTEL", "C-DOT", "CDAC", "NIC", "Government IT Departments"],
          process: [
            "GATE Qualification (for PSUs)",
            "Written Exam + Interview",
            "Document Verification",
            "Medical Examination",
            "Final Selection"
          ],
          salary: "₹6-15 LPA + Benefits + Job Security",
          links: [
            { title: "GATE Official", url: officialLinks.government.gate },
            { title: "UPSC ESE", url: officialLinks.government.ese },
            { title: "GPSC Portal", url: officialLinks.government.gpsc }
          ]
        }
      }
    },
    {
      id: 2,
      title: "Further Study",
      icon: <GraduationCap className="w-8 h-8" />,
      description: "Pursue higher education and research opportunities",
      gradient: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      details: {
        [selectedBranch]: {
          overview: "Higher education opens doors to research, specialization, and better career prospects.",
          exams: ["GATE (M.Tech)", "GRE (MS abroad)", "IELTS/TOEFL", "CAT (MBA)", "University Entrance"],
          cutoffs: cutoffData[selectedBranch]?.study,
          institutions: [
            "IIT Bombay", "IIT Delhi", "IIT Madras", "NIT Trichy", "BITS Pilani",
            "Stanford", "MIT", "CMU", "IIM Ahmedabad", "IIM Bangalore"
          ],
          process: [
            "Entrance Exam Preparation",
            "Application Submission",
            "Shortlisting based on scores",
            "Interview/GD (if applicable)",
            "Final Admission"
          ],
          salary: "₹12-25 LPA (M.Tech), ₹25-50 LPA (MBA), $80k-150k (MS abroad)",
          links: [
            { title: "GATE Registration", url: officialLinks.study.gate },
            { title: "GRE Information", url: officialLinks.study.gre },
            { title: "IELTS Guide", url: officialLinks.study.ielts }
          ]
        }
      }
    },
    {
      id: 3,
      title: "Private Sector & Industry",
      icon: <Briefcase className="w-8 h-8" />,
      description: "Join leading companies and build industry expertise",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      details: {
        [selectedBranch]: {
          overview: "Private sector offers innovation, growth opportunities, and competitive compensation.",
          exams: ["Campus Placements", "Online Assessments", "Technical Interviews", "Coding Rounds"],
          cutoffs: cutoffData[selectedBranch]?.private,
          institutions: selectedBranch === "Civil" ?
            ["L&T", "Tata Projects", "Godrej Properties", "DLF", "Shapoorji Pallonji"] :
            selectedBranch === "Mechanical" ?
            ["Tata Motors", "Mahindra", "Bajaj Auto", "Maruti Suzuki", "Bosch"] :
            ["TCS", "Infosys", "Google", "Microsoft", "Amazon", "Flipkart"],
          process: [
            "Resume Shortlisting",
            "Online Assessment",
            "Technical Interview Rounds",
            "HR Interview",
            "Offer Letter"
          ],
          salary: "₹4-50+ LPA (Based on company and role)",
          links: [
            { title: "Job Portals", url: officialLinks.private.placement },
            { title: "Internships", url: officialLinks.private.internships },
            { title: "Skill Development", url: officialLinks.private.skills }
          ]
        }
      }
    },
    {
      id: 4,
      title: "Entrepreneurship/Startup",
      icon: <Rocket className="w-8 h-8" />,
      description: "Build innovative solutions and create your own venture",
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      details: {
        [selectedBranch]: {
          overview: "Entrepreneurship allows you to innovate, solve problems, and create value while building your own company.",
          exams: ["No formal exams", "Pitch Competitions", "Business Plan Contests", "Accelerator Programs"],
          cutoffs: { ideas: "Innovative", funding: "₹10L-50Cr", validation: "Market Ready" },
          institutions: [
            "IIT Incubators", "IIM CIIE", "T-Hub", "SINE IIT Bombay",
            "Startup India", "NASSCOM 10000 Startups", "Microsoft Accelerator"
          ],
          process: [
            "Idea Generation & Validation",
            "Business Plan Development",
            "Prototype/MVP Creation",
            "Funding & Investment",
            "Scaling & Growth"
          ],
          salary: "₹0 to ₹50+ Crores (Highly variable based on success)",
          links: [
            { title: "Startup India", url: officialLinks.startup.funding },
            { title: "Incubators", url: officialLinks.startup.incubators },
            { title: "Competitions", url: officialLinks.startup.competitions }
          ]
        }
      }
    }
  ];

  // Eligibility calculator
  const calculateEligibility = () => {
    if (!userGPA) return 0;
    const gpa = parseFloat(userGPA);
    if (gpa >= 8.5) return 90;
    if (gpa >= 7.5) return 75;
    if (gpa >= 6.5) return 60;
    if (gpa >= 5.5) return 40;
    return 20;
  };

  const getRecommendation = () => {
    if (!selectedInterest || !selectedBranch) return null;
    
    const recommendations = {
      Research: `For ${selectedBranch} research career, focus on GATE preparation (target: ${cutoffData[selectedBranch]?.study?.gate}) for M.Tech in top IITs/NITs, then pursue PhD. Consider GRE (${cutoffData[selectedBranch]?.study?.gre}) for foreign universities.`,
      "Field Job": `${selectedBranch} field opportunities are abundant in government sector. Target GATE score of ${cutoffData[selectedBranch]?.government?.gate} for PSUs and prepare for GPSC (${cutoffData[selectedBranch]?.government?.gpsc}) for state government positions.`,
      Management: `With ${selectedBranch} background, gain 2-3 years work experience first, then prepare for CAT/XAT for top MBA programs. Technical + Management combination is highly valued in industry.`,
      "Start-up": `${selectedBranch} offers great startup opportunities. Focus on building practical skills, create prototypes, participate in hackathons, and join incubators. Leverage your technical expertise to solve real problems.`
    };
    
    return recommendations[selectedInterest];
  };

  const generatePlan = () => {
    // TODO: Integrate with PDF generation library (like jsPDF) for downloadable plans
    const plan = {
      branch: selectedBranch,
      interest: selectedInterest,
      recommendation: getRecommendation(),
      eligibility: calculateEligibility(),
      timeline: "6-24 months based on chosen path"
    };
    
    // For now, show modal with plan details
    return plan;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Target size={24} />
            <span className="font-semibold text-lg">Post-Engineering Career Navigator</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Engineering Career Path
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Personalized guidance for Indian engineering graduates. Select your branch and explore tailored career opportunities with detailed exam requirements, cutoffs, and selection processes.
          </p>

          {/* Branch Selection Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-4xl mx-auto mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Your Engineering Branch</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {branches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => setSelectedBranch(branch)}
                  className={`p-4 rounded-xl font-semibold transition-all duration-300 ${
                    selectedBranch === branch
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:border-blue-200"
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>

            {/* Eligibility Calculator */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator size={20} className="text-blue-600" />
                Eligibility Calculator
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your CGPA/Percentage:
                  </label>
                  <input
                    type="number"
                    value={userGPA}
                    onChange={(e) => setUserGPA(e.target.value)}
                    placeholder="e.g., 8.5 or 85%"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                {userGPA && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{calculateEligibility()}%</div>
                    <div className="text-sm text-gray-600">Eligibility Score</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${calculateEligibility()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interest Filter */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">What interests you most?</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterest(interest)}
                    className={`p-3 rounded-lg font-medium transition-all duration-300 ${
                      selectedInterest === interest
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Career Path Cards - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {careerPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${index % 2 === 0 ? 'md:mr-4' : 'md:ml-4'}`}
            >
              <div
                className={`${path.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 h-full`}
                onClick={() => setSelectedModal(path)}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${path.gradient} flex items-center justify-center text-white mb-6`}>
                  {path.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {path.title}
                </h3>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  {path.description}
                </p>

                {/* Branch-specific preview */}
                <div className="bg-white/50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">For {selectedBranch} Branch:</h4>
                  <div className="text-sm text-gray-700">
                    {path.id === 1 && `GATE Target: ${cutoffData[selectedBranch]?.government?.gate}`}
                    {path.id === 2 && `Study Requirements: ${cutoffData[selectedBranch]?.study?.gate} (GATE)`}
                    {path.id === 3 && `Industry Requirements: ${cutoffData[selectedBranch]?.private?.cgpa} CGPA`}
                    {path.id === 4 && "Focus on innovation and practical skills"}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-blue-600 font-semibold">
                    Explore Details <ArrowRight size={16} className="ml-2" />
                  </div>
                  <div className="text-2xl">
                    {path.id === 1 && "🏛️"}
                    {path.id === 2 && "🎓"}
                    {path.id === 3 && "💼"}
                    {path.id === 4 && "🚀"}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Visual Roadmap/Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-xl mb-16 border border-gray-100"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Your Career Journey Roadmap
          </h3>
          
          {/* Timeline for mobile and desktop */}
          <div className="relative">
            {/* Desktop Timeline */}
            <div className="hidden md:block">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full transform -translate-y-1/2"></div>
              <div className="relative flex justify-between items-center">
                {[
                  { title: "Engineering Degree", desc: `${selectedBranch} Graduate`, icon: "🎓" },
                  { title: "Choose Path", desc: "Select career direction", icon: "🎯" },
                  { title: "Prepare & Excel", desc: "Exams/Skills/Portfolio", icon: "📚" },
                  { title: "Success & Growth", desc: "Achieve your goals", icon: "🏆" }
                ].map((stage, index) => (
                  <div key={index} className="flex flex-col items-center relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                      {stage.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center max-w-32">
                      {stage.title}
                    </h4>
                    <p className="text-gray-600 text-center text-sm max-w-32">
                      {stage.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden space-y-6">
              {[
                { title: "Engineering Degree", desc: `${selectedBranch} Graduate`, icon: "🎓" },
                { title: "Choose Path", desc: "Select career direction", icon: "🎯" },
                { title: "Prepare & Excel", desc: "Exams/Skills/Portfolio", icon: "📚" },
                { title: "Success & Growth", desc: "Achieve your goals", icon: "🏆" }
              ].map((stage, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {stage.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {stage.desc}
                    </p>
                  </div>
                  {index < 3 && (
                    <ArrowDown className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Generate My Plan Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-4">Generate My Personalized Career Plan</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Get a customized roadmap based on your branch ({selectedBranch}) and interests
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => setShowPlanModal(true)}
              disabled={!selectedInterest}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                selectedInterest
                  ? "bg-white text-blue-600 hover:bg-gray-50 shadow-lg transform hover:scale-105"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              <Target size={20} />
              Generate My Plan
            </button>
            
            <button
              onClick={() => {
                // TODO: Implement PDF download functionality
                alert("PDF download feature coming soon!");
              }}
              className="px-8 py-4 rounded-xl font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-all duration-300 flex items-center gap-3"
            >
              <Download size={20} />
              Download PDF Guide
            </button>
            
            <button
              onClick={() => {
                // TODO: Implement sharing functionality
                if (navigator.share) {
                  navigator.share({
                    title: 'Post-Engineering Career Navigator',
                    text: `Check out this career guidance for ${selectedBranch} engineering graduates!`,
                    url: window.location.href
                  });
                }
              }}
              className="px-8 py-4 rounded-xl font-semibold bg-purple-500 text-white hover:bg-purple-400 transition-all duration-300 flex items-center gap-3"
            >
              <Share2 size={20} />
              Share Guide
            </button>
          </div>

          {selectedInterest && selectedBranch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-xl p-6 backdrop-blur-sm"
            >
              <h4 className="text-xl font-semibold mb-3">Quick Recommendation:</h4>
              <p className="text-blue-100 text-left">{getRecommendation()}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Detailed Career Path Modal */}
      {selectedModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setSelectedModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-6xl max-h-[90vh] overflow-y-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedModal.gradient} flex items-center justify-center text-white`}>
                  {selectedModal.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{selectedModal.title}</h3>
                  <p className="text-gray-600">For {selectedBranch} Engineering</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedModal(null)}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Overview
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedModal.details[selectedBranch]?.overview}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-green-600" />
                    Required Exams
                  </h4>
                  <ul className="space-y-3">
                    {selectedModal.details[selectedBranch]?.exams.map((exam, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        <span>{exam}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-yellow-600" />
                    Cutoffs & Requirements (2025)
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedModal.details[selectedBranch]?.cutoffs || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-700 capitalize">{key}:</span>
                        <span className="font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={20} className="text-purple-600" />
                    Top Organizations/Institutions
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedModal.details[selectedBranch]?.institutions.map((institution, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 text-gray-700 font-medium shadow-sm">
                        {institution}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    Selection Process
                  </h4>
                  <ol className="space-y-3">
                    {selectedModal.details[selectedBranch]?.process.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-emerald-600" />
                    Expected Compensation
                  </h4>
                  <p className="text-emerald-700 font-semibold text-lg">{selectedModal.details[selectedBranch]?.salary}</p>
                </div>
              </div>
            </div>

            {/* External Links Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink size={20} className="text-indigo-600" />
                Official Resources & Links
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedModal.details[selectedBranch]?.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-50 hover:bg-indigo-100 rounded-lg p-4 text-indigo-600 font-medium transition-all duration-300 flex items-center justify-between group"
                  >
                    <span>{link.title}</span>
                    <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Personalized Plan Modal */}
      {showPlanModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPlanModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Personalized Career Plan</h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Branch:</span>
                    <span className="ml-2 font-semibold text-blue-600">{selectedBranch}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Interest:</span>
                    <span className="ml-2 font-semibold text-purple-600">{selectedInterest}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Eligibility Score:</span>
                    <span className="ml-2 font-semibold text-green-600">{calculateEligibility()}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timeline:</span>
                    <span className="ml-2 font-semibold text-orange-600">6-24 months</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Recommendation</h4>
                <p className="text-gray-700 leading-relaxed">{getRecommendation()}</p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    // TODO: Implement PDF generation
                    alert("PDF generation feature will be implemented using libraries like jsPDF or react-pdf");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                >
                  <Download size={20} />
                  Download PDF Plan
                </button>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default CareerGuidanceSection;