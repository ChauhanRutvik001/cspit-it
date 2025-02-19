import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const StudentResume = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const location = useLocation();
  const { id, name } = location.state || {};

  useEffect(() => {
    fetchResume();
  }, [userId]);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/resumes/getUserResume/${userId}`,
        { responseType: "blob" }
      );

      if (response.data.type !== "application/pdf") {
        throw new Error("Invalid file type");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setError(null);
    } catch (error) {
      setError("No resume found.");
      setPdfUrl("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      <div className="p-2 mx-auto bg-white rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <button
            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition transform duration-200"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`Resume_${id}.pdf`}
              className="py-2 px-6 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 active:scale-95 transition duration-200"
            >
              📥 Download Resume
            </a>
          )}
        </div>

        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Resume Viewer
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mb-0 mt-2">
          📜 <span className="mr-2">{id?.toUpperCase()}</span>-
          <span className="ml-2">
            {name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase()}
          </span>
        </h3>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-40 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex justify-center items-center">
                <span className="text-gray-600 font-semibold text-sm">⏳</span>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-700 animate-pulse">
              Loading your resume...
            </p>
          </div>
        ) : pdfUrl ? (
          <div className="mt-3 max-w-6xl mx-auto bg-white shadow-lg overflow-hidden relative mb-4">
            <div className="w-full h-[90vh]">
              <iframe
                src={`${pdfUrl}#zoom=FitH`}
                className="w-full h-full"
                title="Resume Viewer"
              />
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-center mt-5 text-lg font-medium animate-pulse">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentResume;
