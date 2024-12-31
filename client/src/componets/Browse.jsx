import React, {useState} from "react";
import Header from "./Header";

const Browse = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const [errorMessage, setErrorMessage] = useState(""); // For displaying errors

  const handleJoinQuizClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setJoinCode(""); // Reset code when closing popup
    setErrorMessage(""); // Clear any previous errors
  };


  return (
    <>
      <div className="relative min-h-screen bg-gray-900 text-white">
        <Header />
        {/* Center content both vertically and horizontally */}
        <div className="flex flex-col justify-center items-center px-4 lg:px-20 pt-20 md:pt-[14%] min-h-[70vh]">
          <div className="w-full  bg-white text-black p-8 lg:p-16 rounded-lg shadow-lg bg-opacity-80">
            <h2 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-8">
              Coding Time!
            </h2>
            <p className="mb-5 text-justify text-1xl">
              Test your Coding knowledge with our Coding Contest. Ready to challenge yourself?
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 text-justify"
              // onClick={handleJoinQuizClick}
            >
              Join Contest
            </button>
          </div>
        </div>

        {/* Popup for joining quiz */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 lg:p-10 rounded-lg shadow-2xl max-w-md lg:max-w-lg w-full">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-black">
                Enter Join Codes
              </h2>
              <input
                type="text"
                placeholder="Enter your code"
                className="w-full text-black px-4 py-2 lg:py-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />

              {/* Display error message */}
              {errorMessage && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleClosePopup}
                  className="px-4 py-2 lg:px-6 lg:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  // onClick={handleJoinQuiz}
                  className={`px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Joining..." : "Join Contest"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Browse;
  