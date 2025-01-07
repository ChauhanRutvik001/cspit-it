import React from "react";
import Header from "./Header";
import "../index.css";

const Developers = () => {
  const studentsData = [
    {
      id: "22IT015",
      name: "Rutvik chauhan",
      image:
        "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg", // Update with actual path
    },
    {
      id: "22IT012",
      name: "Jay Bodra",
      image:
        "https://techcrunch.com/wp-content/uploads/2016/09/2016_01_23_weebly_45251web.jpg", // Update with actual path
    },
    {
      id: "22IT048",
      name: "Krish kakadiya",
      image: "/assets/student3.jpg", // Update with actual path
    },
    {
      id: "22IT116",
      name: "Trushangkumar patel ",
      image: "/assets/student4.jpg", // Update with actual path
    },
    {
      id: "22IT011",
      name: "Jeet billimoriya",
      image: "/assets/student5.jpg", // Update with actual path
    },
  ];

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900">
      <Header />
      <div className="pt-20 p-4">
        <div className="text-center  lg:text-left mb-8">
          <h5 className="text-4xl sm:text-5xl flex justify-center font-inter font-bold mb-12">
            CDPC-KDPIT
          </h5>
          <p className="text-[#505050] sm:mt-0   mx-auto text-justify px-4 sm:px-6 lg:px-0 text-lg font-poppins font-medium">
            Welcome to the Developers' Corner! We are a passionate team of IT
            enthusiasts dedicated to crafting this platform for the Career
            Development and Placement Cell (CDPC). Our goal is to create an
            intuitive, user-friendly website that serves as a bridge between
            students and their career aspirations. From seamless navigation to
            dynamic features, we've strived to ensure this website meets the
            needs of IT branch students. This project reflects our commitment to
            innovation, teamwork, and leveraging technology to empower our
            peers. Thank you for visiting, and we hope this platform helps you
            achieve your career goals!
          </p>
        </div>
        <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center py-8">
          {/* Grid Section */}
          <div className="grid grid-cols-3 gap-8 px-4">
            {/* First row with 2 cards and logo */}
            <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-6 w-64 h-80">
              <img
                src={studentsData[0].image}
                alt={studentsData[0].name}
                className="w-40 h-60 object-cover rounded-2xl"
              />
              <h2 className="text-xl font-semibold">{studentsData[0].name}</h2>
              <p className="text-gray-500">ID: {studentsData[0].id}</p>
            </div>
            {/* Logo in the center */}
            <div className="flex items-center justify-center w-64 h-64 bg-gray-200 rounded-lg shadow-inner">
              <img src="/cspit.jpg" alt="" />
            </div>
            <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-6 w-64 h-80">
              <img
                src={studentsData[1].image}
                alt={studentsData[1].name}
                className="w-40 h-60 object-cover rounded-2xl"
              />
              <h2 className="text-xl font-semibold">{studentsData[1].name}</h2>
              <p className="text-gray-500">ID: {studentsData[1].id}</p>
            </div>

            {/* Second row with remaining cards */}
            {studentsData.slice(2).map((student, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-6 w-64 h-80"
              >
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-32 h-40 object-cover rounded-full"
                />
                <h2 className="text-xl font-semibold">{student.name}</h2>
                <p className="text-gray-500">ID: {student.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developers;
