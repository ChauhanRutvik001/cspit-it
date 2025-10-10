import React from "react";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

const Developers = () => {
  const studentsData = [
    {
      id: "22IT015",
      name: "Rutvik Chauhan",
      image: "/rutvik.jpg",
      role: "Full Stack Developer (Team Lead)",
      github: "https://github.com/ChauhanRutvik001",
      linkedin: "https://www.linkedin.com/in/chauhanrutvik/",
      email: "https://mail.google.com/mail/?view=cm&fs=1&to=22it015@charusat.edu.in",
    },
    {
      id: "22IT012",
      name: "Jay Bodra",
      image: "/jay.jpg",
      role: "Backend Developer",
      github: "https://github.com/Jaybodra333/",
      linkedin: "https://www.linkedin.com/in/jay-bodra-404b22268/",
      email: "https://mail.google.com/mail/?view=cm&fs=1&to=22it012@charusat.edu.in",
    },
    // {
    //   id: "22IT048",
    //   name: "Krish Kakadiya",
    //   image: "/krish.jpg",
    //   role: "Frontend Developer",
    //   github: "https://github.com/Krishkkdy",
    //   linkedin: "https://www.linkedin.com/in/krish-kakadiya-3404a92b0/",
    //   email: "https://mail.google.com/mail/?view=cm&fs=1&to=22it048@charusat.edu.in",
    // },
    // {
    //   id: "22IT116",
    //   name: "Trushangkumar Patel",
    //   image: "/trushang.jpg",
    //   role: "UI/UX Designer",
    //   github: "https://github.com/Trushang-Patel/",
    //   linkedin: "https://www.linkedin.com/in/22it116-trushang-patel/",
    //   email: "https://mail.google.com/mail/?view=cm&fs=1&to=22it116@charusat.edu.in",
    // },
    // {
    //   id: "22IT011",
    //   name: "Jeet Bilimoria",
    //   image: "/jeet.jpg",
    //   role: "Frontend Developer",
    //   github: "https://github.com",
    //   linkedin: "https://linkedin.com",
    //   email: "https://mail.google.com/mail/?view=cm&fs=1&to=22it011@charusat.edu.in",
    // },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Meet Our Development Team
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We are the passionate minds behind CDPC-KDPIT. Our diverse team
            brings together expertise in full-stack development, design, and
            database management to create an innovative platform that bridges
            students with their dream careers.
          </p>
        </div>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studentsData.map((student) => (
            <div
              key={student.id}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-500">{student.id}</p>
                <p className="text-md font-medium text-blue-600">
                  {student.role}
                </p>

                {/* Social Links */}
                <div className="mt-4 flex justify-center space-x-4">
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={student.email}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <img
            src="/cspit.jpg"
            alt="CSPIT Logo"
            className="h-16 mx-auto mb-6"
          />
          <p className="text-gray-600">
            Career Development and Placement Cell (CDPC) - KDPIT
          </p>
          <a
            href="https://www.charusat.ac.in"
            target="_blank"
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
          >
            Visit CHARUSAT <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Developers;
