import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';

const Schedule = () => {
  const [role, setRole] = useState('STUDENT'); // Default role (can be fetched from auth context)
  const [schedules, setSchedules] = useState([]);
  const [file, setFile] = useState(null);
  const [scheduleContent, setScheduleContent] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  useEffect(() => {
    // Fetch existing schedules from the backend
    axios.get('/api/schedules')
      .then(response => setSchedules(response.data))
      .catch(err => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleScheduleSubmit = () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('content', scheduleContent);
    formData.append('description', description);

    axios.post('/api/schedules', formData)
      .then(response => {
        setSchedules(prevSchedules => [...prevSchedules, response.data]);
        setFile(null);
        setScheduleContent('');
        setDescription('');
      })
      .catch(err => console.error(err));
  };

  const handleEditSchedule = (id) => {
    const schedule = schedules.find(sch => sch._id === id);
    setEditingScheduleId(id);
    setIsEditing(true);
    setScheduleContent(schedule.content);
    setDescription(schedule.description);
  };

  const handleUpdateSchedule = () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('content', scheduleContent);
    formData.append('description', description);

    axios.put(`/api/schedules/${editingScheduleId}`, formData)
      .then(response => {
        setSchedules(schedules.map(sch => 
          sch._id === editingScheduleId ? response.data : sch
        ));
        setFile(null);
        setScheduleContent('');
        setDescription('');
        setIsEditing(false);
        setEditingScheduleId(null);
      })
      .catch(err => console.error(err));
  };

  const handleDeleteSchedule = (id) => {
    axios.delete(`/api/schedules/${id}`)
      .then(() => {
        setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule._id !== id));
      })
      .catch(err => console.error(err));
  };

  return (
    <div className='relative min-h-screen bg-gray-100 text-gray-900'>
      <Header />
      
      <div className='pt-20 p-4'>
        {role === 'ADMIN' && (
          <div className='mb-4'>
            <h2 className='text-xl font-bold mb-2'>{isEditing ? 'Edit Schedule' : 'Add New Schedule'}</h2>
            <textarea
              value={scheduleContent}
              onChange={(e) => setScheduleContent(e.target.value)}
              placeholder="Schedule content here..."
              className='p-2 mb-2 w-full border rounded'
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description for the file..."
              className='p-2 mb-2 w-full border rounded'
            />
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="p-2 mb-2 border rounded"
            />
            <button 
              onClick={isEditing ? handleUpdateSchedule : handleScheduleSubmit}
              className="p-2 bg-blue-500 text-white rounded"
            >
              {isEditing ? 'Update Schedule' : 'Add Schedule'}
            </button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Schedules</h2>
        {schedules.map((schedule) => (
          <div key={schedule._id} className="p-4 border mb-2 rounded">
            <p>{schedule.content}</p>
            {schedule.fileUrl && (
              <div>
                <a href={schedule.fileUrl} className="text-blue-500" target="_blank" rel="noopener noreferrer">
                  View File
                </a>
                <p>{schedule.description}</p>
              </div>
            )}
            {role === 'ADMIN' && (
              <div className="mt-2">
                <button 
                  onClick={() => handleEditSchedule(schedule._id)} 
                  className="mr-2 p-2 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteSchedule(schedule._id)} 
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
