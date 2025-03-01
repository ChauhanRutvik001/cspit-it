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
} from "lucide-react";

const CIDAC_industry_visit = "/CIDAC_industry_visit.jpg";
const TechMahindra_industry_visit = "/TechMahindra_industry_visit.jpg";
const Imegica = "/Imegica.jpg";
const sanket = "/SanketSuthar.jpg";
const Ashwin = "/ashwin_sir.jpg";
const Priyanka = "/priyanka.jpg";

const recruiters = [
  { name: "Jaro Education", logo: "recruiters.png" }, // Update with actual paths
];

const Browse = () => {
  return (
    <div className="relative  bg-white text-gray-900 overflow-hidden">
      <div className="content">
        <HeroSection />
        <CDPCDetails />
        <ImageCarousel />
        <Description />
        <Faculty />
        <RecruitersGrid />
        <Footer />
      </div>
    </div>
  );
};

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

  return (
    <section className="relative min-h-screen overflow-hidden py-20 px-4 sm:px-6 lg:px-8 flex justify-center items-center bg-white">
      <div className="absolute inset-0 bg-white opacity-75"></div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center">
        {/* Left Content */}
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            {/* Icon Section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center md:justify-start mb-6"
            >
              <div className="bg-gray-200/10 flex backdrop-blur-sm rounded-full">
                <Rocket size={40} className="text--500" />
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-4 leading-tight tracking-tight"
            >
              Unlock Your Future with <br className="hidden sm:inline" />
              <span className="relative text-black">
                Career Development & Placement Cell
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                />
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg text-gray-700 max-w-3xl mx-auto md:mx-0 leading-relaxed"
            >
              We empower students with the skills, confidence, and opportunities
              to excel in the professional world. From industry connections to
              career guidance, we pave the path to success.
            </motion.p>
          </motion.div>
        </div>

        {/* Right Image Section */}
        <div className="md:w-1/2 mt-10 md:mt-0">
          <motion.img
            src="/home-header-isagebrum.svg"
            alt="Career Development"
            className="bg-transparent"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            whileHover={{ scale: 1.1 }}
          />
        </div>
      </div>
    </section>
  );
};

