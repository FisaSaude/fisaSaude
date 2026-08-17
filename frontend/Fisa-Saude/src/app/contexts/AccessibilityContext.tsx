import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'x-large';
  dyslexiaFont: boolean;
  increasedReadability: boolean;
  highlightLinks: boolean;

  // Auditiva
  visualIndicators: boolean;
  librasEnabled: boolean;

  // Motora
  largerButtons: boolean;
  increasedSpacing: boolean;
  simplifiedNavigation: boolean;
  keyboardNavigation: boolean;

  // Cognitiva
  simpleLanguage: boolean;
  reducedAnimations: boolean;
  showIconText: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;

  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;

  resetSettings: () => void;

  isPanelOpen: boolean;

  togglePanel: () => void;
}

const defaultSettings: AccessibilitySettings = {
  // Visual
  highContrast: false,
  fontSize: 'normal',
  dyslexiaFont: false,
  increasedReadability: false,
  highlightLinks: false,

  // Auditiva
  visualIndicators: true,
  librasEnabled: false,

  // Motora
  largerButtons: false,
  increasedSpacing: false,
  simplifiedNavigation: false,
  keyboardNavigation: true,

  // Cognitiva
  simpleLanguage: false,
  reducedAnimations: false,
  showIconText: false,
};

const AccessibilityContext =
  createContext<AccessibilityContextType | undefined>(
    undefined
  );

export function AccessibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /*
   * =========================================================
   * CARREGAR CONFIGURAÇÕES SALVAS
   * =========================================================
   */

  const [settings, setSettings] =
    useState<AccessibilitySettings>(() => {
      try {
        const saved = localStorage.getItem(
          'accessibility-settings'
        );

        if (saved) {
          const parsedSettings = JSON.parse(saved);

          return {
            ...defaultSettings,
            ...parsedSettings,
          };
        }
      } catch (error) {
        console.error(
          'Erro ao carregar configurações de acessibilidade:',
          error
        );
      }

      return defaultSettings;
    });

  /*
   * =========================================================
   * APLICAR CONFIGURAÇÕES NO <HTML>
   * =========================================================
   */

  const applySettings = (
    currentSettings: AccessibilitySettings
  ) => {
    const root = document.documentElement;

    /*
     * -------------------------------------------------------
     * VISUAL
     * -------------------------------------------------------
     */

    // Alto contraste
    root.classList.toggle(
      'high-contrast',
      currentSettings.highContrast
    );

    // Fonte para dislexia
    root.classList.toggle(
      'dyslexia-font',
      currentSettings.dyslexiaFont
    );

    // Legibilidade aumentada
    root.classList.toggle(
      'increased-readability',
      currentSettings.increasedReadability
    );

    // Destacar links
    root.classList.toggle(
      'highlight-links',
      currentSettings.highlightLinks
    );

    /*
     * -------------------------------------------------------
     * MOTORA
     * -------------------------------------------------------
     */

    // Botões maiores
    root.classList.toggle(
      'larger-buttons',
      currentSettings.largerButtons
    );

    // Espaçamento aumentado
    root.classList.toggle(
      'increased-spacing',
      currentSettings.increasedSpacing
    );

    // Navegação simplificada
    root.classList.toggle(
      'simplified-navigation',
      currentSettings.simplifiedNavigation
    );

    // Navegação por teclado
    root.classList.toggle(
      'keyboard-navigation',
      currentSettings.keyboardNavigation
    );

    /*
     * -------------------------------------------------------
     * COGNITIVA
     * -------------------------------------------------------
     */

    // Linguagem simples
    root.classList.toggle(
      'simple-language',
      currentSettings.simpleLanguage
    );

    // Reduzir animações
    root.classList.toggle(
      'reduced-animations',
      currentSettings.reducedAnimations
    );

    // Mostrar texto nos ícones
    root.classList.toggle(
      'show-icon-text',
      currentSettings.showIconText
    );

    /*
     * -------------------------------------------------------
     * AUDITIVA
     * -------------------------------------------------------
     */

    // Indicadores visuais
    root.classList.toggle(
      'visual-indicators',
      currentSettings.visualIndicators
    );

    // Libras
    root.classList.toggle(
      'libras-enabled',
      currentSettings.librasEnabled
    );

    /*
     * -------------------------------------------------------
     * TAMANHO DA FONTE
     * -------------------------------------------------------
     */

    const fontSizeMap: Record<
      AccessibilitySettings['fontSize'],
      string
    > = {
      small: '14px',
      normal: '16px',
      large: '18px',
      'x-large': '20px',
    };

    root.setAttribute(
      'data-font-size',
      currentSettings.fontSize
    );

    root.style.setProperty(
      '--base-font-size',
      fontSizeMap[currentSettings.fontSize]
    );
  };

  /*
   * =========================================================
   * SALVAR E APLICAR AUTOMATICAMENTE
   * =========================================================
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        'accessibility-settings',
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error(
        'Erro ao salvar configurações de acessibilidade:',
        error
      );
    }

    applySettings(settings);
  }, [settings]);

  /*
   * =========================================================
   * ATUALIZAR CONFIGURAÇÃO
   * =========================================================
   */

  const updateSetting = <
    K extends keyof AccessibilitySettings
  >(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      [key]: value,
    }));
  };

  /*
   * =========================================================
   * RESTAURAR CONFIGURAÇÕES
   * =========================================================
   */

  const resetSettings = () => {
    setSettings(defaultSettings);

    localStorage.removeItem(
      'accessibility-settings'
    );
  };

  /*
   * =========================================================
   * ABRIR / FECHAR PAINEL
   * =========================================================
   */

  const togglePanel = () => {
    setIsPanelOpen((previous) => !previous);
  };

  /*
   * =========================================================
   * PROVIDER
   * =========================================================
   */

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isPanelOpen,
        togglePanel,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

/*
 * =========================================================
 * HOOK
 * =========================================================
 */

export function useAccessibility() {
  const context = useContext(
    AccessibilityContext
  );

  if (!context) {
    throw new Error(
      'useAccessibility must be used within AccessibilityProvider'
    );
  }

  return context;
}

