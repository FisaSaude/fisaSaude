import { useAccessibility } from '../contexts/AccessibilityContext';
import { Languages } from 'lucide-react';

export function LibrasIndicator() {
  const { settings } = useAccessibility();

  if (!settings.librasEnabled) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-300">
      <Languages size={20} aria-hidden="true" />
      <span className="text-sm font-medium">Libras disponível</span>
    </div>
  );
}
