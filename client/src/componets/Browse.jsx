import React, { useState, useEffect } from "react";

// Import images from the public folder
const CIDAC_industry_visit = "/CIDAC_industry_visit.jpg";
const TechMahindra_industry_visit = "/TechMahindra_industry_visit.jpg";
const Imegica = "/Imegica.jpg";
const sanket = "/SanketSuthar.jpg";
const Ashwin = "/ashwin_sir.jpg";
const Priyanka = "/priyanka.jpg";

const Browse = () => {
  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900">
      <div className="content mb-4">
        <ImageRotation />
        <Description />
        <Faculty />
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
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [images.length]);

  return (
    <div className="image-rotation flex justify-center items-center pt-10">
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className="w-full object-cover rounded-lg shadow-md"
        style={{ maxHeight: "700px" }}
      />
    </div>
  );
};

const Description = () => {
  return (
    <div className="text-center mt-5 p-6 bg-white shadow-md rounded-lg mx-auto max-w-4xl">
      <h2 className="text-2xl font-semibold text-blue-600">About Us</h2>
      <p className="mt-4 text-gray-700">
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
    <div className="text-center mt-8 mr-4 ml-4">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        Faculty Members
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {facultyMembers.map((faculty, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
          >
            <img
              src={faculty.image}
              alt={faculty.name}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
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

export default Browse;
