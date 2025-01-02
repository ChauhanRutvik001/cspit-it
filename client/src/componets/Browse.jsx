import React, { useState } from "react";
import Header from "./Header";

const Browse = () => {
  // Sample data for the college
  const collegeData = {
    name: "Charotar University of Science and Technology",
    location: "Chandubhai S. Patel Institute of Technology, Gujarat, India",
    courses: ["B.Tech in Computer Science", "B.Tech in Information Technology", "M.Tech in Computer Science"],
    contact: {
      phone: "+91 9464979949",
      email: "info@charusat.edu.in"
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-gray-100 text-gray-900">
        <Header />
        
        {/* College Information Section */}
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-6 lg:px-8 pt-20">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-semibold text-center text-blue-800 mb-4">
              {collegeData.name}
            </h1>
            <p className="text-lg text-center text-gray-600 mb-6">
              {collegeData.location}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-100 rounded-lg p-4">
                <h2 className="text-xl font-medium text-blue-600 mb-2">Courses Offered</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {collegeData.courses.map((course, index) => (
                    <li key={index}>{course}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-100 rounded-lg p-4">
                <h2 className="text-xl font-medium text-blue-600 mb-2">Contact Us</h2>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> {collegeData.contact.phone}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {collegeData.contact.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Browse;
