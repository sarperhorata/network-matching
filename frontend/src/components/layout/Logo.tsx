interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  showText?: boolean;
}

export function Logo({ size = 'md', variant = 'default', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const textColor = variant === 'white' ? 'text-white' : 'text-[#0A2540]';
  const iconColor = variant === 'white' ? 'text-white' : 'text-[#0A2540]';

  return (
    <div className="flex items-center gap-2">
      {/* Geometrik 12 logosu - iki dikey çizgi (1) ve iki nokta (2) */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Dış çember - networking konsepti */}
          <circle
            cx="16"
            cy="16"
            r="15"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            className="opacity-20"
          />
          
          {/* Sol dikey çizgi (1 rakamının ilk bölümü) */}
          <rect
            x="8"
            y="10"
            width="3"
            height="12"
            rx="1.5"
            fill="url(#logoGradient)"
          />
          
          {/* Sağ bölüm - 2 rakamını temsil eden geometrik şekil */}
          <path
            d="M 18 12 L 24 12 C 24.5 12 25 12.5 25 13 L 25 15 C 25 15.5 24.5 16 24 16 L 19 16 L 18 17 L 18 21 C 18 21.5 18.5 22 19 22 L 25 22"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Gradient tanımı */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="50%" stopColor="#0A2540" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className={`${textSizeClasses[size]} font-semibold tracking-tight ${textColor}`}>
          oniki.net
        </span>
      )}
    </div>
  );
}
