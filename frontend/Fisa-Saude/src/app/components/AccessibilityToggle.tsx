import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function AccessibilityToggle() {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    const saved = localStorage.getItem('high-contrast');
    return saved === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('high-contrast', String(isHighContrast));
  }, [isHighContrast]);

  return (
    <button
      onClick={() => setIsHighContrast(!isHighContrast)}
      className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 font-medium min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={isHighContrast ? 'Desativar modo de alto contraste' : 'Ativar modo de alto contraste'}
      aria-pressed={isHighContrast}
      title={isHighContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
    >
      {isHighContrast ? (
        <>
          <EyeOff size={20} aria-hidden="true" />
          <span className="hidden sm:inline">Alto Contraste</span>
        </>
      ) : (
        <>
          <Eye size={20} aria-hidden="true" />
          <span className="hidden sm:inline">Alto Contraste</span>
        </>
      )}
    </button>
  );
}
