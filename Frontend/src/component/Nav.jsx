import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
// import jwt_decode from "jwt-decode";

const Nav = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <nav className="w-full h-14 bg-black border-b border-gray-700 flex items-center justify-between px-6">
      
      {/* Logo */}
      <h1
        className="text-white font-semibold text-lg cursor-pointer"
        onClick={() => navigate("/")}
      >
        <span className="font-bold border-b border-green-500 p-1">Smart</span>
        <span className="font-bold border-t border-green-500">Hire</span>
      </h1>

      {/* CENTER MENU */}
      <div className="hidden md:flex space-x-8">
        {["Home", "About", "Features", "Contact"].map((item) => (
          <button
            key={item}
            onClick={() => navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`)}
            className="
              text-gray-300 relative
              hover:text-green-400
              transition
              after:content-['']
              after:absolute
              after:left-0
              after:-bottom-1
              after:w-0
              after:h-[2px]
              after:bg-green-500
              after:shadow-[0_0_10px_#22c55e]
              hover:after:w-full
              after:transition-all
            "
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right side */}
      
      <div className="flex items-center space-x-4">
        {user ? (
          // <><header className="flex h-16 items-center justify-end bg-[#0b1220] px-6">
      <ProfileMenu handleLogout={handleLogout} />
        ) : (
          <>
            <button
              onClick={() => navigate("/signin")}
              className="
                bg-blue-600 hover:bg-blue-700
                text-white px-3 py-1 rounded
                shadow-[0_0_8px_rgba(59,130,246,0.7)]
              "
            >
              Sign In
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="
                bg-green-600 hover:bg-green-700
                text-white px-3 py-1 rounded
                shadow-[0_0_8px_rgba(34,197,94,0.7)]
              "
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
