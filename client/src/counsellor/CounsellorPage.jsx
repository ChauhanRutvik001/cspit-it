import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { ClipLoader } from "react-spinners";
import { Users, Layout, Eye, CheckCircle, XCircle, Building } from "lucide-react";

const CounsellorPage = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const studentsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [viewCertificateUrl, setViewCertificateUrl] = useState(null);

  useEffect(() => {
    if (user?.role !== "counsellor") navigate("/browse");
  }, [user, navigate]);

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/certificates/students?page=${currentPage}&limit=${studentsPerPage}`
      );
      setStudents(response.data.students);
      setTotalStudents(response.data.total);
      setTotalPages(Math.ceil(response.data.total / studentsPerPage));
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch students");
      setLoading(false);
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
      toast.error("Failed to fetch certificate");
    }
  };

  const handleCloseViewCertificate = () => {
    setViewCertificateUrl(null);
  };

  const handleApproveCertificate = async (requestId) => {
    try {
      await axiosInstance.patch(`/certificates/approve/${requestId}`);
      toast.success("Certificate approved");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to approve certificate");
    }
  };

  const handleDeclineCertificate = async (requestId) => {
    try {
      await axiosInstance.patch(`/certificates/decline/${requestId}`);
      toast.success("Certificate declined");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to decline certificate");
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-black">
      <div className="flex justify-center sm:justify-center pt-24">
        <h1 className="text-3xl font-bold mb-4 font-serif">
          Counsellor Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-2 p-4">
        <button
          onClick={() => navigate("/studentsDomain")}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
        >
          <Layout className="h-5 w-5" />
          <span>Domain</span>
        </button>
        <button
          onClick={() => navigate("/students")}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
        >
          <Users className="h-5 w-5" />
          <span>Student</span>
        </button>
        <button
          onClick={() => navigate("/counsellor/applications")}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
        >
          <Building className="h-5 w-5" />
          <span>Pending Applications</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-2">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            Total Students Requesting Approval
          </h2>
          <span className="ml-2 text-3xl font-bold text-blue-600">
            {totalStudents}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <ClipLoader size={50} />
        </div>
      ) : (
        <div className="p-4">
          {students.length === 0 ? (
            <p>No students found</p>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">Student Name</th>
                  <th className="py-2">Student ID</th>
                  <th className="py-2">Certificate Name</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="border px-4 py-2">{student.name}</td>
                    <td className="border px-4 py-2">{student.id}</td>
                    <td className="border px-4 py-2">
                      {student.certificates.map((certificate) => (
                        <div
                          key={`${student._id}-${certificate._id}`}
                          className="flex items-center gap-2"
                        >
                          <span>{certificate.filename}</span>
                          <button
                            onClick={() =>
                              handleViewCertificate(certificate.fileId)
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </td>
                    <td className="border px-4 py-2">
                      {student.pendingRequests.map((request) => (
                        <div
                          key={`${student._id}-${request._id}`}
                          className="flex items-center gap-2"
                        >
                          <button
                            onClick={() =>
                              handleApproveCertificate(request._id)
                            }
                            className="text-green-500 hover:text-green-700"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeclineCertificate(request._id)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 mx-1 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* View Certificate Modal */}
      {viewCertificateUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
          <div className="relative bg-white p-4 rounded-lg shadow-lg">
            <button
              onClick={handleCloseViewCertificate}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              ✕
            </button>
            <img
              src={viewCertificateUrl}
              alt="Certificate"
              className="max-w-full h-96"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorPage;
