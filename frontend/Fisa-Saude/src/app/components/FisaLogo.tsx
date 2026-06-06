interface FisaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

export function FisaLogo({ className = '', size = 'md', variant = 'full' }: FisaLogoProps) {
  const sizes = {
    sm: { width: 100, height: 40, iconSize: 24, fontSize: 'text-sm' },
    md: { width: 140, height: 48, iconSize: 32, fontSize: 'text-base' },
    lg: { width: 180, height: 60, iconSize: 40, fontSize: 'text-lg' },
    xl: { width: 220, height: 72, iconSize: 48, fontSize: 'text-xl' },
  };

  const { iconSize, fontSize } = sizes[size];

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="FISA Saúde"
        >
          {/* Símbolo médico + coração */}
          <circle cx="24" cy="24" r="22" fill="url(#gradient)" />
          <path
            d="M24 14C24 14 16 18 16 24C16 28 19 31 24 34C29 31 32 28 32 24C32 18 24 14 24 14Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M20 22H28M24 18V26"
            stroke="url(#gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`font-bold ${fontSize} text-foreground`}>
          FISA <span className="text-primary">Saúde</span>
        </span>
      </div>
    );
  }

  // Full variant (icon + text)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="22" fill="url(#gradient-full)" />
          <path
            d="M24 14C24 14 16 18 16 24C16 28 19 31 24 34C29 31 32 28 32 24C32 18 24 14 24 14Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M20 22H28M24 18V26"
            stroke="url(#gradient-full)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient-full" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-bold ${fontSize} text-foreground`}>FISA</span>
        <span className={`${fontSize} text-primary font-semibold`}>Saúde</span>
      </div>
    </div>
  );
}
