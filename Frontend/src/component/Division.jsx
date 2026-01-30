import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Division = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "bg-blue-900" : "";
  };

  return (
    <div className="w-screen flex">
      <div
        className={`${isActive('/interview')} bg-black w-1/2 h-14 text-white rounded border border-white flex items-center justify-center`}
        onClick={() => navigate('/interview')}
      >
        Interview
      </div>

      <div
        className={`${isActive('/interviewer')} bg-black w-1/2 h-14 text-white rounded border border-white flex items-center justify-center`}
        onClick={() => navigate('/interviewer')}
      >
        Interviewer
      </div>
    </div>
  );
};

export default Division;
