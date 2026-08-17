import {
  X,
  Eye,
  Volume2,
  Hand,
  Brain,
  RotateCcw,
  ChevronDown,
  Check,
} from 'lucide-react';

import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/*
 * =========================================================
 * SEÇÃO DO PAINEL
 * =========================================================
 */

function Section({
  icon: Icon,
  title,
  description,
  children,
  defaultOpen = false,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const sectionId = useId();
  const contentId = `${sectionId}-content`;
  const titleId = `${sectionId}-title`;

  return (
    <section
      className="border-b border-border last:border-b-0"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="
          w-full
          flex
          items-start
          gap-4
          p-4
          hover:bg-muted/30
          transition-colors
          text-left
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary
          focus-visible:ring-inset
        "
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div
          className="
            w-10
            h-10
            bg-primary/10
            rounded-lg
            flex
            items-center
            justify-center
            flex-shrink-0
          "
          aria-hidden="true"
        >
          <Icon
            className="text-primary"
            size={20}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            id={titleId}
            className="font-semibold text-foreground mb-1"
          >
            {title}
          </h3>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <ChevronDown
          className={`
            text-muted-foreground
            flex-shrink-0
            transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `}
          size={20}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={contentId}
          className="px-4 pb-4 space-y-3"
        >
          {children}
        </div>
      )}
    </section>
  );
}


/*
 * =========================================================
 * OPÇÃO DE TOGGLE
 * =========================================================
 */

interface ToggleOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: ToggleOptionProps) {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div
      className="
        flex
        items-start
        gap-3
        p-3
        rounded-lg
        hover:bg-muted/30
        transition-colors
      "
    >
      <div className="flex items-center h-6">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          className="sr-only peer"
          aria-describedby={
            description
              ? descriptionId
              : undefined
          }
        />

