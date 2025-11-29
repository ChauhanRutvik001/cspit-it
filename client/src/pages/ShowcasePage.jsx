import { useState, useEffect, useRef } from "react";
import "./ShowcasePage.css";
import InstituteShowcase from "./InstituteShowcase";
import LogoShowcase from "./LogoShowcase"; // Import LogoShowcase

const charusatLogo = "/logo2.jpg";

// Welcome Page Component
const WelcomePage = ({ onReplayIntro }) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Dark gradient background for comfort */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 bg-black pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-center min-h-screen">
        {/* Logo centered at top, increased height */}
        <div className="w-full flex justify-center pt-10">
          <div className="w-[45rem] h-[1] border-2 flex items-center justify-center bg-black rounded-lg shadow-lg">
            <img
              src={charusatLogo}
              alt="CHARUSAT Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        {/* More space between logo and text */}
        <div className="mt-60 flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-8 px-8 max-w-4xl mx-auto">
            <h1 className="mb-10 text-4xl md:text-6xl font-black text-blue-600 tracking-wide playwrite-nz-guides-regular">
              Welcome to CHARUSAT
            </h1>
            <p className="text-base sm:text-lg  text-gray-300 max-w-3xl mx-auto md:mx-0 leading-relaxed">
              Charotar University of Science and Technology - Empowering minds, transforming futures through excellence in education and innovation.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onReplayIntro}
                className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                }}
              >
                Replay Intro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cinematic Intro Component
