import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { AiOutlineCloudUpload } from "react-icons/ai";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Dialog } from "@headlessui/react"; // For custom modal
import { Viewer, Worker } from "@react-pdf-viewer/core"; // ✅ Import Viewer
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";

const ResumeViewer = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Delete confirmation state
  const userId = useSelector((state) => state.app.user._id);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    fetchResume();
  }, [userId]);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/resumes/getResumebyUserID/${userId}`,
        { responseType: "blob" }
      );

      if (response.data.type !== "application/pdf") {
        throw new Error("Invalid file type");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
      setError(null);
    } catch (error) {
      setError("No resume found. Please upload one.");
      setPdfUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      setUploading(true);
      await axiosInstance.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Upload successful!");
      setSelectedFile(null);
      fetchResume();
    } catch (error) {
      toast.error(error.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const deleteResume = async () => {
    try {
      setIsDeleteModalOpen(false);
      setLoading(true);
      const res = await axiosInstance.delete(`/resumes/${userId}`);
      toast.success(res.data?.message || "Resume deleted successfully!");
      setPdfUrl("");
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 px-4">
      <div className="p-3 mx-auto bg-white rounded-lg max-w-5xl w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Resume Manager
        </h2>

        {/* Upload Section */}
        {!pdfUrl && !loading && (
          <div className="sm:w-3/4 w-full flex flex-col p-6 border border-gray-300 rounded-lg bg-gray-50 text-center mx-auto">
            <label className="border-dashed border-2 border-gray-400 p-6 rounded-lg cursor-pointer bg-white hover:bg-gray-100 flex flex-col items-center transition-all">
              <AiOutlineCloudUpload size={40} className="text-blue-500 mb-3" />
              <span className="text-gray-600 font-semibold text-sm md:text-base">
                Drag & Drop or Click to Upload
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <p className="mt-3 text-gray-700 font-medium text-sm md:text-base">
                Selected: {selectedFile.name}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`mt-4 px-4 py-2 font-semibold rounded-lg transition-all text-sm md:text-base ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {pdfUrl && (
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <a
              href={pdfUrl}
              download="Resume.pdf"
              className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 text-sm md:text-base"
            >
              📥 Download Resume
            </a>

            <button
              className="flex items-center justify-center transition-all duration-300 rounded-full p-3 text-red-500 hover:bg-red-600 hover:text-white"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {/* Resume Preview */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-40 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-gray-700 animate-pulse">
              Loading your resume...
            </p>
          </div>
        ) : pdfUrl ? (
          <div className="mt-3 w-full max-w-5xl mx-auto bg-white overflow-hidden">
            <div className="w-full h-auto">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div className="h-[75vh] md:h-[90vh] w-full">
                  <Viewer
                    fileUrl={pdfUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    defaultScale={SpecialZoomLevel.PageWidth}
                  />
                </div>
              </Worker>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-center mt-5 text-lg font-medium animate-pulse">
            {error}
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4"
      >
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Delete Resume?
          </h3>
          <p className="text-gray-600 mt-3">
            This will permanently delete your resume. Are you sure?
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={deleteResume}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ResumeViewer;
