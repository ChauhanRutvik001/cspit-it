import React, { useState, useEffect } from "react";

const CIDAC_industry_visit = "/CIDAC_industry_visit.jpg";
const TechMahindra_industry_visit = "/TechMahindra_industry_visit.jpg";
const Imegica = "/Imegica.jpg";
const sanket = "/SanketSuthar.jpg";
const Ashwin = "/ashwin_sir.jpg";
const Priyanka = "/priyanka.jpg";

const Browse = () => {
  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      <div className="content mb-4">
        <CDPCDetails />
        {/* <ImageRotation /> */}
        <Description />
        <Faculty />
        <RecruitersGrid />
        <Footer />
      </div>
    </div>
  );
};

const ImageRotation = () => {
  const images = [CIDAC_industry_visit, TechMahindra_industry_visit, Imegica];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="image-rotation flex justify-center items-center pt-10">
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className="w-full object-cover rounded-lg shadow-lg transition-transform duration-500 ease-in-out"
        style={{ maxHeight: "600px" }}
      />
    </div>
  );
};

const CDPCDetails = () => {
  return (
    <div className="cdpc-details w-full mx-auto pt-[5%] px-4 sm:px-8 lg:px-16 bg-white rounded-lg">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Career Development and Placement Cell (CDPC)
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          Empowering students with the skills and opportunities to achieve their
          career aspirations.
        </p>
      </header>

      {/* Overview Section */}
      <section className="mt-10">
        <h2 className="text-3xl font-semibold text-orange-500 mb-6">
          CDPC Activities
        </h2>
        <ul className="list-disc list-inside text-gray-700 text-lg space-y-4">
          <li>
            One-to-one guidance to each student to help them achieve their
            desired career.
          </li>
          <li>
            Free training to improve soft skills, technical skills, and
            personality as per the industry requirements through expert
            workshops.
          </li>
          <li>
            Feedback to each student via mock campus placement tests, including
            online tests, group discussions, and personal interviews.
          </li>
          <li>
            Conducting seminar series on career prospects in the industry,
            public sector, government (including defense), and self-employment.
          </li>
          <li>
            Executing campus placements and job fairs by inviting all industrial
            sectors for students.
          </li>
          <li>
            Guidance regarding the requirements and procedures for higher
            studies in India and abroad via the Higher Studies Help Desk.
          </li>
          <li>
            Encouraging students by providing resources to participate and clear
            various national and international projects and technical
            competitions.
          </li>
          <li>
            Providing guidance to prepare for national and international
            competitive exams.
          </li>
          <li>
            Supporting student start-ups through the Entrepreneurship and
            Development Cell.
          </li>
        </ul>
      </section>

      {/* Image Section */}
      <section className="mt-12 flex justify-center">
        <img
          src="/CDPC_Placement.webp" // Replace with the actual path where the image is hosted
          alt="CDPC Overview"
          width={"80%"}
          className="h-full rounded-lg shadow-xl"
        />
      </section>

      {/* Contact Section */}
      <section className="mt-14">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-blue-500 text-white flex justify-center items-center rounded-full font-bold text-2xl">
                A
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">
                  Dr. Ashwin Makwana
                </p>
                <p className="text-gray-600">Head, CDPC</p>
              </div>
            </div>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=ashwinmakwana.ce@charusat.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-600 transition block mb-2"
            >
              ashwinmakwana.ce@charusat.ac.in
            </a>

            <p className="text-gray-600">+91-2697-265214</p>
          </div>

          <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-green-500 text-white flex justify-center items-center rounded-full font-bold text-2xl">
                S
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">
                  Mr. Sujal Dadhaniya
                </p>
                <p className="text-gray-600">TPO, CDPC</p>
              </div>
            </div>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=tnp@charusat.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-600 transition block mb-2"
            >
              tnp@charusat.ac.in
            </a>

            <p className="text-gray-600">+91-2697-265213 | +91-9662255116</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const recruiters = [
  { name: "Jaro Education", logo: "recruiters.png" }, // Update with actual paths
];

const RecruitersGrid = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="flex justify-center">
        <div className="bg-white border  rounded-md p-6 m-2  flex items-center justify-center">
          <img
            src={recruiters[0].logo}
            alt={recruiters[0].name}
            className="h-full w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const Description = () => {
  return (
    <div className="text-center border border-gray-200   mt-20 p-8 bg-white shadow-md rounded-lg mx-auto max-w-3xl  hover:shadow-2xl transition-shadow duration-300">
      <h2 className="text-2xl font-semibold text-blue-600">About Us</h2>
      <p className="mt-4 text-gray-700 leading-relaxed">
        Welcome to our Training and Placement Cell. Here, we prepare students
        for bright futures by connecting them with top recruiters and providing
        industry-relevant training.
      </p>
    </div>
  );
};

const Faculty = () => {
  const facultyMembers = [
    { name: "Dr. Sanket Suthar", post: "Training Coordinator", image: sanket },
    { name: "Dr. Ashwin Makwana", post: "Placement Officer", image: Ashwin },
    { name: "Dr. Priyanka Patel", post: "Career Counselor", image: Priyanka },
  ];

  return (
    <div className="text-center mt-16 px-6">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6">
        Faculty Members
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {facultyMembers.map((faculty, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <img
              src={faculty.image}
              alt={faculty.name}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-2 border-blue-600"
            />
            <h3 className="text-xl font-medium text-gray-800">
              {faculty.name}
            </h3>
            <p className="text-gray-600">{faculty.post}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 py-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center">
        <p className="text-sm text-gray-700">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-semibold">CHARUSAT UNIVERSITY - KDPIT</span>
        </p>
      </div>
    </footer>
  );
};

export default Browse;
