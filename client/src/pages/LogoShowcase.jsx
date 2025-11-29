import { useState, useEffect } from "react";

const LogoShowcase = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [imagePhase, setImagePhase] = useState("appearing");

  const departmentImages = [
    {
      src: "/img1.jpeg",
      title: "CHARUSAT Campus Pride",
      description: "Faculty and staff celebrating unity and pride at CHARUSAT.",
      finalPosition: { side: "left", vertical: "top" },
    },
    {
      src: "/img2.jpeg",
      title: "CSPIT-IT Cricket Squad",
      description: "The CSPIT IT Department cricket team representing the spirit of SPORAL.",
      finalPosition: { side: "right", vertical: "top" },
    },
    {
      src: "/img3.jpeg",
      title: "Collaborative Learning Session",
      description: "Students participating in an engaging group discussion activity.",
      finalPosition: { side: "left", vertical: "bottom" },
    },
    {
      src: "/img4.jpeg",
      title: "CHARUSAT Alumni Reunion",
      description: "Alumni and faculty reconnecting and celebrating shared memories at CHARUSAT.",
      finalPosition: { side: "right", vertical: "bottom" },
    },
    {
      src: "/img5.jpeg",
      title: "SPORAL 2024 Champions",
      description: "A victorious moment capturing the SPORAL 2024 championship team.",
      finalPosition: { side: "center", vertical: "center" },
    },
  ];

  // Timeline stages
  useEffect(() => {
    if (stage === 0) {
      const timeline = [
        { stage: 1, delay: 500 },
        { stage: 2, delay: 2000 },
        { stage: 3, delay: 3000 },
        { stage: 4, delay: 5000 },
        { stage: 5, delay: 6000 },
      ];

      const timeouts = timeline.map(({ stage, delay }) =>
        setTimeout(() => setStage(stage), delay)
      );

      return () => timeouts.forEach((timeout) => clearTimeout(timeout));
    }
  }, []);

  // Image sequence with smooth slide animation
  useEffect(() => {
    if (stage === 5) {
      const showNextImage = (i) => {
        if (i < departmentImages.length) {
          setCurrentImageIndex(i);
          setImagePhase("appearing");

          setTimeout(() => setImagePhase("staying"), 900); // Center pause

          const moveDelay = i === departmentImages.length - 1 ? 3500 : 2500;

          setTimeout(() => {
            setImagePhase("moving");

            if (i < departmentImages.length - 1) {
              setTimeout(() => showNextImage(i + 1), 1200); // Next image after slide
            }
          }, moveDelay);
        }
      };

      showNextImage(0);
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 font-sans overflow-hidden">
      {/* Enhanced background gradient and overlay */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 bg-black pointer-events-none"></div>

      {/* CSPIT Logo */}
      <div
        className={`absolute transition-all duration-[1500ms] ease-out transform z-30 ${
          stage === 0
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95"
            : stage === 1
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 scale-100"
            : stage <= 3
            ? "top-20 left-1/2 -translate-x-1/2 opacity-100 scale-90"
            : "top-6 left-6 -translate-x-0 -translate-y-0 opacity-100 scale-75"
        }`}
      >
        <div
          className={`relative ${
            stage >= 1 ? "animate-[fadeInGlow_1s_ease-out]" : ""
          }`}
        >
          <div
            className={`bg-white rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden transition-all duration-1000 ${
              stage >= 4 ? "w-20 h-20" : "w-32 h-32"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-indigo-50 opacity-60"></div>

            <div
              className={`relative z-10 rounded-2xl overflow-hidden transition-all duration-1000 ${
                stage >= 4 ? "w-14 h-14" : "w-20 h-20"
              }`}
            >
              <img
                src="/cspit.jpg"
                className="w-full h-full object-cover rounded-xl"
                alt="CSPIT Logo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* IT Department Text */}
      <div
        className={`absolute transition-all duration-[1500ms] text-center z-20 ${
          stage >= 4
            ? "bottom-16 left-1/2 -translate-x-1/2 opacity-100"
            : stage >= 3
            ? "bottom-20 left-1/2 -translate-x-1/2 opacity-100"
            : "bottom-20 left-1/2 -translate-x-1/2 opacity-0"
        }`}
      >
        <h1
          className={`font-black text-gray-400 tracking-wide transition-all ${
            stage >= 4 ? "text-3xl lg:text-4xl" : "text-4xl lg:text-5xl"
          }`}
        >
          INFORMATION TECHNOLOGY
        </h1>
        <h2
          className={`font-bold text-gray-700 mt-2 tracking-wider transition-all ${
            stage >= 4 ? "text-lg lg:text-xl" : "text-xl lg:text-2xl"
          }`}
        >
          DEPARTMENT
        </h2>

        <div
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-6 rounded-full transition-all ${
            stage >= 4 ? "w-40 h-1.5" : "w-32 h-1"
          }`}
        ></div>
      </div>

      {/* MAIN IMAGE SEQUENCE */}
      {stage >= 5 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated Image: Center to Final Position */}
          {currentImageIndex >= 0 && (
            (() => {
              const img = departmentImages[currentImageIndex];
              const { side, vertical } = img.finalPosition;

              // Center position
              let centerStyle = {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 1.2s cubic-bezier(0.77,0,0.175,1)',
                zIndex: 40,
                boxShadow: '0 8px 32px rgba(60,60,60,0.12)',
              };

              // Final position
              let finalStyle = {};
              if (side === 'center') {
                finalStyle = {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                };
              } else {
                finalStyle = {
                  left: side === 'left' ? '2.5rem' : 'calc(100% - 2.5rem - 380px)',
                  top: vertical === 'top' ? '6rem' : 'calc(100% - 6rem - 250px)',
                  transform: 'none',
                };
              }

              // Animation phase
              let style = centerStyle;
              if (imagePhase === 'moving') {
                style = { ...centerStyle, ...finalStyle };
              }

              return (
                <div
                  style={style}
                  className="absolute transition-all duration-[1200ms] ease-in-out z-40 flex items-center justify-center"
                >
                  <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-center w-[400px] h-[340px]">
                    <img
                      src={img.src}
                      className="w-full h-[220px] object-cover rounded-t-3xl"
                      alt={img.title}
                    />
                    <div className="absolute top-0 left-0 w-full h-[180px] bg-gradient-to-b from-white/60 via-white/10 to-transparent pointer-events-none rounded-t-3xl"></div>
                    <div className="px-6 py-4 w-full flex flex-col items-center justify-center">
                      <h3 className="text-xl font-black text-gray-300 text-center drop-shadow-sm">
                        {img.title}
                      </h3>
                      <p className="text-gray-500 mt-2 text-center text-base">
                        {img.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Previously placed images at final positions */}
          {departmentImages.map((img, i) => {
            if (i >= currentImageIndex) return null;
            const { side, vertical } = img.finalPosition;
            let pos = {};
            if (side === 'center') {
              pos = {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              };
            } else {
              pos = {
                left: side === 'left' ? '2.5rem' : 'calc(100% - 2.5rem - 380px)',
                top: vertical === 'top' ? '6rem' : 'calc(100% - 6rem - 250px)',
                transform: 'none',
              };
            }
            return (
              <div
                key={i}
                style={pos}
                className="absolute mt-6 transition-all duration-[1200ms] ease-in-out z-20 bg-balck rounded-2xl shadow-xl overflow-hidden w-[380px] h-[250px]"
              >
                <img
                  src={img.src}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-400">
                    {img.title}
                  </h3>
                  <p className="text-sm text-gray-600">{img.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Continue Button */}
      {stage >= 5 &&
        currentImageIndex >= 4 &&
        imagePhase === "moving" && (
          <button
            onClick={onComplete}
            className="absolute bottom-10 right-10 bg-white border border-gray-300 text-gray-800 px-8 py-3 rounded-full shadow-lg hover:shadow-2xl transition-all z-50"
          >
            Continue
          </button>
        )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInGlow {
          0% {
            opacity: 0;
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LogoShowcase;
