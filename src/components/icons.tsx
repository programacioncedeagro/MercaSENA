import type { SVGProps } from "react";

export function AgroLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5.6.11.82-.26.82-.57v-2.03c-2.78.6-3.37-1.34-3.37-1.34-.54-1.38-1.32-1.75-1.32-1.75-1.08-.74.08-.72.08-.72 1.2.08 1.82 1.23 1.82 1.23 1.07 1.83 2.8 1.3 3.48 1 .1-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23.95-.26 1.98-.4 3-.4s2.05.13 3 .4c2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .31.22.69.83.57A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z" />
    </svg>
  );
}


export function CampeSenaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 70" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        {/* Logo Drop */}
        <path 
          d="M35,60 C5,40 5,15 35,2.5 C65,15 65,40 35,60 Z"
          stroke="#3fa34d" 
          strokeWidth="2"
          fill="none"
        />
        {/* Heart/Leaves */}
        <path d="M35,42 C25,30 35,20 35,20" stroke="#3fa34d" fill="#3fa34d" strokeWidth="1" />
        <path d="M35,42 C45,30 35,20 35,20" stroke="#8b448b" fill="#8b448b" strokeWidth="1" />
        {/* Sun */}
        <circle cx="35" cy="15" r="4" fill="#f3b719" />
      </g>
      <text x="70" y="32" fontFamily="sans-serif" fontSize="24" fontWeight="bold">
        <tspan fill="#8b448b">Campe</tspan>
        <tspan fill="#3fa34d">SENA</tspan>
      </text>
      <text x="70" y="55" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#8b448b">
        ¡Una Esperanza Devida!
      </text>
      {/* Checkmark */}
      <path d="M140 45 l5 5 l10 -10" stroke="#3fa34d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// Kept for reference, but CampeSenaLogo should be used.
export function AgroFuturosLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path 
        d="M50,90 C27.9,90 10,72.1 10,50 C10,27.9 27.9,10 50,10 C72.1,10 90,27.9 90,50"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path 
        d="M50,90 C65,90 75,70 80,50 C85,30 75,10 50,10"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path 
        d="M50,60 C50,60 60,50 70,55"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path 
        d="M50,75 C50,75 40,65 30,70"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
       <path 
        d="M50,45 C50,45 40,35 30,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
