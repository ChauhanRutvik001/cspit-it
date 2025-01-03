import React from "react";

const ProfileRight = ({
  formData,
  handleInputChange,
  handleSubmit,
  toggleEdit,
  isEditing,
}) => {
  return (
    <div className="flex flex-col space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {isEditing ? "Edit Profile" : "Profile"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your full name"
            required
            disabled={!isEditing}
          />
        </div>

        <div className="">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your full name"
            readOnly
          />
        </div>

        <div className="">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ID
          </label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your full name"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Semester
          </label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Batch
          </label>
          <input
            type="text"
            name="batch"
            value={formData.batch}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your batch"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Counsellor
          </label>
          <input
            type="text"
            name="counsellor"
            value={formData.counsellor}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your counsellor's name"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your mobile number"
            pattern="[0-9]{10}"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Github
          </label>
          <input
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your GitHub profile name"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn
          </label>
          <input
            name="linkedIn"
            value={formData.linkedIn}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your LinkedIn profile URL"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Birthday
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address
          </label>
          <textarea
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
            placeholder="Enter your address"
            rows={3}
            disabled={!isEditing}
          />
        </div>

        {isEditing ? (
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-3 text-lg font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        ) : (
          ""
        )}
      </form>
    </div>
  );
};

export default ProfileRight;
