import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { AiOutlineCloudUpload } from "react-icons/ai";
import toast from "react-hot-toast";

const ResumeViewer = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const userId = useSelector((state) => state.app.user._id);

  useEffect(() => {
    fetchResume();
  }, [userId]);

  const deleteResume = async () => {
    try {
      const res = await axiosInstance.delete(`/resumes/${userId}`);
      toast.success(res.data?.message || "Resume deleted successfully!");
      setPdfUrl(""); // Clear the resume preview
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred.");
    }
  };

  const fetchResume = async () => {
    try {
      const response = await axiosInstance.get(
        `/resumes/getResumebyUserID/${userId}`,
        {
          responseType: "blob",
        }
      );

      if (response.data.type !== "application/pdf") {
        throw new Error("Invalid file type");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
      setError(null); // Reset error if resume is found
    } catch (error) {
      setError("No resume found. Please upload one.");
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Upload successful!");
      setUploading(false);
      setSelectedFile(null);
      fetchResume();
    } catch (error) {
      toast.error(error.response?.data?.error || "Upload failed.");
      setUploading(false);
    }
  };

  return (
    <div className="pt-20">
      <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Resume Manager
        </h2>

        {/* Upload Section (Only If No Resume Exists) */}
        {!pdfUrl && (
          <div className="sm:w-1/2 flex flex-col p-6 border border-gray-300 rounded-lg bg-gray-50 text-center shadow-md m-auto">
            <label className="border-dashed border-2 border-gray-400 p-8 rounded-lg cursor-pointer bg-white hover:bg-gray-100 flex flex-col items-center transition-all">
              <AiOutlineCloudUpload size={50} className="text-blue-500 mb-3" />
              <span className="text-gray-600 font-semibold">
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
              <p className="mt-3 text-gray-700 font-medium">
                Selected: {selectedFile.name}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`mt-4 px-6 py-2 font-semibold rounded-lg transition-all ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        )}

        {/* Resume Preview */}
        {pdfUrl ? (
          <div className="mt-6 border rounded-xl overflow-hidden shadow-xl bg-white">
            <div className="relative border-b border-gray-300">
              <iframe
                src={pdfUrl}
                width="100%"
                height="500"
                title="Resume Viewer"
                className="rounded-t-xl"
              ></iframe>
              <div className="absolute top-2 right-2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm shadow-md">
                Preview Mode
              </div>
            </div>
            <div className="p-5 bg-gray-50 flex justify-center">
              <a className="mr-5" href={pdfUrl} download="Resume.pdf">
                <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md">
                  Download Resume
                </button>
              </a>
              <a>
                <button
                  onClick={() => {
                    deleteResume();
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md"
                >
                  Delete Resume
                </button>
              </a>
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

export default ResumeViewer;
