import { useState, useEffect } from 'react';
import { Users, Calendar, UserPlus, Percent, Instagram, Share2, Globe, MessageCircle, ArrowRight, Heart } from 'lucide-react';
import { api } from '../../services/api';

interface ComercialMetrics {
  interessados: number;
  aulasAgendadas: number;
  novosAlunos: number;
  taxaConversao: number;
  jornada: { etapa: string; total: number }[];
  origens: { canal: string; total: number; porcentagem: number }[];
}

export default function RelacionamentoComercial() {
  const [metrics, setMetrics] = useState<ComercialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const res = await api.get('/relacionamentos/metricas');
        setMetrics(res.data);
      } catch (err) {
        console.error('Erro ao buscar métricas comerciais:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const getChannelIcon = (canal: string) => {
    switch (canal.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'whatsapp': return MessageCircle;
      case 'indicacao': return Share2;
      default: return Globe;
    }
  };

  return (
    <div className="w-full lg:h-full lg:overflow-hidden flex flex-col lg:min-h-0 bg-[#F8F6F0] text-[#1B2E26]">
      <div className="flex-1 lg:h-full lg:overflow-hidden p-4 sm:p-5 lg:p-6 flex flex-col lg:min-h-0">
        <div className="max-w-[1600px] w-full flex-1 flex flex-col lg:min-h-0 space-y-4">
          
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#1B2E26] mb-0.5">Gestão Comercial</h1>
            <p className="text-xs text-[#56635C]">Acompanhe a jornada dos interessados até se tornarem alunos.</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
            <div className="bg-white border border-[#E3DEC9] p-3.5 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#009386] rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#56635C] uppercase tracking-wider block">Interessados</span>
                <span className="text-lg font-bold text-[#1B2E26] block">{loading ? '...' : `${metrics?.interessados || 0}`}</span>
              </div>
            </div>

            <div className="bg-white border border-[#E3DEC9] p-3.5 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#007491] rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#56635C] uppercase tracking-wider block">Aulas Marcadas</span>
                <span className="text-lg font-bold text-[#1B2E26] block">{loading ? '...' : `${metrics?.aulasAgendadas || 0}`}</span>
              </div>
            </div>

            <div className="bg-white border border-[#E3DEC9] p-3.5 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#3CD099] rounded-xl flex items-center justify-center text-[#0E2820] shadow-sm flex-shrink-0">
                <UserPlus size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#56635C] uppercase tracking-wider block">Novas Matrículas</span>
                <span className="text-lg font-bold text-[#1B2E26] block">{loading ? '...' : `${metrics?.novosAlunos || 0}`}</span>
              </div>
            </div>

            <div className="bg-white border border-[#E3DEC9] p-3.5 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#FF6954] rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Percent size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#56635C] uppercase tracking-wider block">Conversão</span>
                <span className="text-lg font-bold text-[#1B2E26] block">{loading ? '...' : `${metrics?.taxaConversao || 0}%`}</span>
              </div>
            </div>
          </div>

          {/* Funil */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E3DEC9] p-4 flex-shrink-0">
            <h2 className="text-xs font-bold text-[#56635C] uppercase tracking-wider mb-4">Jornada do Cliente</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center w-full">
              {(metrics?.jornada || []).map((step, index) => (
                <div key={index} className="flex items-center w-full relative">
                  <div className="bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl p-3 flex-1 min-w-0 flex flex-col justify-between h-20 shadow-sm">
                    <div className="text-xs font-bold text-[#1B2E26] truncate">{step.etapa}</div>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-lg font-extrabold text-[#1B2E26]">{step.total}</span>
                      <span className="text-[10px] text-[#56635C] font-semibold">etapa {index + 1}</span>
                    </div>
                  </div>
                  {index < (metrics?.jornada.length || 0) - 1 && (
                    <div className="hidden lg:flex items-center justify-center w-4 text-[#56635C]/50 mx-1 flex-shrink-0">
                      <ArrowRight size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Origens */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#E3DEC9] p-4 flex flex-col min-h-0 overflow-y-auto">
            <h2 className="text-xs font-bold text-[#56635C] uppercase tracking-wider mb-4">Canais de Captação</h2>
            <div className="space-y-3.5">
              {(metrics?.origens || []).map((origin, index) => {
                const Icon = getChannelIcon(origin.canal);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#1B2E26] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#009386] flex items-center justify-center text-white">
                          <Icon size={12} />
                        </span>
                        {origin.canal}
                      </span>
                      <span className="text-[#1B2E26] font-bold">{origin.total} ({origin.porcentagem}%)</span>
                    </div>
                    <div className="w-full bg-[#F8F6F0] rounded-full h-2 overflow-hidden border border-[#E3DEC9]">
                      <div
                        className="h-full bg-[#009386] rounded-full"
                        style={{ width: `${origin.porcentagem}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}