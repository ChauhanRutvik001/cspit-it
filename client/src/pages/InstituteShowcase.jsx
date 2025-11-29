import { useEffect } from "react";

const InstituteShowcase = ({ onComplete, showTitle, showGrid }) => {
  const institutes = [
    {
      name: "CSPIT",
      fullName: "Chandubhai S. Patel Institute of Technology",
      animation: "slide-left",
      description: "Engineering Excellence",
      image: "/cspit.jpg", // Using placeholder image
      colors: {
        primary: "#1e40af", // Blue
        secondary: "#3b82f6",
        accent: "#dbeafe",
        text: "#1e3a8a"
      }
    },
    {
      name: "DEPSTAR",
      fullName: "Devang Patel Institute of Advance Technology and Research",
      animation: "slide-right",
      description: "Innovation & Research",
      image: "/depstar.png", // Using placeholder image
      colors: {
        primary: "#059669", // Green
        secondary: "#10b981",
        accent: "#d1fae5",
        text: "#065f46"
      }
    },
    {
      name: "IIIM",
      fullName: "Indukaka Ipcowala Institute of Management",
      animation: "zoom-in",
      description: "Management Leadership",
      image: "/iiim.png", // Using placeholder image
      colors: {
        primary: "#dc2626", // Red
        secondary: "#ef4444",
        accent: "#fee2e2",
        text: "#991b1b"
      }
    },
    {
      name: "PDPIAS",
      fullName: "P. D. Patel Institute of Applied Sciences",
      animation: "fade-in",
      description: "Applied Sciences",
      image: "/pdpias.jpg", // Using placeholder image
      colors: {
        primary: "#7c3aed", // Purple
        secondary: "#8b5cf6",
        accent: "#ede9fe",
        text: "#5b21b6"
      }
    },
    {
      name: "CMPICA",
      fullName: "College of Management & Computer Application",
      animation: "float-up",
      description: "Digital Innovation",
      image: "/CMPICA.jpg", // Using placeholder image
      colors: {
        primary: "#ea580c", // Orange
        secondary: "#f97316",
        accent: "#fed7aa",
        text: "#c2410c"
      }
    },
    {
      name: "RPCP",
      fullName: "Ramanbhai Patel College of Pharmacy",
      animation: "slide-bottom",
      description: "Pharmaceutical Sciences",
      image: "/rpcp.jpg", // Using placeholder image
      colors: {
        primary: "#0891b2", // Cyan
        secondary: "#06b6d4",
        accent: "#cffafe",
        text: "#155e75"
      }
    },
    {
      name: "MTIN",
      fullName: "Maliba Pharmacy College",
      animation: "slide-diagonal",
      description: "Healthcare Excellence",
      image: "/mtin.jpg", // Using placeholder image
      colors: {
        primary: "#be185d", // Pink
        secondary: "#ec4899",
        accent: "#fce7f3",
        text: "#9d174d"
      }
    },
    {
      name: "ARIP",
      fullName: "Ashok & Rita Patel Institute of Integrated Study & Research",
      animation: "rotate-settle",
      description: "Integrated Studies",
      image: "/arip.jpg", // Using placeholder image
      colors: {
        primary: "#374151", // Gray
        secondary: "#6b7280",
        accent: "#f3f4f6",
        text: "#111827"
      }
    }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden font-sans">
      {/* Enhanced Background with Gradient and Overlay */}
      <div className="absolute inset-0 bg-black transition-opacity duration-[2000ms] opacity-100">
        {/* Soft colored overlay for comfort */}
        <div className="absolute inset-0 bg-black pointer-events-none"></div>
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)' }}></div>
        
        {/* Title Section with Slide-Up Animation */}
        {showTitle && (
          <div className="text-center mt-10 mb-12 pt- relative z-10 animate-institute-title">
            <div className="inline-block">
              <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wider mb-4 drop-shadow-sm">
                CHARUSAT
              </h1>
              <p className="text-xl lg:text-2xl font-semibold text-gray-600 tracking-wide">
                Constituent Institutes
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Institute Grid Layout */}
        {showGrid && (
          <div className="w-full h-screen overflow-y-auto p-8">
            <div className="w-full max-w-[100rem] mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {institutes.map((institute, index) => (
                  <div
                    key={institute.name}
                    className=" bg-black backdrop-blur-sm rounded-3xl p-2 text-left transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-3 min-h-[200px] w-full relative overflow-hidden transform opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'forwards',
                      // border:"2px solid red"
                      // border:"1px solid blue"
                    }}
                  >
                    {/* Gradient Border Effect */}
                    {/* <div className="absolute inset-0 rounded-3xl opacity-0  transition-opacity duration-500 "></div> */}
                    
                    <div className="flex items-center gap-5 relative z-10 h-full">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-white  rounded-2xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <img 
                            src={institute.image} 
                            alt={`${institute.name} logo`}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center space-y-2">
                        {/* Institute name box with black bg, white text, white border */}
                        <div className="bg-white border border-white/70 rounded-lg px-4 py-2 mb-2">
                          <h3 className="text-xl font-black text-black leading-tight">
                            {institute.name}
                          </h3>
                        </div>
                        <p className="text-sm text-indigo-600 font-semibold mb-2">{institute.description}</p>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{institute.fullName}</p>
                      </div>
                    </div>
                    
                    {/* Decorative Corner Element */}
                    {/* <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-200/30 to-transparent rounded-bl-3xl rounded-tr-3xl"></div> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9) rotateX(10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes slideUpTitle {
          from {
            opacity: 0;
            transform: translateY(80px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-institute-title {
          animation: slideUpTitle 1s cubic-bezier(0.77,0,0.175,1) forwards;
        }
      `}</style>
    </div>
  );
};

export default InstituteShowcase;