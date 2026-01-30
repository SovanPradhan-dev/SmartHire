import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer
      className="fixed bottom-0 w-full h-14 bg-black
                 border-t border-green-500
                 text-gray-300 flex items-center justify-between
                 px-6 text-sm
                 shadow-[0_-2px_20px_rgba(34,197,94,0.3)]"
    >
      {/* LEFT */}
      <span>
        © 2025 <span className="text-green-400 font-semibold">Smart Hire</span>
      </span>

      {/* CENTER */}
      <span className="hidden md:block">
        All rights reserved
      </span>

      {/* RIGHT LINKS */}
      <div className="flex space-x-5">
        {[
          { label: "Privacy", path: "/privacy" },
          { label: "Terms", path: "/terms" },
          { label: "Contact", path: "/contact" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="hover:text-green-400 transition
                       hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
