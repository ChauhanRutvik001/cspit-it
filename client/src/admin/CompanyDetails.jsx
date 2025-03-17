import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Briefcase, FileText, DollarSign, Globe, Linkedin, ArrowLeft, Save } from "lucide-react";

export default function CompanyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState({ 
    name: "", 
    domain: "", 
    description: "",
    salary: { min: "", max: "" },
    website: "",
    linkedin: ""
  });
  const [loading, setLoading] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  useEffect(() => {
    if (location.state?.company) {
      const comp = location.state.company;
      setCompany({ 
        name: comp.name, 
        domain: comp.domain, 
        description: comp.description,
        salary: {
          min: comp.salary.min,
          max: comp.salary.max
        },
        website: comp.website || "",
        linkedin: comp.linkedin || ""
      });
      setEditingCompanyId(comp._id);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "salaryMin" || name === "salaryMax") {
      setCompany({
        ...company,
        salary: {
          ...company.salary,
          [name === "salaryMin" ? "min" : "max"]: Number(value)
        }
      });
    } else {
      setCompany({ ...company, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCompanyId) {
        const response = await axiosInstance.put(`/company/${editingCompanyId}`, company);
        if (response.status === 200) {
          toast.success("Company details updated successfully!");
        }
      } else {
        const response = await axiosInstance.post("/company/create", company);
        if (response.status === 201) {
          toast.success("Company details added successfully!");
        }
      }
      setCompany({ 
        name: "", 
        domain: "", 
        description: "",
        salary: { min: "", max: "" },
        website: "",
        linkedin: ""
      });
      setEditingCompanyId(null);
      navigate("/company");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving company details");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl my-16 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingCompanyId ? "Edit Company Details" : "Add New Company"}
                  </h2>
                  <p className="text-indigo-100 mt-1">
                    {editingCompanyId ? "Update the company information below" : "Fill in the company details below"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/company")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Companies
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="name" 
                      value={company.name} 
                      onChange={handleChange} 
                      required 
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="domain" 
                      value={company.domain} 
                      onChange={handleChange} 
                      required 
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      placeholder="e.g. Information Technology"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="number" 
                        name="salaryMin" 
                        value={company.salary.min} 
                        onChange={handleChange} 
                        required 
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                        placeholder="Enter minimum salary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="number" 
                        name="salaryMax" 
                        value={company.salary.max} 
                        onChange={handleChange} 
                        required 
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                        placeholder="Enter maximum salary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea 
                      name="description" 
                      value={company.description} 
                      onChange={handleChange} 
                      required 
                      rows="4"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      placeholder="Enter company description"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="url" 
                      name="website" 
                      value={company.website} 
                      onChange={handleChange} 
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Linkedin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="url" 
                      name="linkedin" 
                      value={company.linkedin} 
                      onChange={handleChange} 
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      placeholder="https://linkedin.com/company/example"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => navigate("/company")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-500 hover:to-blue-400 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : (editingCompanyId ? 'Update Company' : 'Add Company')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
