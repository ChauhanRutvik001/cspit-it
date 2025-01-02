import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PasswordChange = ({ id }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("New Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New Password and Confirm Password do not match!");
            setIsLoading(false);
            return;
        }

        try {
            const user = { oldPassword, newPassword };
            const url = "auth/change-password";
            const res = await axiosInstance.post(url, user);

            if (res.status === 200) {
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                toast.success(`${res.data.message} Please login again with the new password.`);
                navigate("/browse");
            } else {
                setError(res.data.message || "An error occurred while changing the password.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred while processing your request.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-lg p-8 space-y-6 bg-white bg-opacity-95 rounded-lg shadow-lg"
        >
            {/* Logo */}
            <div className="flex justify-center mb-6">
                <img src="/logo2.jpg" alt="CHARUSAT" className="h-16" />
            </div>

            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
                Change Password
            </h2>

            {error && (
                <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Old Password */}
            <div className="mb-4 relative">
                <input
                    type={showOldPassword ? "text" : "password"}
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter old password"
                />
                <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 focus:outline-none"
                >
                    {showConfirmPassword ? "👁️" : "🙅‍♂️"}
                </button>
            </div>

            {/* New Password */}
            <div className="mb-4 relative">
                <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter new password"
                />
                <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 focus:outline-none"
                >
                    {showConfirmPassword ? "👁️" : "🙅‍♂️"}
                </button>
            </div>

            {/* Confirm Password */}
            <div className="mb-6 relative">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Confirm new password"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 focus:outline-none"
                >
                    {showConfirmPassword ? "👁️" : "🙅‍♂️"}
                </button>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-md transition-transform transform hover:scale-105 focus:scale-95"
            >
                {isLoading ? "Changing password..." : "Change Password"}
            </button>
        </form>
    );
};

export default PasswordChange;
