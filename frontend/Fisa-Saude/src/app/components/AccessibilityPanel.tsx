import { X, Eye, Type, Volume2, Hand, Brain, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useState } from 'react';

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ icon: Icon, title, description, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors text-left focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        aria-expanded={isOpen}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="text-primary" size={20} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronDown
          className={`text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          size={20}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface ToggleOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors group">
      <div className="flex items-center h-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-muted rounded-full peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-primary peer-checked:bg-primary transition-colors">
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">{label}</div>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

interface FontSizeOptionProps {
  size: 'small' | 'normal' | 'large' | 'x-large';
  label: string;
  selected: boolean;
  onClick: () => void;
}

function FontSizeOption({ size, label, selected, onClick }: FontSizeOptionProps) {
  const sizeMap = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    'x-large': 'text-xl',
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-between p-3 rounded-lg border-2 transition-all
        ${selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }
      `}
      aria-pressed={selected}
    >
      <span className={`font-medium ${sizeMap[size]}`}>{label}</span>
      {selected && <Check className="text-primary" size={20} aria-hidden="true" />}
    </button>
  );
}

export function AccessibilityPanel() {
  const { settings, updateSetting, resetSettings, togglePanel } = useAccessibility();

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-card w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300"
        role="dialog"
        aria-labelledby="accessibility-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 id="accessibility-title" className="text-2xl font-bold text-foreground">
              Central de Acessibilidade
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Personalize sua experiência de navegação
            </p>
          </div>
          <button
            onClick={togglePanel}
            className="p-2 hover:bg-muted rounded-lg transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            aria-label="Fechar painel de acessibilidade"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Visual */}
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
              onChange={(checked) => updateSetting('highContrast', checked)}
            />

            <div className="space-y-2">
              <label className="block font-medium text-foreground">Tamanho da Fonte</label>
              <div className="grid grid-cols-2 gap-2">
                <FontSizeOption
                  size="small"
                  label="A-"
                  selected={settings.fontSize === 'small'}
                  onClick={() => updateSetting('fontSize', 'small')}
                />
                <FontSizeOption
                  size="normal"
                  label="A"
                  selected={settings.fontSize === 'normal'}
                  onClick={() => updateSetting('fontSize', 'normal')}
                />
                <FontSizeOption
                  size="large"
                  label="A+"
                  selected={settings.fontSize === 'large'}
                  onClick={() => updateSetting('fontSize', 'large')}
                />
                <FontSizeOption
                  size="x-large"
                  label="A++"
                  selected={settings.fontSize === 'x-large'}
                  onClick={() => updateSetting('fontSize', 'x-large')}
                />
              </div>
            </div>

            <ToggleOption
              label="Fonte para Dislexia"
              description="Usa fonte especialmente projetada para facilitar a leitura"
              checked={settings.dyslexiaFont}
              onChange={(checked) => updateSetting('dyslexiaFont', checked)}
            />

            <ToggleOption
              label="Legibilidade Aumentada"
              description="Aumenta espaçamento entre linhas e letras"
              checked={settings.increasedReadability}
              onChange={(checked) => updateSetting('increasedReadability', checked)}
            />

            <ToggleOption
              label="Destacar Links e Botões"
              description="Realça elementos clicáveis para facilitar identificação"
              checked={settings.highlightLinks}
              onChange={(checked) => updateSetting('highlightLinks', checked)}
            />
          </Section>

          {/* Auditiva */}
          <Section
            icon={Volume2}
            title="Acessibilidade Auditiva"
            description="Recursos visuais para comunicação"
          >
            <ToggleOption
              label="Indicadores Visuais"
              description="Mostra alertas visuais para notificações e sons"
              checked={settings.visualIndicators}
              onChange={(checked) => updateSetting('visualIndicators', checked)}
            />

            <ToggleOption
              label="Suporte para Libras"
              description="Exibe indicador de disponibilidade de conteúdo em Libras"
              checked={settings.librasEnabled}
              onChange={(checked) => updateSetting('librasEnabled', checked)}
            />
          </Section>

          {/* Motora */}
          <Section
            icon={Hand}
            title="Acessibilidade Motora"
            description="Facilita a interação e navegação"
          >
            <ToggleOption
              label="Botões Maiores"
              description="Aumenta o tamanho dos botões e áreas clicáveis"
              checked={settings.largerButtons}
              onChange={(checked) => updateSetting('largerButtons', checked)}
            />

            <ToggleOption
              label="Espaçamento Aumentado"
              description="Adiciona mais espaço entre elementos interativos"
              checked={settings.increasedSpacing}
              onChange={(checked) => updateSetting('increasedSpacing', checked)}
            />

            <ToggleOption
              label="Navegação Simplificada"
              description="Reduz opções e simplifica menus"
              checked={settings.simplifiedNavigation}
              onChange={(checked) => updateSetting('simplifiedNavigation', checked)}
            />

            <ToggleOption
              label="Navegação por Teclado"
              description="Otimiza a navegação usando apenas o teclado"
              checked={settings.keyboardNavigation}
              onChange={(checked) => updateSetting('keyboardNavigation', checked)}
            />
          </Section>

          {/* Cognitiva */}
          <Section
            icon={Brain}
            title="Acessibilidade Cognitiva"
            description="Simplifica o entendimento do conteúdo"
          >
            <ToggleOption
              label="Linguagem Simples"
              description="Usa termos mais simples e diretos"
              checked={settings.simpleLanguage}
              onChange={(checked) => updateSetting('simpleLanguage', checked)}
            />

            <ToggleOption
              label="Reduzir Animações"
              description="Minimiza movimentos e transições"
              checked={settings.reducedAnimations}
              onChange={(checked) => updateSetting('reducedAnimations', checked)}
            />

            <ToggleOption
              label="Mostrar Texto em Ícones"
              description="Exibe rótulos de texto junto aos ícones"
              checked={settings.showIconText}
              onChange={(checked) => updateSetting('showIconText', checked)}
            />
          </Section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            aria-label="Restaurar configurações padrão de acessibilidade"
          >
            <RotateCcw size={20} aria-hidden="true" />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>
    </div>
  );
}
