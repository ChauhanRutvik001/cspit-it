import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function CompanyPage() {
  const [company, setCompany] = useState({ name: "", domain: "", salary: "" });
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/company/list");
      if (response.status === 200) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error fetching companies", error);
    }
  };

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompanyId) {
        const response = await axiosInstance.put(`/company/${editingCompanyId}`, company);
        if (response.status === 200) {
          setMessage("Company details updated successfully!");
        }
      } else {
        const response = await axiosInstance.post("/company/create", company);
        if (response.status === 201) {
          setMessage("Company details added successfully!");
        }
      }
      setCompany({ name: "", domain: "", salary: "" });
      setEditingCompanyId(null);
      fetchCompanies();
    } catch (error) {
      setMessage("Error saving company details");
      console.error("Error:", error);
    }
  };

  const handleEdit = (comp) => {
    setCompany({ name: comp.name, domain: comp.domain, salary: comp.salary });
    setEditingCompanyId(comp._id);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/company/${id}`);
      setCompanies(companies.filter((comp) => comp._id !== id));
      setMessage("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting company:", error);
      setMessage("Error deleting company");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex flex-col items-center">
      {message && (
        <div className={`p-4 text-center w-full max-w-lg mb-6 rounded-lg shadow-md text-white ${message.includes("Error") ? "bg-red-500" : "bg-green-500"}`}>
          {message}
        </div>
      )}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {editingCompanyId ? "Edit Company" : "Add New Company"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Company Name</label>
              <input type="text" name="name" value={company.name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Domain</label>
              <input type="text" name="domain" value={company.domain} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Salary</label>
              <input type="number" name="salary" value={company.salary} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
            {editingCompanyId ? "Update Company" : "Add Company"}
          </button>
        </form>
      </div>
      <div className="w-full max-w-4xl mt-12 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Companies Overview</h2>
        {companies.length === 0 ? (
          <p className="text-gray-500 text-center">No companies available. Add one above.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="p-3">Company Name</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Salary</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((comp) => (
                <tr key={comp._id} className="border-b hover:bg-gray-100 transition">
                  <td className="p-3">{comp.name}</td>
                  <td className="p-3">{comp.domain}</td>
                  <td className="p-3">${comp.salary.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleEdit(comp)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDelete(comp._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
