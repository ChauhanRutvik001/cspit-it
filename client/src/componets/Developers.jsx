import React, { useState } from "react";
import { Github, Linkedin, Mail, ExternalLink, Code, Award } from "lucide-react";

const Developers = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const studentsData = [
    {
      id: "22IT015",
      name: "Rutvik Chauhan",
      image: "/rutvik.jpg",
      role: "Full Stack Developer (Team Lead)",
      github: "https://github.com/ChauhanRutvik001",
      linkedin: "https://www.linkedin.com/in/chauhanrutvik/",
      email: "https://mail.google.com/mail/?view=cm&fs=1&to=22it015@charusat.edu.in",
      skills: ["React", "Node.js", "MongoDB", "Express", "Socket.io"],
      experience: "2+ Years",
      projects: "10+",
      bio: "Passionate full-stack developer with expertise in modern web technologies. Leading the development of innovative solutions for career development.",
      achievements: ["Team Lead", "Full Stack Expert", "Project Manager"]
    },
    {
      id: "22IT012",
      name: "Jay Bodra",
      image: "/jay.jpg",
      role: "Backend Developer",
      github: "https://github.com/Jaybodra333/",
      linkedin: "https://www.linkedin.com/in/jay-bodra-404b22268/",
      email: "https://mail.google.com/mail/?view=cm&fs=1&to=22it012@charusat.edu.in",
      skills: ["Node.js", "Express", "MongoDB", "API Design", "Database"],
      experience: "2+ Years",
      projects: "8+",
      bio: "Backend specialist focused on creating robust and scalable server-side applications. Expert in database design and API development.",
      achievements: ["Backend Expert", "API Architect", "Database Designer"]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-48 translate-y-48 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Meet Our <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Dream Team</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-4xl mx-auto mb-8">
              We are the passionate innovators behind CDPC-KDPIT. Our diverse team combines cutting-edge 
              technology expertise with creative vision to build platforms that transform student careers.
            </p>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Development Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get to know the talented individuals who bring ideas to life through code, design, and innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {studentsData.map((student, index) => (
            <div
              key={student.id}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
              onMouseEnter={() => setHoveredCard(student.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
              
              {/* Image Section */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Overlay with Quick Info */}
                <div className={`absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent p-6 flex flex-col justify-end transform transition-all duration-300 ${
                  hoveredCard === student.id ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}>
                  <div className="text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4" />
                      <span className="text-sm font-medium">{student.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">{student.projects} Projects</span>
                    </div>
                    <p className="text-sm text-blue-100 line-clamp-3">{student.bio}</p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-blue-600">{student.role}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="relative p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{student.id}</p>
                  
                  {/* Achievements */}
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {student.achievements.map((achievement, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                    {student.skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        +{student.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-4">
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-900 text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={student.email}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-3xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-tr-3xl"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Technology Stack</h2>
            <p className="text-lg text-gray-600">The powerful technologies we use to build amazing experiences</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'Socket.io'].map((tech, index) => (
              <div key={tech} className="text-center group">
                <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-2xl font-bold text-blue-600">{tech.charAt(0)}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700">{tech}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-8">
            <img
              src="/cspit.jpg"
              alt="CSPIT Logo"
              className="h-20 mx-auto mb-6 rounded-lg shadow-lg"
            />
            <h3 className="text-2xl font-bold mb-4">Career Development and Placement Cell</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Empowering students to achieve their career goals through innovative technology and dedicated support.
            </p>
          </div>
          
          <div className="border-t border-blue-400 pt-8">
            <a
              href="https://www.charusat.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
            >
              Visit CHARUSAT <ExternalLink className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developers;
