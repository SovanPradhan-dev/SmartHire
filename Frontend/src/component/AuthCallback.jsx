import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const urlError = searchParams.get("error");

    if (urlError) {
      setError(`Google sign-in failed: ${urlError}`);
      const t = setTimeout(() => navigate("/signin"), 2500);
      return () => clearTimeout(t);
    }

    if (!token) {
      setError("No token received from Google. Please try again.");
      const t = setTimeout(() => navigate("/signin"), 2500);
      return () => clearTimeout(t);
    }

    localStorage.setItem("token", token);

    // Hydrate user the same way email/password login does
    axios
      .get("http://localhost:3000/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...res.data, token })
        );
        navigate("/", { replace: true });
      })
      .catch(() => {
        // Token is still valid for ProtectedRoute; profile fetch is best-effort
        navigate("/", { replace: true });
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-[400px] bg-black border border-gray-700 rounded-2xl p-6 shadow-lg text-center">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-white">Signing you in with Google…</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
