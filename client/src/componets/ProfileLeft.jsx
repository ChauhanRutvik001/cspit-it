import React, { useState, useEffect, useCallback } from "react";
import { FaUser, FaGithub, FaLinkedin } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { ClipLoader } from "react-spinners";
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
      // console.log("Image URL:", imageUrl);
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
      toast.success("Remove successfully");
      setSelectedFile(null);
      setProfilePic(null);
      setLoading(false);
      const response = await axiosInstance.delete(
        "/user/profile/remove-profile-pic"
      );
      if (response.status === 200) {
        setSelectedFile(null);
        setProfilePic(null);
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Remove Error");
      console.error("Remove Error:", error);
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center sticky top-20 bg-white text-black rounded-lg shadow-lg p-6">
      {/* Profile Image */}
      {loading ? (
        <ClipLoader size={150} color={"#000000"} loading={loading} />
      ) : (
        <img
          src={selectedFile ? imagePreview : profilePic || ""}
          alt="Profile"
          className={`w-48 h-48 rounded-full mb-3 ${
            profilePic || selectedFile ? "" : "hidden"
          }`}
        />
      )}

      {!profilePic && !selectedFile && !loading && (
        <FaUser size={200} className="text-primary mb-3" />
      )}

      <p className="text-xl font-semibold pb-5">{formData.id}</p>

      <div className="flex items-center space-x-2">
        <a
          href={githubURL}
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-all ${
            githubURL ? "text-black" : "text-gray-400"
          } hover:text-gray-700`}
        >
          <FaGithub size={30} />
        </a>
        <a
          href={linkedInURL}
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-all ${
            linkedInURL ? "text-black" : "text-gray-400"
          } hover:text-gray-700`}
        >
          <FaLinkedin size={30} />
        </a>
      </div>

      <button
        onClick={toggleEdit}
        className={`px-4 py-2 rounded-md mt-4 transition ${
          isEditing
            ? "bg-red-500 hover:bg-red-700"
            : "bg-blue-500 hover:bg-blue-700"
        } text-white`}
      >
        {isEditing ? "Cancel Edit" : "Edit Details"}
      </button>

      <button className={`px-4 py-2 rounded-md mt-4 transition text-black`}
      onClick={() => navigate("/StudentSelectionPage")}>
        Add Domain
      </button>

      {isEditing && (
        <div className="w-full mt-4 space-y-4">
          <button
            onClick={() => document.getElementById("fileInput").click()}
            className="w-full bg-blue-500 text-white rounded px-4 py-2 shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          >
            Select Image
          </button>
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
              className="w-full bg-green-500 text-white rounded px-4 py-2 shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            >
              Upload Profile Picture
            </button>
          )}

          {profilePic && !selectedFile && (
            <button
              onClick={handleRemoveImage}
              className="w-full bg-red-500 text-white rounded px-4 py-2 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
            >
              Remove Profile Picture
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileLeft;
