import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    formLink: '',
    subject: '',
    duration: '',
    availableUntil: '',
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((store) => store.app.user);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/browse');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      console.log('Fetching tests...');
      const response = await axiosInstance.get('/tests');
      console.log('Response:', response);
      
      if (Array.isArray(response.data)) {
        setTests(response.data);
      } else {
        setTests([]);
        toast.error('Invalid response format from server');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tests:', err);
      toast.error(err.response?.data?.message || 'Failed to load tests');
      setTests([]);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/tests/${editingId}`, formData);
        toast.success('Test updated successfully');
      } else {
        await axiosInstance.post('/tests', formData);
        toast.success('Test created successfully');
      }
      setFormData({
        title: '',
        description: '',
        formLink: '',
        subject: '',
        duration: '',
        availableUntil: '',
      });
      setEditingId(null);
      fetchTests();
    } catch (err) {
      console.error('Error submitting test:', err);
      toast.error(err.response?.data?.message || (editingId ? 'Failed to update test' : 'Failed to create test'));
    }
  };

  const handleEdit = (test) => {
    setFormData({
      title: test.title,
      description: test.description,
      formLink: test.formLink,
      subject: test.subject,
      duration: test.duration,
      availableUntil: format(new Date(test.availableUntil), 'yyyy-MM-dd'),
    });
    setEditingId(test._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    
    try {
      await axiosInstance.delete(`/tests/${id}`);
      toast.success('Test deleted successfully');
      fetchTests();
    } catch (err) {
      console.error('Error deleting test:', err);
      toast.error(err.response?.data?.message || 'Failed to delete test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Tests</h1>

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full p-2 border rounded"
              required
              placeholder="e.g. 30 minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Available Until</label>
            <input
              type="date"
              value={formData.availableUntil}
              onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Google Form Link</label>
            <input
              type="url"
              value={formData.formLink}
              onChange={(e) => setFormData({ ...formData, formLink: e.target.value })}
              className="w-full p-2 border rounded"
              required
              placeholder="https://forms.google.com/..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              required
              rows="3"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? 'Update Test' : 'Create Test'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Until</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tests.map((test) => (
              <tr key={test._id}>
                <td className="px-6 py-4 whitespace-nowrap">{test.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{test.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap">{test.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(test.availableUntil), 'PP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(test)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageTests; 