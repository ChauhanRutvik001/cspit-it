import React from 'react';
import Header from './Header';


const Contact = () => {
    return (
    <div className='relative min-h-screen bg-gray-100 text-gray-900'>
        <Header />
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-full max-w-5xl bg-white border shadow-md p-8">
                {/* <div className="flex items-center justify-between">
                
                    <div>
                        <img
                        src="path/to/your/logo.png"
                        alt="Logo"
                        className="w-16 h-16 object-contain"
                        />
                    </div>
                </div> */}

                {/* Contact Us Section */}
                <div className="mt-8 flex items-start">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-black mb-4">Contact Us</h1>
                        <p className="text-gray-600">
                        Feel free to reach out to us with your inquiries, feedback, or concerns. Our team is here to assist you with any questions you may have.
                        <br />
                        Email: contact@example.com
                        <br />
                        Phone: +1 (555) 555-5555
                        </p>
                    </div>
                    <div className="w-64 h-64 bg-gray-200 border ml-8"></div>
                </div>
            </div>
        </div>
    </div>  
  );
};

export default Contact;
