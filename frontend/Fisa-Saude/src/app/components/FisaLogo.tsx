interface FisaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

const SIZE_CLASS = {
  sm: 'h-9',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-20',
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

  // Logo oficial (ícone + nome + subtítulo)
  return (
    <img
      src="/logo-fisasaude.png"
      alt="Logo Fisa Saúde - Fisioterapia e Pilates"
      className={`${SIZE_CLASS[size]} w-auto object-contain ${className}`}
      decoding="async"
    />
  );
}