export const CinematicIntro = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [mainText, setMainText] = useState("");
  const [subText, setSubText] = useState("");
  const [mainTypingComplete, setMainTypingComplete] = useState(false);
  const [subTypingComplete, setSubTypingComplete] = useState(false);
  const subTypingStarted = useRef(false);

  const mainTitle = "CHARUSAT UNIVERSITY";
  const subtitle = "Charotar University of Science and Technology";

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 2000),  // Stage 1: Logo appears (2-4s)
      setTimeout(() => setStage(2), 4000),  // Stage 2: Start main text typing (4-8s)
      setTimeout(() => setStage(3), 8000),  // Stage 3: Start subtitle typing (8-12s)
      setTimeout(() => setStage(4), 13000), // Stage 4: Sanskrit shloka (13-16s) - delayed slightly
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 17000), // Complete at 17s
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Main title typing effect - only runs once
  useEffect(() => {
    if (stage >= 2 && !mainTypingComplete) {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < mainTitle.length) {
          setMainText(mainTitle.slice(0, index + 1));
          index++;
        } else {
          setMainTypingComplete(true);
          clearInterval(typeInterval);
        }
      }, 150); // 150ms per character

      return () => clearInterval(typeInterval);
    }
  }, [stage, mainTypingComplete]);

  // Subtitle typing effect - only runs once
  useEffect(() => {
    if (stage >= 3 && !subTypingStarted.current) {
      subTypingStarted.current = true;
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < subtitle.length) {
          setSubText(subtitle.slice(0, index + 1));
          index++;
        } else {
          setSubTypingComplete(true);
          clearInterval(typeInterval);
        }
      }, 80); // Slightly faster - 80ms per character

      return () => clearInterval(typeInterval);
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Dark gradient background for comfort */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 bg-black pointer-events-none"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center px-8 max-w-5xl mx-auto">
          {/* CHARUSAT Logo (2-4s) - Zoom In from 80% to 100% */}
          {stage >= 1 && (
             <div className="mt-16 text-center shloka-fade-in mb-5">
              <div className="rounded-xl p-8 "
                  //  style={{ 
                  //    borderColor: '#FFD700'
                  //  }}
                  >
                <p 
                  className="text-3xl md:text-5xl font-bold mb-4"
                  style={{ 
                    color: '#FFD700'
                  }}
                >
                  विद्या सर्वस्य भूषणम्
                </p>
                <p className="text-lg md:text-xl italic text-gray-500">
                  Knowledge is the ornament of all
                </p>
              </div>
            </div>
          )}

          {/* Main Text (4-12s) - Character by Character Typing */}
          {stage >= 2 && (
            <div className="text-center space-y-6">
              {/* Main Title - Bold, Large, Dark */}
              <h1 className="text-5xl md:text-7xl font-black text-gray-300 tracking-wide sans-serif">
                <span className="typing-cursor">
                  {mainText}
                  {stage >= 2 && !mainTypingComplete && <span className="cursor-blink-dark">|</span>}
                </span>
              </h1>

              {/* Subtitle - Cursive, Elegant, Dark */}
              {stage >= 3 && (
                <p className="text-2xl md:text-4xl italic text-gray-400">
                  <span className="typing-cursor">
                    {subText}
                    {stage >= 3 && stage < 4 && !subTypingComplete && <span className="cursor-blink-dark">|</span>}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Sanskrit Shloka (13-17s) - Golden shloka, white English */}
          {stage >= 4 && (
            <div className="mt-16 text-center shloka-fade-in space-y-8">

              {/* Dr. A P J Abdul Kalam Quote */}
              <div className="border-2 border-gray-700 rounded-xl p-6  bg-black backdrop-blur-sm shadow-xl max-w-4xl mx-auto"
                  //  style={{ 
                  //    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)'
                  //  }}
                  >
                <p className="text-lg md:text-xl text-gray-400 italic leading-relaxed mb-4">
                  "I am happy to know that CHARUSAT has a goal set for mission of social upliftment with components of knowledge acquisition and imparting education."
                </p>
                <div className="text-right">
                  <p className="text-gray-300 font-semibold text-lg">Dr A P J Abdul Kalam</p>
                  <p className="text-gray-300 text-sm">Former President of India & Architect of Missile Programme of India</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main ShowcasePage Component
const ShowcasePage = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [showInstitutes, setShowInstitutes] = useState(false);
  const [showInstituteTitle, setShowInstituteTitle] = useState(false);
  const [showInstituteGrid, setShowInstituteGrid] = useState(false);
  const [showLogoShowcase, setShowLogoShowcase] = useState(false);

  const handleReplayIntro = () => {
    setShowIntro(true);
    setShowInstitutes(false);
    setShowInstituteTitle(false);
    setShowInstituteGrid(false);
    setShowLogoShowcase(false);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    // Start showcase sequence after intro completes
    setTimeout(() => {
      setShowInstitutes(true);
      // After 5s, show institute title with slide-up animation
      setTimeout(() => {
        setShowInstituteTitle(true);
        // After 2s, show all institutes
        setTimeout(() => {
          setShowInstituteGrid(true);
        }, 2000);
      }, 5000);
    }, 0);
  };

  const handleInstitutesComplete = () => {
    setShowInstitutes(false);
    setShowInstituteTitle(false);
    setShowInstituteGrid(false);
    setShowLogoShowcase(true); // Show LogoShowcase after institutes
  };

  const handleLogoShowcaseComplete = () => {
    setShowLogoShowcase(false);
    // Show WelcomePage after LogoShowcase
    setShowIntro(false);
    setShowInstitutes(false);
    setShowInstituteTitle(false);
    setShowInstituteGrid(false);
    // If you want to show InstituteShowcase again, use:
    // setShowInstitutes(true);
    // setShowInstituteTitle(true);
    // setShowInstituteGrid(true);
  };

  // Automatically proceed to LogoShowcase after grid is shown for 3 seconds
  useEffect(() => {
    if (showInstitutes && showInstituteGrid) {
      const timer = setTimeout(() => {
        handleInstitutesComplete();
      }, 3000); // Show grid for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showInstitutes, showInstituteGrid]);

  return (
    <>
      {showLogoShowcase ? (
        <LogoShowcase onComplete={handleLogoShowcaseComplete} />
      ) : showInstitutes ? (
        <InstituteShowcase
          onComplete={handleInstitutesComplete}
          showTitle={showInstituteTitle}
          showGrid={showInstituteGrid}
        />
      ) : showIntro ? (
        <CinematicIntro onComplete={handleIntroComplete} />
      ) : (
        <WelcomePage onReplayIntro={handleReplayIntro} />
      )}
    </>
  );
};

export default ShowcasePage;
