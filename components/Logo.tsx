
import React from 'react';

// SVG representation of the Grupo TeleSapiens logo
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Grupo TeleSapiens Logo"
    >
      <g clipPath="url(#clip0)">
        <path
          d="M47.7,29.9c0-10.3-8.1-18.6-18.1-18.6S11.5,19.6,11.5,29.9s8.1,18.6,18.1,18.6S47.7,40.2,47.7,29.9z M29.6,44.9 c-7.9,0-14.3-6.6-14.3-15S21.7,15,29.6,15s14.3,6.6,14.3,15S37.5,44.9,29.6,44.9z"
          fill="#002D5B"
        />
        <path
          d="M48.2,18.9c-2.7-2.8-6.1-4.8-9.8-5.8c3.2-2.5,7-4,11.1-4c10,0,18.1,8.3,18.1,18.6c0,2.1-0.4,4.2-1,6.1 c-3-2.6-6.8-4.2-10.9-4.2C52.6,29.6,49.9,30.3,48.2,18.9z"
          fill="#007A8D"
        />
        <path
          d="M21,39.4c2.7,2.8,6.1,4.8,9.8,5.8c-3.2,2.5-7,4-11.1,4C9.7,49.2,1.6,40.9,1.6,30.6c0-2.1,0.4-4.2,1-6.1 c3,2.6,6.8,4.2,10.9,4.2C16.6,28.7,19.3,28,21,39.4z"
          fill="#007A8D"
        />
      </g>
      <text
        x="70"
        y="40"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fill="#002D5B"
        fontWeight="bold"
      >
        Grupo TeleSapiens
      </text>
      <defs>
        <clipPath id="clip0">
          <rect width="60" height="60" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
