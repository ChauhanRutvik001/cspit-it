import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch student data from the backend API
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get("/user/profile/getAllstudent"); // Adjust the API endpoint as necessary
        console.log(response.data);
        setStudents(response.data.data); // Assuming the response data is in the 'data' field
        setLoading(false);
      } catch (err) {
        setError("Error fetching student data");
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // Empty dependency array to run only once when component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Student Data</h2>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Batch</th>
            <th className="border p-2">Semester</th>
            <th className="border p-2">Counsellor</th>
            <th className="border p-2">Mobile</th>
            <th className="border p-2">LinkedIn</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="border p-2">{student.id}</td>
              <td className="border p-2">{student.name}</td>

              <td className="border p-2">{student.profile?.batch}</td>
              <td className="border p-2">{student.profile?.semester}</td>
              <td className="border p-2">{student.profile?.counsellor}</td>
              <td className="border p-2">{student.profile?.mobileNo}</td>
              <td className="border p-2">
                <a
                  href={student.profile?.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  LinkedIn
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentData;
