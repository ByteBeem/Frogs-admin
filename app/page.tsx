"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Replace this with real auth
    if (adminId === "admin123" && password === "password") {
      setError("");
      // Redirect to admin dashboard
      window.location.href = "/admin";
    } else {
      setError("Incorrect ID or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={80}
            height={30}
            className="dark:invert"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Login
        </h1>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Please login with your Admin ID to access the dashboard.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              ID
            </label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Enter your ID"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Only Admins can access this panel.
        </p>
      </div>
    </div>
  );
}
