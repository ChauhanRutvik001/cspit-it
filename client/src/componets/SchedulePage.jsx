import React from "react";
import Header from "./Header";
import Schedule from "./Schedule";

const SchedulePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-20">
        <Schedule />
      </div>
    </div>
  );
};

export default SchedulePage;
