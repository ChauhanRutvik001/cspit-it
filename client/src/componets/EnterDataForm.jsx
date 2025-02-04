import React, { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const EnterDataForm = ({ id }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gender: "",
    permanentAddress: "",
    birthDate: "",
    counsellor: "",
    batch: "",
    mobileNo: "",
    semester: "",
    github: "",
    linkedIn: "",
    id: id || "", // Assign id from props
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "id", // Ensure that id is checked too
      "gender",
      "permanentAddress",
      "birthDate",
      "counsellor",
      "batch",
      "mobileNo",
      "semester",
      "github",
      "linkedIn",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axiosInstance.post("/auth/enter-data", formData);
      console.log("Response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message || "Data saved successfully!");
        navigate("/browse");
      } else {
        // Handle case where success is false but there is a message
        toast.error(response.data.message || "Failed to save data.");
      }
    } catch (error) {
      if (error.response) {
        // If the error response exists, it means the server responded with a status code outside the 2xx range
        toast.error(
          error.response.data.message || "An error occurred during submission."
        );
      } else if (error.request) {
        // If the request was made but no response was received
        toast.error("No response from server. Please try again later.");
      } else {
        // If an error occurred while setting up the request
        toast.error("Error setting up the request: " + error.message);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" bg-white bg-opacity-90 p-8 sm:p-6 rounded-lg shadow-md w-[100%] max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-extrabold text-gray-800">
          Enter Your Details
        </h2>
        {formData.id && (
          <span className="text-sm font-semibold text-gray-600 bg-gray-200 py-1 px-3 rounded-lg">
            User ID: {formData.id}
          </span>
        )}
      </div>

      {/* Render input fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "semester",
          "batch",
          "counsellor",
          "mobileNo",
          "gender",
          "birthDate",
          "github",
          "linkedIn",
          "permanentAddress",
          "id",
        ].map((field) => {
          if (field === "id" || field === "email") return null; // Skip ID and email for input fields

          // Dropdowns for 'semester', 'batch', and 'gender'
          if (field === "semester" || field === "batch" || field === "gender") {
            return (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                >
                  <option value="">
                    Select {field.charAt(0).toUpperCase() + field.slice(1)}
                  </option>
                  {field === "semester" &&
                    [...Array(8).keys()].map((num) => (
                      <option key={num + 1} value={num + 1}>
                        {num + 1}
                      </option>
                    ))}
                  {field === "batch" && (
                    <>
                      <option value="a1">A1</option>
                      <option value="a2">A2</option>
                      <option value="b1">B1</option>
                      <option value="b2">B2</option>
                      <option value="c1">C1</option>
                      <option value="c2">C2</option>
                      <option value="d1">D1</option>
                      <option value="d2">D2</option>
                    </>
                  )}
                  {field === "gender" && (
                    <>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>
            );
          }

          // Regular input fields
          if (field === "permanentAddress") {
            return (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-semibold text-gray-700 capitalize mb-2"
                >
                  Permanent Address
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter permanent address"
                  required
                />
              </div>
            );
          }

          return (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-semibold text-gray-700 capitalize mb-2"
              >
                {field.replace(/([A-Z])/g, " $1")}
                {["github", "linkedIn"].includes(field) && (
                  <span className="text-gray-500 text-xs"></span>
                )}
              </label>
              <input
                type={
                  field === "birthDate"
                    ? "date"
                    : field === "email"
                    ? "email"
                    : "text"
                }
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                required
                placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
              />
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300"
      >
        Submit
      </button>
    </form>
  );
};

export default EnterDataForm;
