import React from "react";
import Header from "./Header";
import "../index.css";

const Developers = () => {
    const studentsData = [
        {
            id: "S001",
            name: "John Doe",
            image: "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg", // Update with actual path
        },
        {
            id: "S002",
            name: "Jane Smith",
            image: "https://techcrunch.com/wp-content/uploads/2016/09/2016_01_23_weebly_45251web.jpg", // Update with actual path
        },
        {
            id: "S003",
            name: "Alice Johnson",
            image: "/assets/student3.jpg", // Update with actual path
        },
        {
            id: "S004",
            name: "Bob Brown",
            image: "/assets/student4.jpg", // Update with actual path
        },
        {
            id: "S005",
            name: "Emma Wilson",
            image: "/assets/student5.jpg", // Update with actual path
        },
    ];

    return (
        <div className="relative min-h-screen bg-gray-100 text-gray-900">
            <Header />
            <div className="pt-20 p-4">
                <div className="text-center  lg:text-left mb-8">
                    <h5 className="text-4xl sm:text-5xl flex justify-center font-inter font-bold mb-12">
                        CDPC-KDPIT
                    </h5>
                    <p className="text-[#505050] sm:mt-0 lg:w-[478px] mx-auto text-justify px-4 sm:px-6 lg:px-0 text-lg font-poppins font-medium">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus excepturi voluptates odit eaque nostrum maxime sequi voluptatum esse praesentium id, quae, quas quia qui eos! Sequi ullam doloremque earum similique?
                    </p>
                </div>
                <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center py-8">
                    {/* Grid Section */}
                    <div className="grid grid-cols-3 gap-8 px-4">
                        {/* First row with 2 cards and logo */}
                        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-6 w-64 h-80">
                            <img
                                src={studentsData[0].image}
                                alt={studentsData[0].name}
                                className="w-40 h-60 object-cover rounded-2xl"
                            />
                            <h2 className="text-xl font-semibold">{studentsData[0].name}</h2>
                            <p className="text-gray-500">ID: {studentsData[0].id}</p>
                        </div>
                        {/* Logo in the center */}
                        <div className="flex items-center justify-center w-64 h-64 bg-gray-200 rounded-lg shadow-inner">
                            <div className="text-3xl font-bold">LOGO</div>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-6 w-64 h-80">
                            <img
                                src={studentsData[1].image}
                                alt={studentsData[1].name}
                                className="w-40 h-60 object-cover rounded-2xl"
                            />
                            <h2 className="text-xl font-semibold">{studentsData[1].name}</h2>
                            <p className="text-gray-500">ID: {studentsData[1].id}</p>
                        </div>

                        {/* Second row with remaining cards */}
                        {studentsData.slice(2).map((student, index) => (
                            <div
                                key={index}
                                className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-6 w-64 h-80"
                            >
                                <img
                                    src={student.image}
                                    alt={student.name}
                                    className="w-32 h-40 object-cover rounded-full"
                                />
                                <h2 className="text-xl font-semibold">{student.name}</h2>
                                <p className="text-gray-500">ID: {student.id}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Developers;