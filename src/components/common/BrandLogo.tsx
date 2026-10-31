import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false
}) => {
  const iconSizes = {
    sm: 'h-6 w-7',
    md: 'h-8 w-9',
    lg: 'h-10 w-11',
    xl: 'h-12 w-14'
  };

  const textSizes = {
    sm: 'text-base font-semibold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Horizontal Cybernetic Eye Logo Icon from attachment reference */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(216,190,154,0.35)]"
        >
          {/* Outer futuristic brow & circuit traces */}
          <path
            d="M 5 62 C 22 28, 62 14, 94 45 L 82 46 C 75 32, 50 24, 25 44 C 18 50, 12 56, 5 62 Z"
            fill="#d8be9a"
          />
          {/* Circuit branch 1 */}
          <path
            d="M 38 31 L 49 20 L 72 20"
            stroke="#d8be9a"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="74" cy="20" r="3.5" fill="#d8be9a" />

          {/* Circuit branch 2 */}
          <path
            d="M 55 35 L 68 28 L 84 28"
            stroke="#d8be9a"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="86" cy="28" r="3.5" fill="#d8be9a" />

          {/* Lower lid & lower circuit traces */}
          <path
            d="M 15 54 C 28 65, 52 70, 85 52 L 78 57 C 55 72, 32 68, 15 54 Z"
            fill="#d8be9a"
          />
          <path
            d="M 50 67 L 58 75"
            stroke="#d8be9a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="60" cy="76" r="3" fill="#d8be9a" />
          <path
            d="M 64 63 L 70 71"
            stroke="#d8be9a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="71" cy="72" r="3" fill="#d8be9a" />

          {/* Central Iris & Pupil with cybernetic glow */}
          <circle cx="48" cy="48" r="14" fill="#0b2220" stroke="#d8be9a" strokeWidth="3" />
          <circle cx="48" cy="48" r="7.5" fill="#d8be9a" />
          <circle cx="45" cy="45" r="2.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Wordmark strictly horizontal */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`whitespace-nowrap ${textSizes[size]}`}>
          <span className="text-[#fbf8f3] font-semibold">Noava</span>
          <span className="text-[#d8be9a] font-bold">Logix</span>
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-wider text-[#d0c5b4] uppercase mt-0.5 font-medium whitespace-nowrap">
            Intelligent FDR Verification
          </span>
        )}
      </div>
    </div>
  );
};
