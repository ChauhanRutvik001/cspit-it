import React from 'react';
import Header from './Header';

const NotFoundError = () => {
  return (
    <>
      <div className='relative min-h-screen bg-gray-900 text-white flex flex-col'>
        <div className='flex-grow flex items-center justify-center p-4 md:p-0'>
          <section className='text-center max-w-md mx-auto'>
            <div className="mb-8">
              <svg
                id="Layer_1"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 300"
                className="illustration w-full h-auto" // Use Tailwind CSS for responsiveness
              >
                {/* SVG Paths */}
                <path d="M95.85,121.73c-27.66,4.91-47.21,29-44,55.43,1.71,14,8.64,26.43,26.47,30,47.3,9.51,225.85,45.31,260.93-16.72,27.35-48.34,11.05-81.81-14.35-102.76s-78-16.6-121.53-2.26C171,96.11,146.93,112.65,95.85,121.73Z" fill="#e6e6e6" opacity="0.3"></path>
                <ellipse cx="205.6" cy="245.02" rx="161.02" ry="11.9" fill="#e6e6e6" opacity="0.45"></ellipse>
                <circle cx="115.32" cy="60.66" r="19.14" fill="#ffd200"></circle>
                <circle cx="115.32" cy="60.66" r="36.49" fill="#ffd200" opacity="0.15"></circle>
                <circle cx="195.69" cy="193.3" r="51.17" fill="#24285b"></circle>
                <circle cx="195.69" cy="193.3" r="32.21" fill="#fff"></circle>
                <path d="M133.91,205.51c3.39,0,4.61,1.22,4.61,4.6v5.83c0,3.39-1,4.61-4.61,4.61h-9.35V238.3c0,3.38-1.22,4.6-4.61,4.6h-6.64c-3.38,0-4.6-1.22-4.6-4.6V220.55H64c-3.38,0-4.6-1.22-4.6-4.61v-4.88A9,9,0,0,1,61,205.51l45-55.83a8.07,8.07,0,0,1,6.5-3.25H120c3.39,0,4.61.95,4.61,4.61v54.47Zm-25.2-36.32L79.3,205.51h29.41Z" fill="#68e1fd"></path>
                <path d="M327.42,205.51c3.39,0,4.61,1.22,4.61,4.6v5.83c0,3.39-.95,4.61-4.61,4.61h-9.35V238.3c0,3.38-1.22,4.6-4.61,4.6h-6.64c-3.38,0-4.6-1.22-4.6-4.6V220.55H257.5c-3.38,0-4.6-1.22-4.6-4.61v-4.88a9,9,0,0,1,1.62-5.55l45-55.83a8.07,8.07,0,0,1,6.5-3.25h7.45c3.39,0,4.61.95,4.61,4.61v54.47Zm-25.2-36.32-29.41,36.32h29.41Z" fill="#68e1fd"></path>
                <path d="M307.35,135.53s-8.51-2.32-10.36-10.25c0,0,13.19-2.66,13.57,10.95Z" fill="#68e1fd" opacity="0.58"></path>
                <path d="M308.4,134.69s-5.95-9.41-.72-18.2c0,0,10,6.37,5.58,18.22Z" fill="#68e1fd" opacity="0.73"></path>
                <path d="M309.93,134.7s3.14-9.94,12.65-11.82c0,0,1.78,6.45-6.16,11.84Z" fill="#68e1fd"></path>
                <polygon points="303.76 134.47 305.48 146.28 316.35 146.33 317.95 134.53 303.76 134.47" fill="#24285b"></polygon>
                <path d="M201.88,126.11s1.4,6.75.79,11.43a3.46,3.46,0,0,1-3.91,3c-2.35-.34-5.43-1.48-6.62-5l-2.76-5.75a6.21,6.21,0,0,1,1.93-6.9C194.85,119.63,201.23,122,201.88,126.11Z" fill="#f4a28c"></path>
                <polygon points="189.88 130.8 188.98 153.41 201.47 153.01 197.11 136.72 189.88 130.8" fill="#f4a28c"></polygon>
                <path d="M200.21,126.59a27.36,27.36,0,0,1-6.37.27,5.76,5.76,0,0,1,.74,6.27,4.68,4.68,0,0,1-5.4,2.52l-.93-8.82a7,7,0,0,1,2.8-6.64,24.34,24.34,0,0,1,2.77-1.79c2.41-1.32,6.32-.07,8.39-2.05a1.67,1.67,0,0,1,2.75.78c.72,2.63.74,6.9-2.71,8.79A6.36,6.36,0,0,1,200.21,126.59Z" fill="#24285b"></path>
                <path d="M195.29,132.84s-.36-2.64-2.32-2.2-1.46,4.25,1.28,4.28Z" fill="#f4a28c"></path>
                <path d="M202.54,130.41l2.23,2.41a1.11,1.11,0,0,1-.49,1.81l-2.56.8Z" fill="#f4a28c"></path>
                <path d="M198.22,140.25a8.24,8.24,0,0,1-4.3-1.92s.66,4.09,5.66,7.61Z" fill="#ce8172" opacity="0.31"></path>
                <path d="M189,153.41l12.49-.4s19.62-3.33,26.43,12.67S226,204.29,226,204.29,218.9,228.16,189,225.52c0,0-24.87-1.44-27.68-35.53a33.25,33.25,0,0,0-.68-4.42C159.5,180.24,158.84,164.07,189,153.41Z" fill="#68e1fd"></path>
              </svg>
            </div>
            <h1 className='text-2xl md:text-3xl font-bold mb-4'>
              404 - Page Not Found
            </h1>
            <p className='text-gray-400 mb-8'>
              Oops! The page you are looking for does not exist.
            </p>
            <a href="/" className='inline-block px-6 py-3 bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 transition duration-300'>
              Go to Home
            </a>
          </section>
        </div>
      </div>
    </>
  );
}

export default NotFoundError;



