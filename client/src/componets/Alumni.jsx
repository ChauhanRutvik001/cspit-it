import React, { useEffect, useRef } from 'react';
import Header from './Header';

const alumniData = [
    {
        name: 'John Doe',
        year: 'Class of 2018',
        profession: 'Software Engineer at Google',
        image: 'https://via.placeholder.com/150',
    },
    {
        name: 'Jane Smith',
        year: 'Class of 2020',
        profession: 'Data Scientist at Facebook',
        image: 'https://via.placeholder.com/150',
    },
    {
        name: 'Alice Johnson',
        year: 'Class of 2015',
        profession: 'CEO at StartupX',
        image: 'https://via.placeholder.com/150',
    },
    {
        name: 'Robert Brown',
        year: 'Class of 2019',
        profession: 'Product Manager at Amazon',
        image: 'https://via.placeholder.com/150',
    },
    {
        name: 'Emily Davis',
        year: 'Class of 2016',
        profession: 'UI/UX Designer at Microsoft',
        image: 'https://via.placeholder.com/150',
    },
];

const Alumni = () => {
    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = sliderRef.current;

        let animation;
        const startScrolling = () => {
            animation = setInterval(() => {
                if (slider) {
                    slider.scrollLeft += 1; // Scroll speed
                    if (slider.scrollLeft >= slider.scrollWidth / 2) {
                        // Reset to start of content for seamless looping
                        slider.scrollLeft = 0;
                    }
                }
            }, 10); // Adjust speed here
        };

        startScrolling();

        return () => clearInterval(animation); // Cleanup on unmount
    }, []);

    return (
        <div className='relative min-h-screen bg-gray-100 text-gray-900'>
            <Header />
            <div className="py-10 pt-20">
                <div className="container mx-auto px-4">
                    <div>
                        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Alumni</h1>
                    </div>
                    <div
                        ref={sliderRef}
                        className="flex overflow-hidden space-x-6 py-4 no-scrollbar bg-gray-50"
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {/* Duplicate alumni data for seamless looping */}
                        {[...alumniData, ...alumniData].map((alumni, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 bg-white h-80 border shadow-md rounded-lg p-4 w-64 text-center space-y-8"
                            >
                                <div>
                                    <img
                                        src={alumni.image}
                                        alt={alumni.name}
                                        className="w-40 h-40 mx-auto rounded-full object-cover mb-4"
                                    />
                                </div>
                                
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700">{alumni.name}</h2>
                                    <p className="text-gray-500">{alumni.year}</p>
                                    <p className="text-gray-600">{alumni.profession}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alumni;