        <label
          htmlFor={id}
          className="
            relative
            block
            w-11
            h-6
            bg-muted
            rounded-full
            cursor-pointer
            peer-focus-visible:outline-none
            peer-focus-visible:ring-2
            peer-focus-visible:ring-primary
            peer-checked:bg-primary
            transition-colors
          "
          aria-label={`${label}: ${
            checked ? 'ativado' : 'desativado'
          }`}
        >
          <span
            className={`
              absolute
              top-0.5
              left-0.5
              w-5
              h-5
              bg-white
              rounded-full
              shadow-sm
              transition-transform
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
            aria-hidden="true"
          />
        </label>
      </div>

      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className="
            block
            font-medium
            text-foreground
            cursor-pointer
          "
        >
          {label}
        </label>

        {description && (
          <p
            id={descriptionId}
            className="
              text-sm
              text-muted-foreground
              mt-0.5
            "
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}


/*
 * =========================================================
 * TAMANHO DA FONTE
 * =========================================================
 */

interface FontSizeOptionProps {
  size: 'small' | 'normal' | 'large' | 'x-large';
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function FontSizeOption({
  size,
  label,
  description,
  selected,
  onClick,
}: FontSizeOptionProps) {
  const id = useId();

  const sizeMap = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    'x-large': 'text-xl',
  };

  return (
    <label
      htmlFor={id}
      className={`
        flex
        items-center
        justify-between
        p-3
        rounded-lg
        border-2
        transition-all
        min-h-[52px]
        cursor-pointer

        ${
          selected
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="radio"
          name="accessibility-font-size"
          value={size}
          checked={selected}
          onChange={onClick}
          className="
            sr-only
            peer
          "
          aria-label={`${label}, ${description}`}
        />

        <span
          className={`
            font-medium
            ${sizeMap[size]}
          `}
          aria-hidden="true"
        >
          {label}
        </span>

        <span className="sr-only">
          {description}
        </span>
      </div>

      {selected && (
        <Check
          className="text-primary"
          size={20}
          aria-hidden="true"
        />
      )}
    </label>
  );
}


/*
 * =========================================================
 * PAINEL PRINCIPAL
 * =========================================================
 */

export function AccessibilityPanel() {
  const {
    settings,
    updateSetting,
    resetSettings,
    togglePanel,
  } = useAccessibility();

  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * Guarda o elemento que tinha foco
   * antes do painel abrir.
   */
  const previousFocusedElement =
    useRef<HTMLElement | null>(null);

  /*
   * =======================================================
   * FOCO INICIAL + ESC
   * =======================================================
   */

  useEffect(() => {
    previousFocusedElement.current =
      document.activeElement as HTMLElement;

    /*
     * Coloca o foco no painel.
     */
    const timer = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    /*
     * ESC fecha o painel.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        togglePanel();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.clearTimeout(timer);

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [togglePanel]);

  /*
   * =======================================================
   * DEVOLVE O FOCO PARA O BOTÃO
   * =======================================================
   */

  useEffect(() => {
    return () => {
      window.setTimeout(() => {
        previousFocusedElement.current?.focus();
      }, 0);
    };
  }, []);

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-end
        sm:items-center
        justify-center
        bg-black/50
        backdrop-blur-sm
        animate-in
        fade-in
        duration-200
      "
      role="presentation"
    >

      {/* ===================================================
          FUNDO
          =================================================== */}

      <button
        type="button"
        className="
          absolute
          inset-0
          cursor-default
        "
        aria-label="Fechar painel de acessibilidade"
        onClick={togglePanel}
        tabIndex={-1}
      />

      {/* ===================================================
          PAINEL
          =================================================== */}

      <div
        ref={panelRef}
        id="accessibility-panel"
        className="
          relative
          bg-card
          w-full
          sm:max-w-2xl
          sm:rounded-2xl
          shadow-2xl
          max-h-[90vh]
          flex
          flex-col
          animate-in
          slide-in-from-bottom
          sm:slide-in-from-bottom-0
          duration-300
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
        aria-describedby="accessibility-description"
        tabIndex={-1}
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <header
          className="
            flex
            items-center
            justify-between
            p-6
            border-b
            border-border
          "
        >
          <div>
            <h2
              id="accessibility-title"
              className="
                text-2xl
                font-bold
                text-foreground
              "
            >
              Central de Acessibilidade
            </h2>

            <p
              id="accessibility-description"
              className="
                text-sm
                text-muted-foreground
                mt-1
              "
            >
              Personalize sua experiência de navegação
            </p>
          </div>

          <button
            type="button"
            onClick={togglePanel}
            className="
              p-2
              hover:bg-muted
              rounded-lg
              transition-colors
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
            "
            aria-label="Fechar painel de acessibilidade"
          >
            <X
              size={24}
              aria-hidden="true"
            />
          </button>
        </header>


        {/* =================================================
            CONTEÚDO
            ================================================= */}

        <div
          className="
            flex-1
            overflow-y-auto
          "
        >

          {/* =================================================
              VISUAL
              ================================================= */}

          <Section
            icon={Eye}
            title="Acessibilidade Visual"
            description="Ajustes para melhorar a visualização do conteúdo"
            defaultOpen={true}
          >

            <ToggleOption
              label="Modo Alto Contraste"
              description="Aumenta o contraste entre textos e fundos"
              checked={settings.highContrast}
              onChange={(checked) =>
                updateSetting(
                  'highContrast',
                  checked
                )
              }
            />

            <fieldset className="space-y-2">
              <legend
                className="
                  block
                  font-medium
                  text-foreground
                "
              >
                Tamanho da Fonte
              </legend>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                "
                role="radiogroup"
                aria-label="Tamanho da fonte"
              >

                <FontSizeOption
                  size="small"
                  label="A-"
                  description="Fonte pequena"
                  selected={
                    settings.fontSize === 'small'
                  }
                  onClick={() =>
                    updateSetting(
                      'fontSize',
                      'small'
                    )
                  }
                />

                <FontSizeOption
                  size="normal"
                  label="A"
                  description="Fonte normal"
                  selected={
                    settings.fontSize === 'normal'
                  }
                  onClick={() =>
                    updateSetting(
                      'fontSize',
                      'normal'
                    )
                  }
                />

                <FontSizeOption
                  size="large"
                  label="A+"
                  description="Fonte grande"
                  selected={
                    settings.fontSize === 'large'
                  }
                  onClick={() =>
                    updateSetting(
                      'fontSize',
                      'large'
                    )
                  }
                />

                <FontSizeOption
                  size="x-large"
                  label="A++"
                  description="Fonte muito grande"
                  selected={
                    settings.fontSize === 'x-large'
                  }
                  onClick={() =>
                    updateSetting(
                      'fontSize',
                      'x-large'
                    )
                  }
                />

              </div>
            </fieldset>

            <ToggleOption
              label="Fonte para Dislexia"
              description="Usa uma fonte especialmente projetada para facilitar a leitura"
              checked={settings.dyslexiaFont}
              onChange={(checked) =>
                updateSetting(
                  'dyslexiaFont',
                  checked
                )
              }
            />

            <ToggleOption
              label="Legibilidade Aumentada"
              description="Aumenta o espaçamento entre linhas e letras"
              checked={
                settings.increasedReadability
              }
              onChange={(checked) =>
                updateSetting(
                  'increasedReadability',
                  checked
                )
              }
            />

            <ToggleOption
              label="Destacar Links e Botões"
              description="Realça elementos clicáveis para facilitar a identificação"
              checked={
                settings.highlightLinks
              }
              onChange={(checked) =>
                updateSetting(
                  'highlightLinks',
                  checked
                )
              }
            />

          </Section>


          {/* =================================================
              AUDITIVA
              ================================================= */}

          <Section
            icon={Volume2}
            title="Acessibilidade Auditiva"
            description="Recursos visuais para comunicação"
          >

            <ToggleOption
              label="Indicadores Visuais"
              description="Mostra alertas visuais para notificações e sons"
              checked={
                settings.visualIndicators
              }
              onChange={(checked) =>
                updateSetting(
                  'visualIndicators',
                  checked
                )
              }
            />

            <ToggleOption
              label="Suporte para Libras"
              description="Exibe indicador de disponibilidade de conteúdo em Libras"
              checked={
                settings.librasEnabled
              }
              onChange={(checked) =>
                updateSetting(
                  'librasEnabled',
                  checked
                )
              }
            />

          </Section>


          {/* =================================================
              MOTORA
              ================================================= */}

          <Section
            icon={Hand}
            title="Acessibilidade Motora"
            description="Facilita a interação e navegação"
          >

            <ToggleOption
              label="Botões Maiores"
              description="Aumenta o tamanho dos botões e áreas clicáveis"
              checked={
                settings.largerButtons
              }
              onChange={(checked) =>
                updateSetting(
                  'largerButtons',
                  checked
                )
              }
            />

            <ToggleOption
              label="Espaçamento Aumentado"
              description="Adiciona mais espaço entre elementos interativos"
              checked={
                settings.increasedSpacing
              }
              onChange={(checked) =>
                updateSetting(
                  'increasedSpacing',
                  checked
                )
              }
            />

            <ToggleOption
              label="Navegação Simplificada"
              description="Reduz opções e simplifica menus"
              checked={
                settings.simplifiedNavigation
              }
              onChange={(checked) =>
                updateSetting(
                  'simplifiedNavigation',
                  checked
                )
              }
            />

            <ToggleOption
              label="Navegação por Teclado"
              description="Otimiza a navegação usando apenas o teclado"
              checked={
                settings.keyboardNavigation
              }
              onChange={(checked) =>
                updateSetting(
                  'keyboardNavigation',
                  checked
                )
              }
            />

          </Section>


          {/* =================================================
              COGNITIVA
              ================================================= */}

          <Section
            icon={Brain}
            title="Acessibilidade Cognitiva"
            description="Simplifica o entendimento do conteúdo"
          >

            <ToggleOption
              label="Linguagem Simples"
              description="Usa termos mais simples e diretos"
              checked={
                settings.simpleLanguage
              }
              onChange={(checked) =>
                updateSetting(
                  'simpleLanguage',
                  checked
                )
              }
            />

            <ToggleOption
              label="Reduzir Animações"
              description="Minimiza movimentos e transições"
              checked={
                settings.reducedAnimations
              }
              onChange={(checked) =>
                updateSetting(
                  'reducedAnimations',
                  checked
                )
              }
            />

            <ToggleOption
              label="Mostrar Texto em Ícones"
              description="Exibe rótulos de texto junto aos ícones"
              checked={
                settings.showIconText
              }
              onChange={(checked) =>
                updateSetting(
                  'showIconText',
                  checked
                )
              }
            />

          </Section>

        </div>


        {/* =================================================
            FOOTER
            ================================================= */}

        <footer
          className="
            p-4
            border-t
            border-border
            bg-muted/30
          "
        >

          <button
            type="button"
            onClick={resetSettings}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-3
              bg-muted
              hover:bg-muted/80
              text-foreground
              rounded-lg
              transition-colors
              font-medium
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              min-h-[48px]
            "
            aria-label="Restaurar configurações padrão de acessibilidade"
          >

            <RotateCcw
              size={20}
              aria-hidden="true"
            />

            <span>
              Restaurar Padrão
            </span>

          </button>

        </footer>

      </div>
    </div>
  );
}