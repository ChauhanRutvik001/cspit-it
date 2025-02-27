import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Briefcase,
  Rocket,
  TrendingUp,
  Users,
  Star,
  Award,
  Target,
} from "lucide-react";

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = clientX / window.innerWidth - 0.5;
      const moveY = clientY / window.innerHeight - 0.5;
      setMousePosition({ x: moveX, y: moveY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    controls.start({
      rotateY: mousePosition.x * 20,
      rotateX: -mousePosition.y * 20,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
  }, [mousePosition, controls]);

  // Generate random particles
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <section className="relative min-h-screen overflow-hidden py-20 px-4 sm:px-6 lg:px-8 flex justify-center items-center bg-white">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 128, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 128, 0, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Animated particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-orange-300 to-amber-300"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -300],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [particle.opacity, 0],
              scale: [1, Math.random() * 0.5 + 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}

        {/* Glowing orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255, 128, 0, 0.2) 0%, rgba(255, 128, 0, 0) 70%)`,
              width: 300 + i * 100,
              height: 300 + i * 100,
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center">
        {/* Left Content */}
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            {/* Advanced 3D Rotating Icon Section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center md:justify-start mb-10"
            >
              <div className="relative w-32 h-32">
                {/* Glowing background effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Orbiting small spheres */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const radius = 60;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full bg-orange-400"
                      style={{
                        left: "50%",
                        top: "50%",
                        marginLeft: -1.5,
                        marginTop: -1.5,
                      }}
                      animate={{
                        x: [x, -y, -x, y, x],
                        y: [y, x, -y, -x, y],
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "linear",
                      }}
                    />
                  );
                })}

                {/* 3D Floating Hexagon */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    rotateY: [0, 360],
                    rotateX: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div
                    className="relative w-24 h-24"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Main cube */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={controls}
                    >
                      {/* Front face */}
                      <motion.div
                        className="absolute w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center"
                        style={{
                          transform: "translateZ(2.5rem)",
                          boxShadow: "0 0 20px rgba(249, 115, 22, 0.5)",
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Rocket
                          size={32}
                          className="text-white drop-shadow-lg"
                        />
                      </motion.div>

                      {/* Back face */}
                      <motion.div
                        className="absolute w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center"
                        style={{
                          transform: "rotateY(180deg) translateZ(2.5rem)",
                          boxShadow: "0 0 20px rgba(249, 115, 22, 0.5)",
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Briefcase
                          size={32}
                          className="text-white drop-shadow-lg"
                        />
                      </motion.div>

                      {/* Left face */}
                      <motion.div
                        className="absolute w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center"
                        style={{
                          transform: "rotateY(-90deg) translateZ(2.5rem)",
                          boxShadow: "0 0 20px rgba(249, 115, 22, 0.5)",
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <TrendingUp
                          size={32}
                          className="text-white drop-shadow-lg"
                        />
                      </motion.div>

                      {/* Right face */}
                      <motion.div
                        className="absolute w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center"
                        style={{
                          transform: "rotateY(90deg) translateZ(2.5rem)",
                          boxShadow: "0 0 20px rgba(249, 115, 22, 0.5)",
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Users
                          size={32}
                          className="text-white drop-shadow-lg"
                        />
                      </motion.div>

                      {/* Top face */}
                      <motion.div
                        className="absolute w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
                        style={{
                          transform: "rotateX(90deg) translateZ(2.5rem)",
                          boxShadow: "0 0 20px rgba(249, 115, 22, 0.5)",
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Star size={32} className="text-white drop-shadow-lg" />
                      </motion.div>

                      {/* Bottom face */}
                      <motion.div
                        className="absolute w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center"
                        style={{
                          transform: "rotateX(-90deg) translateZ(2.5rem)",
                          boxShadow: "0 0 20px rgba(249, 115, 22, 0.5)",
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Target
                          size={32}
                          className="text-white drop-shadow-lg"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Glowing shadow */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-orange-500/30 rounded-full blur-xl"
                  animate={{
                    width: ["4rem", "5rem", "4rem"],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Main Heading with animated gradient */}
            <div className="relative">
              <motion.div
                className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 opacity-20 blur-xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-4 leading-tight tracking-tight"
              >
                Unlock Your Future with <br className="hidden sm:inline" />
                <span className="relative text-black">
                  Career Development & Placement
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  />
                </span>
              </motion.h1>
            </div>

            {/* Animated text reveal */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg text-gray-700 max-w-3xl mx-auto md:mx-0 leading-relaxed mt-6"
            >
              We empower students with the skills, confidence, and opportunities
              to excel in the professional world. From industry connections to
              career guidance, we pave the path to success.
            </motion.p>

            {/* Animated feature points */}
            <div className="mt-8 space-y-3">
              {[
                { icon: Award, text: "Industry-recognized certifications" },
                { icon: Target, text: "Personalized career planning" },
                { icon: Users, text: "Networking with industry leaders" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "#fdba74" }}
                  >
                    <feature.icon size={16} className="text-orange-600" />
                  </motion.div>
                  <span className="text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Image Section with advanced 3D effect */}
        <div className="md:w-1/2 mt-16 md:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              type: "spring",
              stiffness: 100,
            }}
            className="relative"
            style={{ perspective: "2000px" }}
          >
            {/* Decorative elements */}
            <motion.div
              className="absolute -inset-4 rounded-xl  blur-xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main image with parallax effect */}
            <motion.div
              animate={controls}
              className="relative z-10 rounded-xl overflow-hidden"
              style={{
                transformStyle: "preserve-3d",
                transform: "perspective(1000px)",
              }}
            >
              <img
                src="/img2-removebg-preview.png"
                alt="Career Development"
                className="w-full h-auto rounded-xl"
              />

              {/* Overlay gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-orange-900/30 to-transparent"
                animate={{ opacity: [0.3, 0.4, 0.3] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Floating elements with 3D effect */}
              <motion.div
                className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-xl"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "translateZ(60px)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <TrendingUp className="text-orange-500" />
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-xl"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "translateZ(40px)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <Briefcase className="text-orange-500" />
              </motion.div>

              {/* Stats card */}
              <motion.div
                className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-xl"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "translateZ(80px)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateX: [0, 5, 0],
                  rotateY: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                <div className="text-xl font-bold text-orange-600">94%</div>
                <motion.div className="w-full h-1 bg-gray-200 mt-1 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "94%" }}
                    transition={{ duration: 1.5, delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced shadow effect */}
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 h-12 bg-black/20 rounded-full blur-2xl"
              animate={{
                width: ["80%", "85%", "80%"],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
