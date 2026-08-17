import { Accessibility } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { AccessibilityPanel } from './AccessibilityPanel';

export function AccessibilityButton() {
  const {
    isPanelOpen,
    togglePanel,
  } = useAccessibility();

  return (
    <>
      {/* Botão de acessibilidade */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          type="button"
          onClick={togglePanel}
          className="
            bg-primary
            hover:bg-primary/90
            text-primary-foreground
            px-3
            py-4
            rounded-l-xl
            shadow-2xl
            transition-all
            duration-200
            flex
            flex-col
            items-center
            justify-center
            gap-2
            hover:px-4
            focus:outline-none
            focus:ring-4
            focus:ring-primary/30
            min-w-[58px]
            min-h-[90px]
          "
          aria-label={
            isPanelOpen
              ? 'Fechar painel de acessibilidade'
              : 'Abrir painel de acessibilidade'
          }
          aria-expanded={isPanelOpen}
          aria-controls="accessibility-panel"
          title="Acessibilidade"
        >
          <Accessibility
            size={26}
            strokeWidth={2.5}
            aria-hidden="true"
          />

          <span className="text-[11px] font-semibold leading-tight text-center">
            Acessibilidade
          </span>
        </button>
      </div>

      {isPanelOpen && <AccessibilityPanel />}
    </>
  );
}