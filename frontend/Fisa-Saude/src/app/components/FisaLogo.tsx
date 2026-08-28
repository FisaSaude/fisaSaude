interface FisaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  /** `onLight` = logo preto (header). `onDark` = logo branco (footer). */
  tone?: 'onLight' | 'onDark';
}

/** Logo horizontal oficial — PNG com fundo transparente */
const SIZE_CLASS = {
  sm: 'h-8 max-h-8 max-w-[180px] sm:max-w-[200px]',
  md: 'h-10 sm:h-11 max-h-11 max-w-[220px] sm:max-w-[260px]',
  lg: 'h-12 sm:h-14 max-h-14 max-w-[260px] sm:max-w-[320px]',
  xl: 'h-14 sm:h-16 max-h-16 max-w-[300px] sm:max-w-[360px]',
} as const;

const LOGO_SRC = {
  onLight: '/logo-fisasaude-header.png',
  onDark: '/logo-fisasaude-footer.png',
} as const;

export function FisaLogo({
  className = '',
  size = 'md',
  variant = 'full',
  tone = 'onLight',
}: FisaLogoProps) {
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
      src={LOGO_SRC[tone]}
      alt="Logo Fisa Saúde - Fisioterapia e Pilates"
      className={`${SIZE_CLASS[size]} w-auto object-contain object-left ${className}`}
      decoding="async"
    />
  );
}
