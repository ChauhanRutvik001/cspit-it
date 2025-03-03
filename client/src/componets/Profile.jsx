import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import ProfileLeft from "./ProfileLeft";
import ProfileRight from "./ProfileRight";
import axiosInstance from "../utils/axiosInstance";
import { updateUser } from "../redux/userSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.app.user); // Access Redux user state
  console.log("User data from Redux:", user);

  // State for form data
  const [formData, setFormData] = useState({
    avatar: user?.profile?.avatar || "",
    gender: user?.profile?.gender || "",
    permanentAddress: user?.profile?.permanentAddress || "",
    birthDate: user?.profile?.birthDate
      ? user.profile.birthDate.slice(0, 10)
      : "",
    counsellor: user?.profile?.counsellor || "",
    batch: user?.profile?.batch || "",
    name: user?.name || "",
    email: user?.email || "",
    mobileNo: user?.profile?.mobileNo || "",
    semester: user?.profile?.semester || "",
    github: user?.profile?.github || "",
    linkedIn: user?.profile?.linkedIn || "",
    id: user?.id || "",
    role: user?.role || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields validation
    const requiredFields = [
      "gender",
      "permanentAddress",
      "birthDate",
      "counsellor",
      "batch",
      "name",
      "mobileNo",
      "semester",
      "github",
      "linkedIn",
      "id",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const response = await axiosInstance.put("user/update", {
        ...formData,
        userId: user.id,
      });

      if (response.data.success) {
        toast.success("Profile updated successfully");

        // Update Redux store
        dispatch(
          updateUser({
            profile: { ...formData },
            id: user.id,
            email: user.email,
            role: user.role,
          })
        );

        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Profile update failed");
      }
    } catch (error) {
      toast.error("Unexpected error occurred. Please try again.");
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
                setIsEditing={setIsEditing}
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="flex flex-col justify-center items-center h-screen space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex justify-center items-center">
              <span className="text-gray-600 font-semibold text-sm">⏳</span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Loading user data...
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;