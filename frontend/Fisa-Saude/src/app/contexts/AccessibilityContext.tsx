import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  highContrast: false,
  fontSize: 'normal',
  dyslexiaFont: false,
  increasedReadability: false,
  highlightLinks: false,
  visualIndicators: true,
  librasEnabled: false,
  largerButtons: false,
  increasedSpacing: false,
  simplifiedNavigation: false,
  keyboardNavigation: true,
  simpleLanguage: false,
  reducedAnimations: false,
  showIconText: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font Size
    root.setAttribute('data-font-size', settings.fontSize);
    const fontSizeMap = {
      small: '14px',
      normal: '16px',
      large: '18px',
      'x-large': '20px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // Dyslexia Font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Increased Readability
    if (settings.increasedReadability) {
      root.classList.add('increased-readability');
    } else {
      root.classList.remove('increased-readability');
    }

    // Highlight Links
    if (settings.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }

    // Larger Buttons
    if (settings.largerButtons) {
      root.classList.add('larger-buttons');
    } else {
      root.classList.remove('larger-buttons');
    }

    // Increased Spacing
    if (settings.increasedSpacing) {
      root.classList.add('increased-spacing');
    } else {
      root.classList.remove('increased-spacing');
    }

    // Reduced Animations
    if (settings.reducedAnimations) {
      root.classList.add('reduced-animations');
    } else {
      root.classList.remove('reduced-animations');
    }

    // Show Icon Text
    if (settings.showIconText) {
      root.classList.add('show-icon-text');
    } else {
      root.classList.remove('show-icon-text');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{ settings, updateSetting, resetSettings, isPanelOpen, togglePanel }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
