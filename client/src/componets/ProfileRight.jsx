import React from "react";

const ProfileRight = ({
  formData,
  handleInputChange,
  handleSubmit,
  toggleEdit,
  isEditing,
}) => {
  return (
    <div className="flex flex-col space-y-6 p-6 bg-white text-black rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {isEditing ? "Edit Profile" : "Profile"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            required
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ID<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Semester<span className="text-red-500">*</span></label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isEditing}
          >
            <option value="" disabled>
              Select semester
            </option>
            {[...Array(8).keys()].map((num) => (
              <option key={num + 1} value={num + 1}>
                {num + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Batch<span className="text-red-500">*</span></label>
          <select
            name="batch"
            value={formData.batch}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isEditing}
          >
            <option value="">Select a batch</option>
            <option value="a1">A1</option>
            <option value="a2">A2</option>
            <option value="b1">B1</option>
            <option value="b2">B2</option>
            <option value="c1">C1</option>
            <option value="c2">C2</option>
            <option value="d1">D1</option>
            <option value="d2">D2</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Counsellor<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="counsellor"
            value={formData.counsellor}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your counsellor's name"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your mobile number"
            pattern="[0-9]{10}"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Github<span className="text-red-500">*</span></label>
          <input
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your GitHub profile name"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn<span className="text-red-500">*</span></label>
          <input
            name="linkedIn"
            value={formData.linkedIn}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your LinkedIn profile URL"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Birthday<span className="text-red-500">*</span></label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender<span className="text-red-500">*</span></label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address<span className="text-red-500">*</span></label>
          <textarea
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your address"
            rows={3}
            disabled={!isEditing}
          />
        </div>

        {isEditing && (
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-3 text-lg font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileRight;
