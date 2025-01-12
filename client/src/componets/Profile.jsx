import React, { useState, useEffect } from "react";
import Header from "./Header";
import toast from "react-hot-toast";
import ProfileLeft from "./ProfileLeft";
import ProfileRight from "./ProfileRight";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axiosInstance";

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = useSelector((state) => state.app.user.id);

  const [formData, setFormData] = useState({
    gender: "",
    permanentAddress: "",
    birthDate: "",
    counsellor: "",
    batch: "",
    name: "",
    email: "",
    mobileNo: "",
    semester: "",
    github: "",
    linkedIn: "",
    id: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(
          `user/getStudentData/${userId}`
        );

        console.log(response.data);

        const userData = response.data.data || {}; // Ensure response.data is at least an empty object
        const userProfile = userData.profile || {}; // This will always be empty since it's not in the response

        setUser(userData);

        // Update formData with only available data
        setFormData({
          name: userData.name || "",
          gender: userProfile.gender || "", // Defaults to empty since `profile` is missing
          permanentAddress: userProfile.permanentAddress || "",
          birthDate: userProfile.birthDate
            ? userProfile.birthDate.slice(0, 10)
            : "",
          counsellor: userProfile.counsellor || "",
          batch: userProfile.batch || "",
          email: userData.email || "",
          mobileNo: userProfile.mobileNo || "",
          semester: userProfile.semester || "",
          github: userProfile.github || "",
          linkedIn: userProfile.linkedIn || "",
          id: userData.id || "",
        });
      } catch (error) {
        toast.error("Error fetching user data");
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any required field in formData is empty
    const requiredFields = [
      "gender",
      "permanentAddress",
      "birthDate",
      "counsellor",
      "batch",
      "name",
      "email",
      "mobileNo",
      "semester",
      "github",
      "linkedIn",
      "id",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in the following fields: ${missingFields.join(", ")}`
      );
      return;
    }

    try {
      const response = await axiosInstance.put("user/update", {
        ...formData,
        userId,
      });
      console.log(response.data);

      if (response.data.success) {
        toast.success("Profile updated successfully");
        setUser(response.data.user);
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Profile update failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unexpected error occurred. Please try again.";
      toast.error(errorMessage);
      console.error("Error updating profile:", error);
    }
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen bg-white text-black">
      {user ? (
        <section className="pt-16">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
            <div className="md:col-span-1">
              <ProfileLeft
                formData={formData}
                toggleEdit={toggleEdit}
                isEditing={isEditing}
              />
            </div>

            <div className="md:col-span-3">
              <ProfileRight
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                user={user}
                toggleEdit={toggleEdit}
                isEditing={isEditing}
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <p>Loading user data...</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
