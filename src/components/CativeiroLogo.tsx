import React from "react";

interface CativeiroLogoProps {
  className?: string;
  size?: number | string;
}

export function CativeiroLogo({ className = "", size = "100%" }: CativeiroLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Paths for text curving */}
          {/* Top arc (clockwise) */}
          <path id="textPathTop" d="M 32,90 A 88,72 0 0,1 208,90" />
          {/* Bottom arc (clockwise but we adjust spacing) */}
          <path id="textPathBottom" d="M 32,90 A 88,72 0 0,0 208,90" />
          
          <linearGradient id="blueOvalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          
          {/* Heart stroke masks or details */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Elegant Blue Oval */}
        <ellipse
          cx="120"
          cy="90"
          rx="110"
          ry="82"
          fill="url(#blueOvalGrad)"
          stroke="#ffffff"
          strokeWidth="3"
          filter="url(#shadow)"
        />

        {/* White Inner Oval Ring Accent */}
        <ellipse
          cx="120"
          cy="90"
          rx="102"
          ry="74"
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Curved Texts with dynamic text-paths */}
        <text fill="#ffffff" fontSize="10.8" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.05em">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            INSTITUTO SOCIAL CATIVEIRO
          </textPath>
        </text>

        <text fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.05em">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            CATIVANDO PARA TRANSFORMAR
          </textPath>
        </text>

        {/* Central Heart Handshake Graphic Container */}
        <g transform="translate(120, 92) scale(0.95)" filter="url(#shadow)">
          {/* Outer circle background for the handshake */}
          <circle cx="0" cy="0" r="42" fill="#ffffff" />
          
          {/* Double Hands Shaking forming a Heart shape */}
          <g transform="translate(0, -2)">
            {/* Heart Background */}
            <path
              d="M 0,22 C -45,-15 -25,-42 0,-18 C 25,-42 45,-15 0,22 Z"
              fill="#eff6ff"
            />
            
            {/* Dark Brown Hand on Left */}
            <path
              d="M -22,-3 C -18,-15 -2,-18 5,-8 C 10,-3 14,3 10,12 C 7,18 -3,20 -10,16 C -18,11 -25,4 -22,-3 Z"
              fill="#8d5a36" 
            />
            
            {/* Light Caucasian Hand on Right */}
            <path
              d="M 22,-3 C 18,-15 2,-18 -5,-8 C -10,-3 -14,3 -10,12 C -7,18 3,20 10,16 C 18,11 25,4 22,-3 Z"
              fill="#e2ba9e"
            />

            {/* Overlapping Shaking Fingers (Handshake details) */}
            {/* Custom vector showing fingers locking together inside the heart */}
            <g transform="translate(-1, 2) scale(0.9)">
              {/* Shaking Wrist left cuff */}
              <path d="M -24,-1 L -15,4 L -18,10 L -25,5 Z" fill="#6f3f1b" />
              {/* Shaking Wrist right cuff */}
              <path d="M 24,-1 L 15,4 L 18,10 L 25,5 Z" fill="#cba283" />

              {/* Fingertips / lines detailed */}
              {/* Handshake Center */}
              <path d="M -8,1 L 8,1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M -6,5 L 6,5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M -4,9 L 4,9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M -2,13 L 2,13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
          
          {/* Foundation Date stamp inside central emblem */}
          <text x="0" y="32" fill="#2563eb" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            18/02/2017
          </text>
        </g>
      </svg>
    </div>
  );
}
