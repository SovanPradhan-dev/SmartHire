import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const steps = [
  {
    path: "/interview",
    icon: (
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 11.917 9.724 16.5 19 7.5"
      />
    ),
  },
  {
    path: "/quiz",
    icon: (
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
      />
    ),
  },
  {
    path: "/compiler",
    icon: (
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 7 2 2 4-4m-5-9v4h4V3h-4Z"
      />
    ),
  },
];

const Floating = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
  <ol className="flex flex-col items-center
  fixed right-6 top-1/2 -translate-y-1/2
  bg-black/50 p-4 rounded-2xl
  shadow-lg z-50 space-y-6 text-white border border-white"
>
  {steps.map((step, index) => {
    const isActive = pathname === step.path;
    const isLast = index === steps.length - 1;

    return (
      <li key={step.path} className="flex flex-col items-center">
        <button
          onClick={() => navigate(step.path)}
          className={`flex items-center justify-center
            w-10 h-10 lg:w-12 lg:h-12 rounded-full
            transition-all duration-200
            ${
              isActive
                ? "bg-brand-softer text-fg-brand ring-2 ring-brand-subtle"
                : "bg-neutral-tertiary text-body hover:bg-neutral-secondary"
            }
          `}
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            {step.icon}
          </svg>
        </button>

        {!isLast && (
          <span
            className={`w-1 h-8 my-2 rounded-full transition-colors
              ${isActive ? "bg-brand-subtle" : "bg-default"}
            `}
          />
        )}
      </li>
    );
  })}
</ol>
    );
}
export default Floating;
