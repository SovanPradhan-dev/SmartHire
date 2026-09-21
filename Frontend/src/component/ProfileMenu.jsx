import { useEffect, useRef, useState } from "react";
import {
  User,
  Settings,
  ShieldCheck,
  Moon,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Camera,
} from "lucide-react";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      
      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-white/10"
      >
        <img
          src="/profile.jpg"
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover border border-white/20"
        />

        <span className="hidden text-sm font-medium text-white md:block">
          Sovan Pradhan
        </span>

        <ChevronRight
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>

      {/* Profile Popup */}
      {open && (
        <div
          className="
            absolute right-0 top-14 z-50
            w-[380px]
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-[#111a29]/95
            shadow-2xl
            backdrop-blur-xl
          "
        >

          {/* Profile Header */}
          <div className="flex items-center gap-4 p-5">

            <div className="relative">
              <img
                src="/profile.jpg"
                alt="Sovan Pradhan"
                className="
                  h-20 w-20 rounded-full
                  object-cover
                  border-2 border-blue-400/40
                "
              />

              {/* Camera */}
              <button
                className="
                  absolute bottom-0 right-0
                  flex h-8 w-8 items-center justify-center
                  rounded-full
                  bg-blue-600
                  text-white
                  shadow-lg
                  hover:bg-blue-500
                "
              >
                <Camera size={15} />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Sovan Pradhan
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                sovan.pradhan@seple.com
              </p>

              <span
                className="
                  mt-2 inline-block
                  rounded-full
                  bg-blue-500/20
                  px-3 py-1
                  text-xs font-medium
                  text-blue-300
                "
              >
                Software Developer
              </span>
            </div>

          </div>

          <div className="mx-4 border-t border-white/10" />

          {/* Menu Items */}
          <div className="p-3">

            <MenuItem
              icon={<User size={21} />}
              label="View Profile"
              active
              onClick={() => console.log("Profile")}
            />

            <MenuItem
              icon={<Settings size={21} />}
              label="Account Settings"
              onClick={() => console.log("Settings")}
            />

            <MenuItem
              icon={<ShieldCheck size={21} />}
              label="Privacy & Security"
              onClick={() => console.log("Privacy")}
            />

            <div className="my-2 border-t border-white/10" />

            {/* Dark Mode */}
            <div
              className="
                flex items-center justify-between
                rounded-xl px-4 py-3
                text-gray-200
                hover:bg-white/5
              "
            >
              <div className="flex items-center gap-4">
                <Moon size={21} />
                <span>Dark Mode</span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  relative h-6 w-11 rounded-full
                  transition
                  ${darkMode ? "bg-blue-600" : "bg-gray-600"}
                `}
              >
                <span
                  className={`
                    absolute top-1 h-4 w-4 rounded-full bg-white
                    transition-all
                    ${darkMode ? "left-6" : "left-1"}
                  `}
                />
              </button>
            </div>

            <MenuItem
              icon={<HelpCircle size={21} />}
              label="Help & Support"
              onClick={() => console.log("Help")}
            />

            <MenuItem
              icon={<FileText size={21} />}
              label="Terms & Privacy"
              onClick={() => console.log("Terms")}
            />

            <div className="my-2 border-t border-white/10" />

            {/* Logout */}
            <button
              onClick={() => console.log("Logout")}
              className="
                flex w-full items-center gap-4
                rounded-xl px-4 py-3
                text-red-400
                transition
                hover:bg-red-500/10
              "
            >
              <LogOut size={21} />
              <span>Log Out</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}


/* Reusable menu item */

function MenuItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center justify-between
        rounded-xl px-4 py-3
        transition
        ${
          active
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/5"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span>{label}</span>
      </div>

      <ChevronRight
        size={18}
        className="text-gray-500"
      />
    </button>
  );
}