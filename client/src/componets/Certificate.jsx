import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import toast from "react-hot-toast";

const CertificateManager = () => {
  const user = useSelector((store) => store.app.user);
  const userId = user?._id;

  const [file, setFile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [viewCertificateUrl, setViewCertificateUrl] = useState(null);

  useEffect(() => {
    if (userId) fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/certificates/`);
      setCertificates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to fetch certificates. Please try again.");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("❌ Only images (JPEG, PNG, GIF, WEBP) are allowed.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("⚠️ Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("certificate", file);

    try {
      setUploading(true);
      await axiosInstance.post("/certificates/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        "✅ Certificate uploaded successfully and sent for approval."
      );
      setFile(null);
      fetchCertificates();
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;

        if (status === 403 && data.status === "COUNSELLOR_REQUIRED") {
          toast.error(
            "❌ You need to have a counsellor assigned before uploading certificates. Please update your profile first.",
            {
              duration: 5000,
            }
          );
        } else if (status === 400 && data.error.includes("Only image files")) {
          toast.error(
            "❌ Please select a valid image file (JPEG, PNG, GIF, WEBP)."
          );
        } else if (status === 404) {
          toast.error(
            "❌ User profile not found. Please try logging in again."
          );
        } else {
          toast.error(
            `❌ ${
              data.error || "Failed to upload certificate. Please try again."
            }`
          );
        }
      } else {
        toast.error(
          "❌ Network error. Please check your connection and try again."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirmation = (id) => {
    setDeleteId(id);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await axiosInstance.delete(`/certificates/${deleteId}`);
      toast.success("✅ Certificate deleted successfully.");
      fetchCertificates();
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `❌ ${error.response.data.error || "Failed to delete certificate."}`
        );
      } else {
        toast.error("❌ Failed to delete certificate. Please try again.");
      }
    } finally {
      setShowDeletePopup(false);
    }
  };

  const handleEditConfirmation = (id) => {
    setEditId(id);
    setShowEditPopup(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("⚠️ Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("certificate", file);

    try {
      await axiosInstance.put(`/certificates/update/${editId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Certificate updated successfully.");
      setFile(null);
      fetchCertificates();
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `❌ ${error.response.data.error || "Failed to update certificate."}`
        );
      } else {
        toast.error("❌ Failed to update certificate. Please try again.");
      }
    } finally {
      setShowEditPopup(false);
    }
  };

  const handleViewCertificate = async (certificateId) => {
    try {
      const response = await axiosInstance.get(
        `/certificates/file/${certificateId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setViewCertificateUrl(url);
    } catch (error) {
      toast.error("❌ Failed to fetch certificate. Please try again.");
    }
  };

  const handleCloseViewCertificate = () => {
    if (viewCertificateUrl) {
      window.URL.revokeObjectURL(viewCertificateUrl);
      setViewCertificateUrl(null);
    }
  };

  return (
    <div className="pt-20">
      <div className="p-8 mx-auto bg-white shadow-xl rounded-xl">
  <div className="mb-16">
    <h2 className="text-3xl font-bold text-center text-gray-900 mb-6 font-serif">
      🎓 Your Certificates
    </h2>

    {/* Upload Section */}
    <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-8">
      <div className="w-full sm:w-1/2 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-gray-400 transition">
        <label className="block mb-3 font-semibold text-gray-700">
          Upload Certificate (Images Only):
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border border-gray-300 p-3 rounded bg-white shadow-sm"
          disabled={uploading}
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`mt-4 w-full px-5 py-3 rounded-lg flex items-center justify-center gap-2 text-lg transition 
            ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white shadow-md`}
        >
          <AiOutlineCloudUpload size={22} />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  </div>

  {/* Loading State */}
  {loading && (
    <p className="text-center text-gray-500 mt-5 animate-pulse">
      Loading certificates...
    </p>
  )}

  {/* Certificate List */}
  <h3 className="text-lg font-semibold p-3 mb-5 mt-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-md shadow-lg">
    📜 Your Certificates ({certificates.length} Total)
  </h3>

  {certificates.length === 0 && !loading ? (
    <p className="text-gray-500 text-center p-6 bg-gray-50 rounded-lg text-lg shadow">
      No certificates uploaded yet.
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-4 text-center font-semibold text-gray-700 tracking-wider">#</th>
            <th className="px-6 py-4 text-center font-semibold text-gray-700 tracking-wider">Certificate Name</th>
            <th className="px-6 py-4 text-center font-semibold text-gray-700 tracking-wider">Status</th>
            <th className="px-6 py-4 text-center font-semibold text-gray-700 tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert, index) => (
            <tr key={cert._id} className="odd:bg-white even:bg-gray-100 transition hover:bg-gray-200">
              <td className="py-3 px-5 border-b text-center">{index + 1}</td>
              <td className="py-3 px-5 border-b">{cert.filename}</td>
              <td className="py-3 px-5 border-b text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md 
                  ${cert.status === "approved" ? "bg-green-100 text-green-800" 
                  : cert.status === "rejected" ? "bg-red-100 text-red-800" 
                  : "bg-yellow-100 text-yellow-800"}`}>
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-5 border-b text-center space-x-2">
                <button
                  onClick={() => handleViewCertificate(cert.fileId)}
                  className="bg-blue-500 text-white p-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                  title="View Certificate"
                >
                  <MdVisibility size={22} />
                </button>
                {cert.status !== "approved" && (
                  <button
                    onClick={() => handleEditConfirmation(cert._id)}
                    className="bg-yellow-500 text-white p-2 rounded-lg shadow-md hover:bg-yellow-600 transition"
                    title="Edit Certificate"
                  >
                    <MdEdit size={22} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteConfirmation(cert._id)}
                  className="bg-red-500 text-white p-2 rounded-lg shadow-md hover:bg-red-600 transition"
                  title="Delete Certificate"
                >
                  <MdDelete size={22} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


      {/* Delete Confirmation Modal */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Are you sure?
            </h3>
            <p className="text-gray-600 mt-2">
              Do you really want to delete this certificate?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Edit Certificate
            </h3>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded bg-white"
              />
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleEdit}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Update
              </button>
              <button
                onClick={() => setShowEditPopup(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      {viewCertificateUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative bg-white p-4 rounded-lg shadow-lg">
            <button
              onClick={handleCloseViewCertificate}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              title="Close"
            >
              ✕
            </button>
            <img
              src={viewCertificateUrl}
              alt="Certificate"
              className="max-w-full h-auto max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateManager;
