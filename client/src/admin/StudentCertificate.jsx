import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { useParams, useLocation } from "react-router-dom";

const StudentCertificate = () => {
  const { id: userId } = useParams(); // Get user ID from URL params
  const location = useLocation();
  const { id, name } = location.state || {}; // Get the id and name from state

  // const [preview, setPreview] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (userId) fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/certificates/getUserCertificate/${userId}`
      );
      console.log(response.data);
      setCertificates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // toast.error("Failed to fetch certificates. Please try again.");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-5 font-serif">
          🎓 Certificates
        </h2>

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-500 mt-5">
            Loading certificates...
          </p>
        ) : null}

        {/* Certificate List */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-5">
          📜 <span className="mr-2">{id?.toUpperCase()}</span>-
          <span className="ml-2">
            {name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase()}
          </span>
          <span className="ml-2">
            Certificates ({certificates.length} Total)
          </span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCertificate;
