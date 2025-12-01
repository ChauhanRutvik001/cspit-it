import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import alumniData from "../data/2026_Student_Data.json";
import { Linkedin, Github, Search, Mail, Users, ArrowLeft } from "lucide-react";

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const highlightMatch = (name, searchTerm) => {
  if (!searchTerm) return name;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return name.replace(regex, "<span class='text-blue-700 font-bold'>$1</span>");
};

const Alumni2022 = () => {
  const navigate = useNavigate();
  const authStatus = useSelector((store) => store.app.authStatus);
  const [searchValue, setSearchValue] = useState("");

  const filteredAlumni = useMemo(() => {
    return alumniData.filter((alumni) =>
      alumni.Name?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const totalAlumni = filteredAlumni.length;
  const linkedinCount = filteredAlumni.filter(a => a.LinkedIn_Profile).length;
  const githubCount = filteredAlumni.filter(a => a.GitHub_Profile).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Back to Dashboard Button for authenticated users */}
        {authStatus && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/placement-dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight drop-shadow-sm">
            2022 Batch Alumni
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Connect with talented graduates making their mark in the tech world
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-4">
            <div className="bg-white rounded-xl px-10 py-7 shadow flex flex-col items-center min-w-[180px]">
              <div className="bg-blue-100 rounded-full p-3 mb-2">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalAlumni}</span>
              <span className="text-base text-gray-700 font-medium mt-1">Total Alumni</span>
            </div>

            <div className="bg-white rounded-xl px-10 py-7 shadow flex flex-col items-center min-w-[180px]">
              <div className="bg-blue-100 rounded-full p-3 mb-2">
                <Linkedin className="w-7 h-7 text-blue-700" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{linkedinCount}</span>
              <span className="text-base text-blue-700 font-medium mt-1">On LinkedIn</span>
            </div>

            <div className="bg-white rounded-xl px-10 py-7 shadow flex flex-col items-center min-w-[180px]">
              <div className="bg-gray-100 rounded-full p-3 mb-2">
                <Github className="w-7 h-7 text-gray-800" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{githubCount}</span>
              <span className="text-base text-gray-700 font-medium mt-1">On GitHub</span>
            </div>
          </div>
        </div>

        <hr className="my-8 border-blue-200" />

        {/* Search Box */}
        <div className="flex items-center justify-center mb-10">
          <div className="relative w-full sm:w-[420px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-white border border-blue-300 rounded-2xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 font-medium shadow-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 outline-none"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

          {filteredAlumni.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg font-semibold py-12">
              No alumni found.
            </div>
          ) : (
            filteredAlumni.map((alumni, idx) => (
              <div
                key={idx}
                className="
                  relative bg-white rounded-2xl shadow-lg border border-blue-100 
                  p-8 flex flex-col items-center group transition-all duration-500
                  hover:border-blue-400 hover:shadow-2xl 
                  hover:scale-[1.03] hover:-translate-y-2 
                  hover:bg-gradient-to-br hover:from-blue-50 hover:to-white
                "
                style={{ minHeight: 300 }}
              >

                {/* Avatar */}
                <div className="mb-4">
                  <div className="relative">

                    {/* Main Circle */}
                    <div className="
                      w-20 h-20 rounded-full 
                      bg-gradient-to-br from-blue-600 to-blue-400 
                      flex items-center justify-center text-3xl font-extrabold text-white 
                      shadow-lg border-4 border-blue-200
                      group-hover:border-blue-500 
                      transition-all duration-500
                    ">
                      {getInitials(alumni.Name)}
                    </div>

                    {/* Glow Ring (Hover Effect) */}
                    <div
                      className="
                        absolute top-0 left-0 w-20 h-20 rounded-full 
                        border-2 border-blue-200 
                        transition-all duration-500 pointer-events-none
                        group-hover:border-blue-500 
                        group-hover:scale-110 
                        group-hover:shadow-[0_0_18px_rgba(30,144,255,0.6)]
                      "
                    ></div>
                  </div>
                </div>

                {/* Name */}
                <div
                  className="font-bold text-xl text-blue-800 mb-2 text-center"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(alumni.Name, searchValue),
                  }}
                ></div>

                {/* Social Links */}
                <div className="flex gap-3 mb-3">
                  {alumni.LinkedIn_Profile && (
                    <a
                      href={alumni.LinkedIn_Profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex items-center gap-1 px-3 py-1 rounded-full 
                        bg-blue-100 text-blue-700 
                        hover:bg-blue-600 hover:text-white font-semibold transition
                      "
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}

                  {alumni.GitHub_Profile && (
                    <a
                      href={alumni.GitHub_Profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex items-center gap-1 px-3 py-1 rounded-full 
                        bg-gray-100 text-gray-700 
                        hover:bg-gray-800 hover:text-white font-semibold transition
                      "
                    >
                      <Github className="w-5 h-5" />
                      <span className="text-sm">GitHub</span>
                    </a>
                  )}
                </div>

                {/* Charusat Email */}
                {alumni.ID_No && (
                  <div className="
                    flex items-center gap-2 text-xs text-blue-800 
                    font-semibold bg-blue-50 rounded px-2 py-1 mb-1
                  ">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{alumni.ID_No.replace(/\s+/g, "").toLowerCase()}@charusat.edu.in</span>
                  </div>
                )}

                {/* Personal Email */}
                {alumni.Personal_Email_ID && (
                  <div className="
                    flex items-center gap-2 text-xs text-gray-700 
                    bg-gray-50 rounded px-2 py-1 mt-1
                  ">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{alumni.Personal_Email_ID}</span>
                  </div>
                )}

              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
};

export default Alumni2022;
