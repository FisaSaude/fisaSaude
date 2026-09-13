import React, { useState, useEffect } from 'react';
import { Building2, Save, Clock, Phone, MapPin, FileText } from 'lucide-react';
import { api } from '../../services/api';

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

export default function Settings() {
  const [estabelecimento, setEstabelecimento] = useState<EstabelecimentoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const carregarConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/estabelecimentos').catch(() => ({ data: [] }));
      const lista = Array.isArray(res.data) ? res.data : res.data?.content || [];

      if (lista.length > 0) {
        setEstabelecimento(lista[0]);
      } else {
        setEstabelecimento({
          id: 1,
          nome: 'Fisa Saude Unidade Central',
          endereco: 'R. Itapura, 1182 - Vila Gomes Cardim, São Paulo - SP, 03310-000',
          parametros: 'CNPJ: 39.653.099/0001-66',
          inicioFuncionamento: '07:00:00',
          fimFuncionamento: '20:00:00',
          telefone: '(11) 95373-8194'
        });
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
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
      telefone: estabelecimento.telefone?.trim() || null
    };

    try {
      setSaving(true);
      await api.put(`/estabelecimentos/${estabelecimento.id}`, payload);
      alert('Configurações salvas com sucesso!');
      await carregarConfig();
    } catch (err: any) {
      alert('Erro ao salvar dados no servidor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F8F6F0]">
        <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full bg-[#F8F6F0] text-[#1B2E26] flex flex-col">
      <div className="flex-1 p-3 sm:p-5 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B2E26]">
              Configurações
            </h1>
            <p className="text-[11px] sm:text-xs text-[#56635C]">
              Dados cadastrais e horários da clínica
            </p>
          </div>

          <form
            onSubmit={handleSalvar}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-[#E3DEC9] space-y-4"
          >
            <div className="flex items-center gap-2.5 border-b border-[#E3DEC9] pb-3">
              <div className="w-8 h-8 bg-[#009386]/10 text-[#009386] rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={16} />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#1B2E26]">Dados da Unidade</h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26]">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                required
                value={estabelecimento?.nome || ''}
                onChange={(e) =>
                  setEstabelecimento((prev) => (prev ? { ...prev, nome: e.target.value } : null))
                }
                className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26] flex items-center gap-1">
                  <FileText size={13} className="text-[#56635C]" /> CNPJ
                </label>
                <input
                  type="text"
                  placeholder="CNPJ: 39.653.099/0001-66"
                  value={estabelecimento?.parametros || ''}
                  onChange={(e) =>
                    setEstabelecimento((prev) => (prev ? { ...prev, parametros: e.target.value } : null))
                  }
                  className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26] flex items-center gap-1">
                  <Phone size={13} className="text-[#56635C]" /> Telefone
                </label>
                <input
                  type="text"
                  required
                  value={estabelecimento?.telefone || ''}
                  onChange={(e) =>
                    setEstabelecimento((prev) => (prev ? { ...prev, telefone: e.target.value } : null))
                  }
                  className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1 text-[#1B2E26] flex items-center gap-1">
                <MapPin size={13} className="text-[#56635C]" /> Endereço Completo *
              </label>
              <input
                type="text"
                required
                value={estabelecimento?.endereco || ''}
                onChange={(e) =>
                  setEstabelecimento((prev) => (prev ? { ...prev, endereco: e.target.value } : null))
                }
                className="w-full px-3 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
              />
            </div>

            <div className="pt-2 border-t border-[#E3DEC9]">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Clock size={15} className="text-[#009386]" />
                <h3 className="text-xs font-bold uppercase text-[#1B2E26]">Horário de Funcionamento</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-[#56635C]">
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
                    className="w-full px-2.5 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-[#56635C]">
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
                    className="w-full px-2.5 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3DEC9]">
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
        </div>
      </div>
    </div>
  );
}