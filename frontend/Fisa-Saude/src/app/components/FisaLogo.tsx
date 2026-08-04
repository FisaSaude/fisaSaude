interface FisaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

/** Logo horizontal oficial — ideal para header */
const SIZE_CLASS = {
  sm: 'h-8 max-w-[160px]',
  md: 'h-11 max-w-[220px]',
  lg: 'h-14 max-w-[280px]',
  xl: 'h-16 max-w-[320px]',
} as const;

export function FisaLogo({ className = '', size = 'md', variant = 'full' }: FisaLogoProps) {
  if (variant === 'text') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-bold text-foreground tracking-tight">
          FISA <span className="text-primary font-semibold">Saúde</span>
        </span>
      </div>
    );
  }

  return (
    <img
      src="/logo-fisasaude-header.png"
      alt="Logo Fisa Saúde - Fisioterapia e Pilates"
      className={`${SIZE_CLASS[size]} w-auto object-contain object-left ${className}`}
      decoding="async"
    />
  );
}
