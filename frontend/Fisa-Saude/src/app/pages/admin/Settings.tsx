import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Building2,
  Save,
  Clock,
  Phone,
  MapPin,
  FileText,
  Palette,
  Accessibility,
  Sun,
  Moon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  UserRound,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility, type AccessibilitySettings } from '../../contexts/AccessibilityContext';

export interface EstabelecimentoDto {
  id: number;
  nome: string;
  endereco: string;
  parametros?: string | null;
  inicioFuncionamento: string | number[];
  fimFuncionamento: string | number[];
  telefone?: string | null;
}

const normalizeTime = (val: any): string => {
  if (!val) return '08:00';
  if (Array.isArray(val)) {
    const h = String(val[0]).padStart(2, '0');
    const m = String(val[1] || 0).padStart(2, '0');
    return `${h}:${m}`;
  }
  return String(val).substring(0, 5);
};

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[#E3DEC9] dark:border-border pb-3">
      <div className="w-8 h-8 bg-[#009386]/10 text-[#009386] dark:text-[#3CD099] rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-[#1B2E26] dark:text-foreground">{title}</h2>
        <p className="text-[11px] text-[#56635C] dark:text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PreferenceSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 py-3 text-left border-b border-[#E3DEC9]/70 dark:border-border/70 last:border-b-0"
    >
      <span className="min-w-0">
        <b className="block text-xs font-bold text-[#1B2E26] dark:text-foreground">{label}</b>
        <span className="block text-[11px] text-[#56635C] dark:text-muted-foreground">{description}</span>
      </span>
      <span
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#009386]' : 'bg-[#CBD5CE] dark:bg-muted'
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting, resetSettings } = useAccessibility();

  const [estabelecimento, setEstabelecimento] = useState<EstabelecimentoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const sessao = useMemo(() => {
    try {
      const raw = localStorage.getItem('@FisaSaude:usuario');
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        nome: parsed?.nome || '',
        email: localStorage.getItem('@FisaSaude:userEmail') || '',
        role: parsed?.role || '',
      };
    } catch {
      return { nome: '', email: '', role: '' };
    }
  }, []);

  const carregarConfig = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.get('/estabelecimentos');
      const lista = Array.isArray(res.data) ? res.data : res.data?.content || [];

      if (lista.length > 0) {
        setEstabelecimento(lista[0]);
      } else {
        setErrorMessage('Nenhum estabelecimento foi encontrado para este usuário.');
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setErrorMessage('Não foi possível carregar os ajustes da unidade.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConfig();
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estabelecimento) return;

    const inicioStr = normalizeTime(estabelecimento.inicioFuncionamento);
    const fimStr = normalizeTime(estabelecimento.fimFuncionamento);

    const payload = {
      id: estabelecimento.id,
      nome: estabelecimento.nome.trim(),
      endereco: estabelecimento.endereco.trim(),
      parametros: estabelecimento.parametros?.trim() || null,
      inicioFuncionamento: `${inicioStr}:00`,
      fimFuncionamento: `${fimStr}:00`,
      telefone: estabelecimento.telefone?.trim() || null,
    };

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');
      await api.put(`/estabelecimentos/${estabelecimento.id}`, payload);
      setSuccessMessage('Ajustes da unidade salvos com sucesso.');
      await carregarConfig();
    } catch (err) {
      console.error('Erro ao salvar ajustes da unidade:', err);
      setErrorMessage('Não foi possível salvar os ajustes da unidade.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8F6F0] dark:bg-background p-4 sm:p-6 lg:p-8 text-[#1B2E26] dark:text-foreground">
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B2E26] dark:text-foreground">
            Ajustes
          </h1>
          <p className="text-[11px] sm:text-xs text-[#56635C] dark:text-muted-foreground">
            Preferências do sistema e dados cadastrais da unidade
          </p>
        </div>

        {/* Aparência */}
        <section className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-[#E3DEC9] dark:border-border space-y-4">
          <SectionHeader
            icon={Palette}
            title="Aparência"
            description="Escolha como o sistema é exibido neste dispositivo."
          />

          <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Tema da interface">
            <button
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                theme === 'light'
                  ? 'border-[#009386] bg-[#009386]/10 text-[#007491] dark:text-[#3CD099]'
                  : 'border-[#E3DEC9] dark:border-border bg-[#F8F6F0] dark:bg-muted text-[#56635C] dark:text-muted-foreground hover:border-[#009386]/40'
              }`}
            >
              <Sun size={16} />
              Claro
            </button>
            <button
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                theme === 'dark'
                  ? 'border-[#009386] bg-[#009386]/10 text-[#3CD099]'
                  : 'border-[#E3DEC9] dark:border-border bg-[#F8F6F0] dark:bg-muted text-[#56635C] dark:text-muted-foreground hover:border-[#009386]/40'
              }`}
            >
              <Moon size={16} />
              Escuro
            </button>
          </div>
        </section>

        {/* Acessibilidade */}
        <section className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-[#E3DEC9] dark:border-border space-y-4">
          <SectionHeader
            icon={Accessibility}
            title="Acessibilidade e interface"
            description="Preferências aplicadas a toda a área administrativa."
          />

          <div>
            <PreferenceSwitch
              label="Alto contraste"
              description="Reforça contraste de textos e controles."
              checked={settings.highContrast}
              onChange={(value) => updateSetting('highContrast', value)}
            />
            <PreferenceSwitch
              label="Reduzir animações"
              description="Diminui transições e movimentos da interface."
              checked={settings.reducedAnimations}
              onChange={(value) => updateSetting('reducedAnimations', value)}
            />
            <PreferenceSwitch
              label="Botões maiores"
              description="Garante área mínima de toque nos controles."
              checked={settings.largerButtons}
              onChange={(value) => updateSetting('largerButtons', value)}
            />
            <PreferenceSwitch
              label="Fonte para dislexia"
              description="Usa uma fonte com maior legibilidade."
              checked={settings.dyslexiaFont}
              onChange={(value) => updateSetting('dyslexiaFont', value)}
            />
            <PreferenceSwitch
              label="Aumentar espaçamento do texto"
              description="Amplia entrelinhas e espaçamento entre palavras."
              checked={settings.increasedReadability}
              onChange={(value) => updateSetting('increasedReadability', value)}
            />
          </div>

          <label className="block">
            <span className="block text-xs font-bold text-[#1B2E26] dark:text-foreground">Tamanho da fonte</span>
            <span className="mb-2 block text-[11px] text-[#56635C] dark:text-muted-foreground">
              Ajusta o tamanho base do texto em toda a aplicação.
            </span>
            <select
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value as AccessibilitySettings['fontSize'])}
              className="w-full px-3 py-2.5 bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
            >
              <option value="small">Pequeno</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
              <option value="x-large">Muito grande</option>
            </select>
          </label>

          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E3DEC9] dark:border-border px-3 py-2 text-xs font-bold text-[#56635C] dark:text-muted-foreground hover:bg-[#F8F6F0] dark:hover:bg-muted transition-colors"
          >
            <RotateCcw size={14} />
            Restaurar padrões de acessibilidade
          </button>
        </section>

        {/* Dados da Unidade */}
        <section className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-[#E3DEC9] dark:border-border space-y-4">
          <SectionHeader
            icon={Building2}
            title="Dados da Unidade"
            description="Informações usadas nos agendamentos e no atendimento."
          />

          {loading ? (
            <div className="py-10 grid place-items-center">
              <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#D94F3C]/10 text-[#D94F3C] dark:text-[#FF8FA3] text-xs flex gap-2" role="alert">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 rounded-xl bg-[#009386]/10 text-[#007491] dark:text-[#3CD099] text-xs flex gap-2" role="status">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {estabelecimento && (
                <form onSubmit={handleSalvar} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26] dark:text-foreground">
                      Nome do Estabelecimento *
                    </label>
                    <input
                      type="text"
                      required
                      value={estabelecimento?.nome || ''}
                      onChange={(e) =>
                        setEstabelecimento((prev) => (prev ? { ...prev, nome: e.target.value } : null))
                      }
                      className="w-full px-3 py-2.5 bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26] dark:text-foreground flex items-center gap-1">
                        <FileText size={13} className="text-[#56635C] dark:text-muted-foreground" /> CNPJ
                      </label>
                      <input
                        type="text"
                        placeholder="CNPJ: 39.653.099/0001-66"
                        value={estabelecimento?.parametros || ''}
                        onChange={(e) =>
                          setEstabelecimento((prev) => (prev ? { ...prev, parametros: e.target.value } : null))
                        }
                        className="w-full px-3 py-2.5 bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26] dark:text-foreground flex items-center gap-1">
                        <Phone size={13} className="text-[#56635C] dark:text-muted-foreground" /> Telefone
                      </label>
                      <input
                        type="text"
                        required
                        value={estabelecimento?.telefone || ''}
                        onChange={(e) =>
                          setEstabelecimento((prev) => (prev ? { ...prev, telefone: e.target.value } : null))
                        }
                        className="w-full px-3 py-2.5 bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26] dark:text-foreground flex items-center gap-1">
                      <MapPin size={13} className="text-[#56635C] dark:text-muted-foreground" /> Endereço Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={estabelecimento?.endereco || ''}
                      onChange={(e) =>
                        setEstabelecimento((prev) => (prev ? { ...prev, endereco: e.target.value } : null))
                      }
                      className="w-full px-3 py-2.5 bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#E3DEC9] dark:border-border">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Clock size={15} className="text-[#009386] dark:text-[#3CD099]" />
                      <h3 className="text-xs font-bold uppercase text-[#1B2E26] dark:text-foreground">Horário de Funcionamento</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1 text-[#56635C] dark:text-muted-foreground">
                          Abertura *
                        </label>
                        <input
                          type="time"
                          required
                          value={normalizeTime(estabelecimento?.inicioFuncionamento)}
                          onChange={(e) =>
                            setEstabelecimento((prev) =>
                              prev ? { ...prev, inicioFuncionamento: e.target.value } : null
                            )
                          }
                          className="w-full px-2.5 py-2 bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1 text-[#56635C] dark:text-muted-foreground">
                          Fechamento *
                        </label>
                        <input
                          type="time"
                          required
                          value={normalizeTime(estabelecimento?.fimFuncionamento)}
                          onChange={(e) =>
                            setEstabelecimento((prev) =>
                              prev ? { ...prev, fimFuncionamento: e.target.value } : null
                            )
                          }
                          className="w-full px-2.5 py-2 bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E3DEC9] dark:border-border">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto ml-auto bg-[#009386] hover:bg-[#007491] active:scale-98 text-white px-6 py-2.5 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <Save size={15} />
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              )}

              {!estabelecimento && !loading && (
                <button
                  type="button"
                  onClick={carregarConfig}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E3DEC9] dark:border-border px-4 py-2.5 text-xs font-bold text-[#56635C] dark:text-muted-foreground hover:bg-[#F8F6F0] dark:hover:bg-muted transition-colors"
                >
                  <RotateCcw size={14} />
                  Tentar novamente
                </button>
              )}
            </>
          )}
        </section>

        {/* Conta */}
        <section className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-[#E3DEC9] dark:border-border space-y-4">
          <SectionHeader
            icon={UserRound}
            title="Conta"
            description="Dados pessoais e nível de acesso do usuário autenticado."
          />

          <div className="text-xs space-y-1">
            <p className="font-bold text-[#1B2E26] dark:text-foreground">{sessao.nome || 'Usuário autenticado'}</p>
            {sessao.email && <p className="text-[#56635C] dark:text-muted-foreground">{sessao.email}</p>}
            {sessao.role && (
              <p className="text-[11px] text-[#56635C] dark:text-muted-foreground">
                {sessao.role === 'ADMIN' ? 'Administrador' : 'Instrutor / Profissional'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/perfil')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009386] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#007491] transition-colors"
          >
            Ver meu perfil
            <ChevronRight size={14} />
          </button>
        </section>
      </div>
    </div>
  );
}
