import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/user/signin", {
        email,
        password,
      });

      // ✅ Save JWT
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/"); // go to quiz
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-[400px] bg-black border border-gray-700 rounded-2xl p-6 shadow-lg">
        
        <h2 className="text-white text-2xl font-semibold mb-6 text-center">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded font-medium"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="bg-green-600 hover:bg-green-700 transition text-white py-2 rounded font-medium"
          >
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
