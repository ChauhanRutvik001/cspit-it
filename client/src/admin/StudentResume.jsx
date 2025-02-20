import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Viewer, Worker } from "@react-pdf-viewer/core";  // ✅ Import Viewer
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";

const StudentResume = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const location = useLocation();
  const { id } = location.state || {};

  // Initialize the default layout plugin (adds toolbar, navigation, etc.)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  useEffect(() => {
    fetchResume();
  }, [userId]);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/resumes/getUserResume/${userId}`, {
        responseType: "blob",
      });

      if (response.data.type !== "application/pdf") {
        throw new Error("Invalid file type");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
      setError(null);
    } catch (error) {
      setError("No resume found.");
      setPdfUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 px-4">
  <div className="p-4 mx-auto bg-white rounded-lg shadow-md max-w-6xl">
    {/* Header with Buttons */}
    <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
      <button
        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {pdfUrl && (
        <a
          href={pdfUrl}
          download={`Resume_${id}.pdf`}
          className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200"
        >
          📥 Download Resume
        </a>
      )}
    </div>

    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
      Resume Viewer
    </h2>

    {/* Loading & Error Messages */}
    {loading ? (
      <div className="flex flex-col justify-center items-center h-40">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-3 text-lg font-medium text-gray-700 animate-pulse">
          Loading your resume...
        </p>
      </div>
    ) : error ? (
      <p className="text-red-500 text-center mt-5 text-lg font-medium">
        {error}
      </p>
    ) : (
      <div className="border rounded-lg shadow-lg overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="h-[70vh] md:h-[85vh] w-full">
          <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} defaultScale={SpecialZoomLevel.PageWidth} />
          </div>
        </Worker>
      </div>
    )}
  </div>
</div>

  );
};

export default StudentResume;
