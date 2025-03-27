import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft } from 'react-icons/fa';

const TestView = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to convert any Google Form URL to embedded format
  const getEmbeddedFormUrl = (url) => {
    try {
      let formId = '';
      if (url.includes('/forms/d/e/')) {
        formId = url.split('/forms/d/e/')[1].split('/')[0];
      } else if (url.includes('/forms/d/')) {
        formId = url.split('/forms/d/')[1].split('/')[0];
      } else {
        console.error('Invalid Google Form URL format');
        return url;
      }
      return `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;
    } catch (error) {
      console.error('Error formatting Google Form URL:', error);
      return url;
    }
  };

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await axiosInstance.get(`/tests/${testId}`);
        setTest(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load test. Please try again later.');
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'Test not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tests')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tests
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{test?.title}</h1>
          <p className="text-gray-600 mb-4">{test?.description}</p>
          <div className="space-y-2 mb-6">
            <p className="text-sm">
              <span className="font-medium">Subject:</span> {test?.subject}
            </p>
            <p className="text-sm">
              <span className="font-medium">Duration:</span> {test?.duration}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <iframe
            src={getEmbeddedFormUrl(test?.formLink)}
            width="100%"
            height="800px"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            className="w-full"
          >
            Loading form...
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default TestView; 