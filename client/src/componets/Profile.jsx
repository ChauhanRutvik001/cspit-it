// src/components/Profile.js
import React, { useState } from "react";
import Header from "./Header";

const Profile = () => {
  // State to hold form values
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    universityEmail: "",
    tenPercent: "",
    twelfthPercent: "",
    cgpa: "",
    currentSemester: "",
    batch: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // You can dispatch your form data to an API or store
  };

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900">
      <Header />
      <div className="pt-20">
      </div>
      <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Student Profile
        </h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              University Email
            </label>
            <input
              type="email"
              name="universityEmail"
              value={formData.universityEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              10th %
            </label>
            <input
              type="number"
              name="tenPercent"
              value={formData.tenPercent}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              12th %
            </label>
            <input
              type="number"
              name="twelfthPercent"
              value={formData.twelfthPercent}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              CGPA
            </label>
            <input
              type="number"
              step="0.01"
              name="cgpa"
              value={formData.cgpa}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              Current Semester
            </label>
            <input
              type="text"
              name="currentSemester"
              value={formData.currentSemester}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold">
              Batch (e.g., A1, B1, C1)
            </label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
