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

import {
  useAccessibility,
} from '../contexts/AccessibilityContext';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

/* =========================================================
   SECTION
   ========================================================= */

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({
  icon: Icon,
  title,
  description,
  children,
  defaultOpen = false,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const sectionId = `section-${title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')}`;

  return (
    <div className="border-b border-border last:border-b-0">
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
        aria-controls={sectionId}
      >
        {/* Ícone */}
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
          />
        </div>

        {/* Título e descrição */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Seta */}
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
          id={sectionId}
          className="px-4 pb-4 space-y-3"
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TOGGLE OPTION
   ========================================================= */

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
  return (
    <label
      className="
        flex
        items-start
        gap-3
        p-3
        rounded-lg
        hover:bg-muted/30
        cursor-pointer
        transition-colors
      "
    >
      {/* Checkbox */}
      <div className="flex items-center h-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          className="
            sr-only
            peer
          "
          aria-label={label}
        />

        {/* Switch visual */}
        <div
          className="
            relative
            w-11
            h-6
            bg-muted
            rounded-full
            peer-focus:outline-none
            peer-focus-visible:ring-2
            peer-focus-visible:ring-primary
            peer-checked:bg-primary
            transition-colors
          "
          aria-hidden="true"
        >
          <div
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
              ${
                checked
                  ? 'translate-x-5'
                  : 'translate-x-0'
              }
            `}
          />
        </div>
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">
          {label}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

/* =========================================================
   FONT SIZE OPTION
   ========================================================= */

interface FontSizeOptionProps {
  size:
    | 'small'
    | 'normal'
    | 'large'
    | 'x-large';

  label: string;
  selected: boolean;
  onClick: () => void;
}

function FontSizeOption({
  size,
  label,
  selected,
  onClick,
}: FontSizeOptionProps) {
  const sizeMap = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    'x-large': 'text-xl',
  };

  const accessibleLabel = {
    small: 'Tamanho de fonte pequeno',
    normal: 'Tamanho de fonte normal',
    large: 'Tamanho de fonte grande',
    'x-large': 'Tamanho de fonte muito grande',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        justify-between
        p-3
        rounded-lg
        border-2
        transition-all
        min-h-[52px]

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2

        ${
          selected
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }
      `}
      aria-pressed={selected}
      aria-label={accessibleLabel[size]}
    >
      <span
        className={`font-medium ${sizeMap[size]}`}
        aria-hidden="true"
      >
        {label}
      </span>

      {selected && (
        <Check
          className="text-primary"
          size={20}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/* =========================================================
   ACCESSIBILITY PANEL
   ========================================================= */

export function AccessibilityPanel() {
  const {
    settings,
    updateSetting,
    resetSettings,
    togglePanel,
  } = useAccessibility();

  const titleRef = useRef<HTMLHeadingElement>(null);

  const previouslyFocusedElement =
    useRef<HTMLElement | null>(null);

  /* =======================================================
     FOCO AO ABRIR
     ======================================================= */

  useEffect(() => {
    previouslyFocusedElement.current =
      document.activeElement as HTMLElement;

    /*
     * Pequeno atraso para garantir que o painel
     * já esteja renderizado antes de receber o foco.
     */
    const timer = window.setTimeout(() => {
      titleRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     ESC FECHA O PAINEL
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        togglePanel();

        /*
         * Devolve o foco para o elemento que abriu
         * o painel.
         */
        setTimeout(() => {
          previouslyFocusedElement.current?.focus();
        }, 50);
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [togglePanel]);

  /* =======================================================
     FECHAR E DEVOLVER FOCO
     ======================================================= */

  const handleClose = () => {
    togglePanel();

    setTimeout(() => {
      previouslyFocusedElement.current?.focus();
    }, 50);
  };

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
      {/* =================================================
          MODAL
          ================================================= */}

      <div
        id="accessibility-panel"
        className="
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
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2
              id="accessibility-title"
              ref={titleRef}
              tabIndex={-1}
              className="
                text-2xl
                font-bold
                text-foreground
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
                focus-visible:ring-offset-2
                rounded
              "
            >
              Central de Acessibilidade
            </h2>

            <p
              id="accessibility-description"
              className="text-sm text-muted-foreground mt-1"
            >
              Personalize sua experiência de navegação
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="
              p-2
              hover:bg-muted
              rounded-lg
              transition-colors
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              focus-visible:ring-offset-2
            "
            aria-label="Fechar painel de acessibilidade"
          >
            <X
              size={24}
              aria-hidden="true"
            />
          </button>
        </div>

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

            {/* Tamanho da fonte */}

            <div className="space-y-2">
              <label
                id="font-size-label"
                className="block font-medium text-foreground"
              >
                Tamanho da Fonte
              </label>

              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-labelledby="font-size-label"
              >
                <FontSizeOption
                  size="small"
                  label="A-"
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
            </div>

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

        <div className="p-4 border-t border-border bg-muted/30">
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
              focus-visible:ring-offset-2
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
        </div>
      </div>
    </div>
  );
}