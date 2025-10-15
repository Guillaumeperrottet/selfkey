"use client";

import React from "react";

interface AmenityIconProps {
  type:
    | "wifi"
    | "electricity"
    | "water"
    | "showers"
    | "toilets"
    | "wasteDisposal"
    | "parking"
    | "security"
    | "restaurant"
    | "store"
    | "laundry"
    | "playground"
    | "petFriendly";
  className?: string;
  size?: number;
}

export function AmenityIcon({
  type,
  className = "",
  size = 24,
}: AmenityIconProps) {
  const baseClass = "text-[#84994F]";
  const combinedClass = `${baseClass} ${className}`;

  const icons = {
    wifi: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <path
          d="M12 18C12.5523 18 13 18.4477 13 19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19C11 18.4477 11.4477 18 12 18Z"
          fill="currentColor"
        />
        <path
          d="M9.17 14.58C10.0444 13.8574 11.1469 13.4615 12.285 13.4615C13.4231 13.4615 14.5256 13.8574 15.4 14.58"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.83 11.17C7.48844 9.75428 9.63677 9 11.845 9C14.0532 9 16.2016 9.75428 17.86 11.17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 7.75C5.04375 5.57031 8.4375 4.35938 12 4.35938C15.5625 4.35938 18.9562 5.57031 21.5 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    electricity: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <path
          d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    water: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <path
          d="M12 2.69L17.66 8.35C20.78 11.47 20.78 16.53 17.66 19.65C14.54 22.77 9.47 22.77 6.35 19.65C3.23 16.53 3.23 11.47 6.35 8.35L12 2.69Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M12 2.69L17.66 8.35C20.78 11.47 20.78 16.53 17.66 19.65C14.54 22.77 9.47 22.77 6.35 19.65C3.23 16.53 3.23 11.47 6.35 8.35L12 2.69Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    showers: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <circle cx="12" cy="5" r="2" fill="currentColor" opacity="0.3" />
        <path
          d="M4 17V20M8 17V20M12 17V20M16 17V20M20 17V20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 13V16M8 13V16M12 13V16M16 13V16M20 13V16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="2" y="10" width="20" height="2" rx="1" fill="currentColor" />
        <path
          d="M12 10V5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    toilets: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        <ellipse
          cx="12"
          cy="15"
          rx="4"
          ry="5"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M9 12H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    wasteDisposal: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <path
          d="M12 2V8M12 8L9 5M12 8L15 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 10L6 20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20L19 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 10H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10 14V18M14 14V18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    parking: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          fill="currentColor"
          opacity="0.2"
        />
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9 7V17M9 7H13.5C15.1569 7 16.5 8.34315 16.5 10C16.5 11.6569 15.1569 13 13.5 13H9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    security: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <path
          d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12L11 14L15 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    restaurant: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <path
          d="M8 2V11C8 12.1046 8.89543 13 10 13V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M5 2V8M11 2V8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 2V10C16 10 19 10 19 13V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="11" r="1.5" fill="currentColor" />
        <circle cx="19" cy="13" r="1.5" fill="currentColor" />
      </svg>
    ),
    store: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <path
          d="M3 9L5 3H19L21 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 9V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="3"
          y="9"
          width="18"
          height="4"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M9 21V15H15V21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    laundry: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="7" cy="6" r="1" fill="currentColor" />
        <circle cx="10" cy="6" r="1" fill="currentColor" />
        <circle
          cx="12"
          cy="14"
          r="5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M10 14C10 12.8954 10.8954 12 12 12C13.1046 12 14 12.8954 14 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M14 14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    playground: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <circle cx="12" cy="6" r="2" fill="currentColor" />
        <path
          d="M12 8V12M12 12L9 15M12 12L15 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 15V20M15 15V20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 8L8 11L4 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8L16 11L20 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1" fill="currentColor" />
        <circle cx="15" cy="20" r="1" fill="currentColor" />
      </svg>
    ),
    petFriendly: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <ellipse
          cx="8.5"
          cy="8"
          rx="2"
          ry="3"
          fill="currentColor"
          opacity="0.3"
        />
        <ellipse
          cx="15.5"
          cy="8"
          rx="2"
          ry="3"
          fill="currentColor"
          opacity="0.3"
        />
        <ellipse
          cx="5"
          cy="12"
          rx="2"
          ry="2.5"
          fill="currentColor"
          opacity="0.3"
        />
        <ellipse
          cx="19"
          cy="12"
          rx="2"
          ry="2.5"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M12 21C15.866 21 19 17.866 19 14C19 12.5 17.5 11 16 11H8C6.5 11 5 12.5 5 14C5 17.866 8.13401 21 12 21Z"
          fill="currentColor"
          opacity="0.5"
        />
        <ellipse cx="8.5" cy="8" rx="2" ry="3" fill="currentColor" />
        <ellipse cx="15.5" cy="8" rx="2" ry="3" fill="currentColor" />
        <ellipse cx="5" cy="12" rx="2" ry="2.5" fill="currentColor" />
        <ellipse cx="19" cy="12" rx="2" ry="2.5" fill="currentColor" />
      </svg>
    ),
  };

  return icons[type] || null;
}