const CDPCDetails = () => {
  return (
    <div className="cdpc-details w-full mx-auto mt-5 px-4 sm:px-8 lg:px-16 bg-white rounded-lg">
      <div id="activities" className="bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              CDPC Activities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach to career development and placement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-blue-600" />,
                title: "One-to-One Guidance",
                description:
                  "Personalized career guidance to help students achieve their desired career path",
              },
              {
                icon: <Award className="h-10 w-10 text-blue-600" />,
                title: "Skill Development",
                description:
                  "Free training to improve soft skills, technical skills, and personality development",
              },
              {
                icon: <Briefcase className="h-10 w-10 text-blue-600" />,
                title: "Mock Placements",
                description:
                  "Feedback via mock campus placement tests, group discussions, and interviews",
              },
              {
                icon: <GraduationCap className="h-10 w-10 text-blue-600" />,
                title: "Higher Studies Help Desk",
                description: "Guidance for higher studies in India and abroad",
              },
              {
                icon: <Users className="h-10 w-10 text-blue-600" />,
                title: "Campus Placements",
                description:
                  "Executing campus placements and job fairs with industrial sectors",
              },
              {
                icon: <Award className="h-10 w-10 text-blue-600" />,
                title: "Entrepreneurship Support",
                description:
                  "Supporting student start-ups through the Entrepreneurship and Development Cell",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:border-blue-100 hover:-translate-y-1"
              >
                <div className="bg-blue-50 p-4 rounded-full inline-block mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 bg-blue-50 p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Additional Activities
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 p-1 rounded-full mt-1">
                  <div className="bg-blue-600 w-2 h-2 rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Conducting seminar series on career prospects
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 p-1 rounded-full mt-1">
                  <div className="bg-blue-600 w-2 h-2 rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Encouraging participation in technical competitions
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 p-1 rounded-full mt-1">
                  <div className="bg-blue-600 w-2 h-2 rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Guidance for competitive exams
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 p-1 rounded-full mt-1">
                  <div className="bg-blue-600 w-2 h-2 rounded-full"></div>
                </div>
                <span className="text-gray-700">
                  Resources for national and international projects
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ImageCarousel = () => {
  const images = [
    "CIDAC_industry_visit.jpg",
    "TechMahindra_industry_visit.jpg",
    "Imegica.jpg",
  ]; // Replace with actual image URLs or imports
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
  };

  return (
    <div className="py-10 bg-white">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-gray-800 mb-12"
        >
          Industry Visits & Events
        </motion.h2>
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl"
            onClick={() => handleImageClick(images[currentIndex])}
          >
            <img
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Industry Exposure</h3>
                <p className="text-lg">
                  Providing students with real-world industry experience
                </p>
              </div>
            </div>
          </motion.div>

          {selectedImage && (
            <div className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50">
              <div className="relative max-w-4xl w-full p-4">
                <button
                  className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2"
                  onClick={handleClosePreview}
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full max-h-[90vh] object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-10"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-10"
          >
            <ChevronRight size={24} />
          </button>

          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecruitersGrid = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mt-5 mb-5">
        <img
          src={recruiters[0].logo}
          alt={recruiters[0].name}
          className="h-full w-full object-fit"
        />
      </div>
    </motion.div>
  );
};

const Description = () => {
  return (
    <div id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              About CDPC
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed text-justify">
              The Career Development and Placement Cell (CDPC) at CHARUSAT
              University is dedicated to bridging the gap between academia and
              industry. We prepare students for bright futures by connecting
              them with top recruiters and providing industry-relevant training.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed text-justify">
              Our mission is to empower students with the skills, knowledge, and
              opportunities they need to excel in their chosen careers. Through
              a comprehensive approach to career development, we ensure that our
              students are well-prepared for the challenges of the professional
              world.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">500+</h4>
                  <p className="text-sm text-gray-600">Placements</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">100+</h4>
                  <p className="text-sm text-gray-600">Companies</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">50+</h4>
                  <p className="text-sm text-gray-600">Workshops</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-lg z-0"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-200 rounded-lg z-0"></div>
              <img
                src="/CDPC_Placement.webp"
                alt="CDPC Overview"
                className="w-full h-auto rounded-lg shadow-xl relative z-10"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Faculty = () => {
  const facultyMembers = [
    {
      name: "Dr. Sanket Suthar",
      post: "Training Coordinator",
      email: "sanketsuthar@charusat.ac.in",
      phone: "+91 9876543210",
      image: sanket,
    },
    {
      name: "Dr. Ashwin Makwana",
      post: "Placement Officer",
      email: "ashwinmakwana@charusat.ac.in",
      phone: "+91 9876543211",
      image: Ashwin,
    },
    {
      name: "Dr. Priyanka Patel",
      post: "Career Counselor",
      email: "priyankpatel@charusat.ac.in",
      phone: "+91 9876543212",
      image: Priyanka,
    },
  ];

  const quickLinks = [
    { name: "Academic Calendar", icon: <Calendar size={16} /> },
    { name: "Student Portal", icon: <Users size={16} /> },
    { name: "Library Resources", icon: <GraduationCap size={16} /> },
    { name: "Campus Map", icon: <MapPin size={16} /> },
  ];

  const socialLinks = [
    { name: "Facebook", url: "https://facebook.com" },
    { name: "Twitter", url: "https://twitter.com" },
    { name: "LinkedIn", url: "https://linkedin.com" },
    { name: "Instagram", url: "https://instagram.com" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        {/* Faculty Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-700 mb-2">
                Meet Our Faculty
              </h2>
              <div className="w-24 h-1 bg-gray-600 mx-auto mb-4 rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our dedicated faculty members bring years of academic excellence
                and industry experience to provide students with the best
                guidance and mentorship.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {facultyMembers.map((faculty, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    y: -10,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="h-40 bg-gradient-to-r from-gray-900 to-gray-900"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                      <img
                        src={faculty.image}
                        alt={faculty.name}
                        className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
                      />
                    </div>
                  </div>

                  <div className="pt-20 pb-6 px-6">
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-1">
                      {faculty.name}
                    </h3>
                    <p className="text-blue-600 font-medium text-center mb-4">
                      {faculty.post}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail size={16} className="mr-2 text-blue-500" />
                        <span>{faculty.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone size={16} className="mr-2 text-blue-500" />
                        <span>{faculty.phone}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 bg-gradient-to-r from-gray-900 to-gray-900 text-white rounded-md font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center"
                      >
                        <span>View Profile</span>
                        <ExternalLink size={16} className="ml-2" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white border-t  py-8 text-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.img
          src="/cspit.jpg"
          alt="CSPIT Logo"
          className="h-16 mx-auto mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />

        {/* Footer Text */}
        <p className="text-gray-600 text-sm">
          Career Development and Placement Cell (CDPC) - KDPIT
        </p>

        {/* CHARUSAT Link */}
        <motion.a
          href="https://www.charusat.ac.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Visit CHARUSAT <ExternalLink className="ml-2 w-4 h-4" />
        </motion.a>

        {/* Copyright */}
        <p className="mt-6 text-gray-500 text-xs">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-semibold">CHARUSAT UNIVERSITY - KDPIT</span>.
          All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

export default Browse;
