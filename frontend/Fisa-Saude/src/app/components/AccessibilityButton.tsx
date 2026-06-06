import { Accessibility } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { AccessibilityPanel } from './AccessibilityPanel';

export function AccessibilityButton() {
  const { isPanelOpen, togglePanel } = useAccessibility();

  return (
    <>
      {/* Botão de Acessibilidade - Lateral Central Direita */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={togglePanel}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-4 rounded-l-xl shadow-2xl transition-all flex flex-col items-center justify-center gap-1 group hover:px-4 focus:outline-none focus:ring-4 focus:ring-primary/30"
          aria-label={isPanelOpen ? 'Fechar painel de acessibilidade' : 'Abrir painel de acessibilidade'}
          aria-expanded={isPanelOpen}
          title="Acessibilidade"
        >
          <Accessibility size={24} className="transition-transform group-hover:scale-110" aria-hidden="true" />
          <span className="text-[10px] font-medium writing-mode-vertical-rl rotate-180 leading-tight">
            Acessibilidade
          </span>
        </button>
      </div>

      {isPanelOpen && <AccessibilityPanel />}
    </>
  );
}
