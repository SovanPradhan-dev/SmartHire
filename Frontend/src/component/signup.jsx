import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");

  // 🔐 Password strength checker
  const checkStrength = (pwd) => {
    if (pwd.length < 6) return "Weak";
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return "Strong";
    return "Medium";
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setStrength(checkStrength(pwd));
  };

  // 🚀 Signup + Auto Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Signup
      await axios.post("http://localhost:3000/user/signup", {
        username,
        email,
        password,
      });

      // 2️⃣ Auto Signin
      const res = await axios.post("http://localhost:3000/user/signin", {
        email,
        password,
      });

      // 3️⃣ Save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/"); // go to quiz
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-[400px] bg-black border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h2 className="text-white text-2xl font-semibold mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">

          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
              required
              name="Username"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
              required
              name="Email"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
              required
              name="Password"
            />
            {password && (
              <span
                className={`text-sm mt-1 ${
                  strength === "Strong"
                    ? "text-green-400"
                    : strength === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                Password strength: {strength}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 transition text-white py-2 rounded font-medium"
          >
            Sign Up
          </button>

          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded font-medium"
          >
            Already have an account? Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
