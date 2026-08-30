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
      <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          type="button"
          onClick={togglePanel}
          className="
            bg-primary
            hover:bg-primary/90
            text-primary-foreground

            px-2
            py-2

            rounded-l-lg
            shadow-lg

            transition-all
            duration-200

            flex
            flex-col
            items-center
            justify-center
            gap-1

            focus:outline-none
            focus:ring-2
            focus:ring-primary/30

            min-w-[42px]
            min-h-[62px]
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
            size={17}
            strokeWidth={2.5}
            aria-hidden="true"
          />

          <span className="text-[8px] font-semibold leading-[9px] text-center">
            Acessibilidade
          </span>
        </button>
      </div>

      {/* Painel de acessibilidade */}
      {isPanelOpen && <AccessibilityPanel />}
    </>
  );
}
