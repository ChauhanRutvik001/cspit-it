import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-serif">
      <div className="px-4 sm:px-8 lg:px-12 w-full flex flex-col items-center bg-white pt-24 sm:pt-28">
        <div className="w-full rounded-xl max-w-5xl bg-white border shadow-md p-6 sm:p-8">
          <div className="flex flex-col-reverse md:flex-row md:items-center gap-6">
            {/* Contact Info */}
            <div className="w-full md:w-2/3">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4">
                Contact Us
              </h1>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Feel free to reach out to us with your inquiries, feedback, or concerns. 
                Our team is here to assist you with any questions you may have.
                <br /><br />
                📩 <strong>Email:</strong> priyankapatel.it@charusat.ac.in
                <br />
                📞 <strong>Phone:</strong> +91 87587 11128
                <br />
                🏛️ <strong>Address:</strong> Charotar University of Science and Technology, CHARUSAT Campus, Off. Nadiad-Petlad Highway, Changa-388421
              </p>
            </div>
            
            {/* Logo */}
            <div className="flex justify-center md:justify-end w-full md:w-1/3">
              <img
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 rounded-xl object-contain"
                src="/collageLogo.jpg"
                alt="collageLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
