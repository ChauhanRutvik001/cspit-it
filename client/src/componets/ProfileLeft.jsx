import React, { useState, useEffect } from "react";
import {
  User,
  Github,
  Linkedin,
  Camera,
  Loader2,
  Briefcase,
  Award,
  FileText,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  updateAvatar,
  removeAvatar,
  setAvatarBlobUrl,
  fetchAvatarBlob,
} from "../redux/userSlice";

const ProfileLeft = ({ formData, toggleEdit, isEditing }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const loading = useSelector((state) => state.app.isLoading);
  const avatarId = useSelector((state) => state.app?.user?.profile?.avatar);
  const avatarUrl = useSelector((state) => state.app?.user?.profile?.avatarUrl);

  const githubURL = formData.github
    ? `https://github.com/${formData.github}`
    : null;
  const linkedInURL = formData.linkedIn || null;

  // Clear stored blob URL on component mount (on reload)
  useEffect(() => {
    dispatch(setAvatarBlobUrl(null));
  }, [dispatch]);

  // Always fetch a fresh blob URL if an avatar ID exists.
  useEffect(() => {
    if (avatarId) {
      dispatch(fetchAvatarBlob());
    }
  }, [avatarId, dispatch]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size should be less than 3MB");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfilePic = async () => {
    if (!selectedFile) return;
    const data = new FormData();
    data.append("avatar", selectedFile);
    try {
      // Clear any stored blob URL before uploading.
      dispatch(setAvatarBlobUrl(null));
      const response = await axiosInstance.post("/user/upload-avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success(response.data.message);
        const newBlobUrl = URL.createObjectURL(selectedFile);
        dispatch(updateAvatar(response.data.fileId));
        dispatch(setAvatarBlobUrl(newBlobUrl));
        setSelectedFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Upload Error:", error);
    }
  };

  const handleRemoveImage = async () => {
    try {
      toast.success("Profile picture removed successfully");

      dispatch(removeAvatar());
      setSelectedFile(null);
      setImagePreview(null);
      const response = await axiosInstance.delete("/user/profile/remove-profile-pic");
            
    } catch (error) {
      toast.error("Error removing profile picture");
      console.error("Remove Error:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col items-center sticky top-20 text-black">
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
              htmlFor="fileInput"
              className="absolute right-4 top-4 p-3 bg-white rounded-full text-blue-500 cursor-pointer hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Camera size={24} />
            </label>
          </>
        )}
      </div>
      <div className="px-6 pb-8">
        <div className="relative -mt-16 mb-6 flex justify-center">
          <div className="relative">
            {loading ? (
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="relative">
                {selectedFile ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formData.id}
          </h2>
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
              {avatarUrl && !selectedFile && (
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
