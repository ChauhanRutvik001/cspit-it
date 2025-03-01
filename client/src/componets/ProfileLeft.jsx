import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Github,
  Linkedin,
  Camera,
  X,
  Award,
  FileText,
  Briefcase,
  Loader2,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProfileLeft = ({ formData, toggleEdit, isEditing }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);

  const githubURL = formData.github
    ? `https://github.com/${formData.github}`
    : null;
  const linkedInURL = formData.linkedIn || null;

  const fetchProfilePic = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/user/profile/upload-avatar", {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setProfilePic(imageUrl);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfilePic();
  }, [fetchProfilePic]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfilePic = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/user/upload-avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setProfilePic(URL.createObjectURL(selectedFile));
        setSelectedFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Upload Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(
        "/user/profile/remove-profile-pic"
      );
      if (response.status === 200) {
        toast.success("Profile picture removed successfully");
        setProfilePic(null);
        setSelectedFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      toast.error("Error removing profile picture");
      console.error("Remove Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col items-center sticky top-20 text-black">
      {/* Header/Banner */}
      <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-purple-600">
        {isEditing && (
          <>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <label
              onClick={() => document.getElementById("fileInput").click()}
              className="absolute right-4 top-4 p-3 bg-white rounded-full text-blue-500 cursor-pointer hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Camera size={24} />
            </label>
          </>
        )}
      </div>

      <div className="px-6 pb-8">
        {/* Profile Picture */}
        <div className="relative -mt-16 mb-6 flex justify-center">
          <div className="relative">
            {loading ? (
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="relative">
                {profilePic || selectedFile ? (
                  <img
                    src={selectedFile ? imagePreview : profilePic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formData.id}
          </h2>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <a
              href={githubURL}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-all ${
                githubURL
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Github size={24} />
            </a>
            <a
              href={linkedInURL}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-all ${
                linkedInURL
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Linkedin size={24} />
            </a>
          </div>

          {/* Edit Button */}
          <button
            onClick={toggleEdit}
            className={`w-full px-4 py-2 rounded-lg transition-all ${
              isEditing
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3 mt-6">
            <button
              onClick={() => navigate("/StudentSelectionPage")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Briefcase className="text-blue-500" size={20} />
              <span className="font-medium">Domain</span>
            </button>
            <button
              onClick={() => navigate("/Certificate")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Award className="text-blue-500" size={20} />
              <span className="font-medium">Certificate</span>
            </button>
            <button
              onClick={() => navigate("/resume")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="text-blue-500" size={20} />
              <span className="font-medium">Resume</span>
            </button>
          </div>

          {/* Edit Mode Actions */}
          {isEditing && (
            <div className="mt-6 space-y-3">
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {selectedFile && (
                <button
                  onClick={handleUpdateProfilePic}
                  className="w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors"
                >
                  Upload Profile Picture
                </button>
              )}

              {profilePic && !selectedFile && (
                <button
                  onClick={handleRemoveImage}
                  className="w-full bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-colors"
                >
                  Remove Profile Picture
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLeft;
