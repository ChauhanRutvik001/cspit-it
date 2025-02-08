import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";

const CertificateManager = () => {
  const user = useSelector((store) => store.app.user);
  const userId = user?._id;

  const [file, setFile] = useState(null);
  // const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    if (userId) fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/certificates/user`);
      setCertificates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // toast.error("Failed to fetch certificates. Please try again.");
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
      // setPreview(URL.createObjectURL(selectedFile));
      setMessage("");
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
      await axiosInstance.post("/certificates/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Certificate uploaded successfully.");
      setFile(null);
      // setPreview(null);
      fetchCertificates();
    } catch (error) {
      toast.error("❌ Failed to upload certificate.");
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
      toast.error("❌ Failed to delete certificate.");
    } finally {
      setShowDeletePopup(false);
    }
  };

  return (
    <div className="pt-20">
      <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-5 font-serif">
          🎓 Your Certificates
        </h2>

        {/* Upload Section */}
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="w-full sm:w-1/2 p-4 border rounded-lg bg-gray-50">
            <label className="block mb-2 font-semibold text-gray-700">
              Upload Certificate (Images Only):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border p-2 rounded bg-white"
            />

            {/* Image Preview */}
            {/* {preview && (
                <div className="mt-3 text-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 w-full mx-auto border rounded-lg shadow-md object-cover"
                  />
                </div>
              )} */}

            <button
              onClick={handleUpload}
              className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700"
            >
              <AiOutlineCloudUpload size={20} /> Upload
            </button>

            {message && (
              <p className="text-sm mt-2 text-center font-medium text-green-600">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-500 mt-5">
            Loading certificates...
          </p>
        ) : null}

        {/* Certificate List */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-5">
          📜 Your Certificates ({certificates.length} Total)
        </h3>
        {certificates.length === 0 ? (
          <p className="text-gray-500 text-center">
            No certificates uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 p-4">
            {certificates.map((cert, index) => (
              <div
                key={cert._id}
                className="relative p-4 border rounded-xl shadow-lg bg-white hover:shadow-2xl transition duration-300"
              >
                {/* Certificate Index */}
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  #{index + 1}
                </span>

                {/* Certificate Image */}
                <img
                  src={`http://localhost:3100/api/v1/certificates/file/${cert.fileId}`}
                  alt={cert.filename}
                  className="w-full h-64 object-fit border rounded-lg"
                />

                {/* Certificate Info */}
                <div className="mt-3 text-center">
                  <p className="font-semibold text-gray-800 truncate px-2">
                    {cert.filename}
                  </p>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteConfirmation(cert._id)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition duration-200"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
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
    </div>
  );
};

export default CertificateManager;
