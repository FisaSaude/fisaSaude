import {
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ADMIN_USER } from '../../constants/company';
import { api } from '../../services/api';

interface ClienteDto {
  id: number;
  nome: string;
  telefone?: string;
  whatsappAtivo?: boolean;
}

interface AgendamentoDto {
  id: number;
  data: string | number[];
  horaInicio: string | number[];
  horaFim: string | number[];
  nomeCliente?: string | null;
  status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' | 'BLOQUEADO';
  preco?: number | null;
}

const normalizeDate = (val: any): string => {
  if (!val) return '';
  if (Array.isArray(val)) {
    const y = String(val[0]);
    const m = String(val[1]).padStart(2, '0');
    const d = String(val[2]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val);
  return str.includes('T') ? str.split('T')[0] : str.substring(0, 10);
};

const normalizeTime = (val: any): string => {
  if (!val) return '';
  if (Array.isArray(val)) {
    const h = String(val[0]).padStart(2, '0');
    const m = String(val[1] || 0).padStart(2, '0');
    return `${h}:${m}`;
  }
  return String(val).substring(0, 5);
};

const dateToKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<ClienteDto[]>([]);
  const [agendamentosMes, setAgendamentosMes] = useState<AgendamentoDto[]>([]);
  const [usuarioNome, setUsuarioNome] = useState<string>(ADMIN_USER.name);

  const hoje = useMemo(() => new Date(), []);
  const hojeKey = useMemo(() => dateToKey(hoje), [hoje]);

  const carregarDados = useCallback(async () => {
    let usuarioId = localStorage.getItem('@FisaSaude:usuarioId') || '1';

    const usuarioSalvo = localStorage.getItem('@FisaSaude:usuario');
    if (usuarioSalvo) {
      try {
        const parsed = JSON.parse(usuarioSalvo);
        if (parsed.nome) setUsuarioNome(parsed.nome);
      } catch {
        // Fallback
      }
    }

    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    try {
      const [resClientes, resAgendamentos] = await Promise.all([
        api.get('/clientes').catch(() => ({ data: [] })),
        api.get('/agendamentos/usuario-periodo', {
          params: {
            usuarioId: Number(usuarioId),
            dataInicio,
            dataFim
          }
        }).catch(() => ({ data: [] }))
      ]);

      setClientes(Array.isArray(resClientes.data) ? resClientes.data : resClientes.data?.content || []);
      setAgendamentosMes(Array.isArray(resAgendamentos.data) ? resAgendamentos.data : resAgendamentos.data?.content || []);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  }, [hoje]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const agendamentosHoje = useMemo(() => {
    return agendamentosMes
      .filter((a) => normalizeDate(a.data) === hojeKey && a.status !== 'CANCELADO')
      .sort((a, b) => normalizeTime(a.horaInicio).localeCompare(normalizeTime(b.horaInicio)));
  }, [agendamentosMes, hojeKey]);

  const statsWeekly = useMemo(() => {
    return {
      completed: agendamentosMes.filter((a) => a.status === 'CONCLUIDO').length,
      scheduled: agendamentosMes.filter((a) => a.status === 'AGENDADO' || a.status === 'CONFIRMADO').length,
      cancelled: agendamentosMes.filter((a) => a.status === 'CANCELADO').length
    };
  }, [agendamentosMes]);

  const hojeConcluidos = useMemo(() => {
    return agendamentosHoje.filter((a) => a.status === 'CONCLUIDO').length;
  }, [agendamentosHoje]);

  const taxaOcupacao = useMemo(() => {
    if (agendamentosHoje.length === 0) return '0%';
    const pct = Math.min(100, Math.round((agendamentosHoje.length / 15) * 100));
    return `${pct}%`;
  }, [agendamentosHoje]);

  const taxaAdesao = useMemo(() => {
    const total = statsWeekly.completed + statsWeekly.cancelled;
    if (total === 0) return '100%';
    return `${Math.round((statsWeekly.completed / total) * 100)}%`;
  }, [statsWeekly]);

  const stats = useMemo(() => [
    {
      icon: Users,
      label: 'Pacientes Ativos',
      value: String(clientes.length),
      change: `${clientes.filter((c) => c.whatsappAtivo !== false).length} c/ WhatsApp`,
      changeType: 'positive',
      color: 'from-primary to-emerald-600',
      tooltip: 'Total de pacientes cadastrados no estúdio.'
    },
    {
      icon: Calendar,
      label: 'Atendimentos Hoje',
      value: String(agendamentosHoje.length),
      change: `${hojeConcluidos} concluídos`,
      changeType: 'info',
      color: 'from-violet-500 to-purple-600',
      tooltip: 'Total de sessões marcadas para hoje.'
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Ocupação',
      value: taxaOcupacao,
      change: agendamentosHoje.length >= 8 ? 'Acima da meta' : 'Regular',
      changeType: 'positive',
      color: 'from-success to-emerald-600',
      tooltip: 'Ocupação da grade de horários.'
    },
    {
      icon: Activity,
      label: 'Índice de Adesão',
      value: taxaAdesao,
      change: 'Comparecimento',
      changeType: 'positive',
      color: 'from-amber-500 to-orange-600',
      tooltip: 'Sessões concluídas vs cancelamentos.'
    }
  ], [clientes, agendamentosHoje, hojeConcluidos, taxaOcupacao, taxaAdesao]);

  // Atividades Recentes calculadas dinamicamente
  const recentActivity = useMemo(() => {
    const ordenados = [...agendamentosMes].reverse().slice(0, 4);

    if (ordenados.length === 0) {
      return [
        {
          type: 'info',
          title: 'Sistema Conectado',
          description: 'Nenhum agendamento recente para exibir.',
          time: 'Hoje'
        }
      ];
    }

    return ordenados.map((item) => {
      const isConcluido = item.status === 'CONCLUIDO';
      const isCancelado = item.status === 'CANCELADO';
      const isBloqueado = item.status === 'BLOQUEADO';

      return {
        type: isConcluido ? 'success' : isCancelado ? 'alert' : isBloqueado ? 'info' : 'booking',
        title: isConcluido
          ? 'Sessão Concluída'
          : isCancelado
            ? 'Agendamento Cancelado'
            : isBloqueado
              ? 'Horário Bloqueado'
              : 'Atendimento Agendado',
        description: item.nomeCliente
          ? `${item.nomeCliente} às ${normalizeTime(item.horaInicio)}`
          : `Horário ${normalizeTime(item.horaInicio)} - ${item.status}`,
        time: normalizeDate(item.data) === hojeKey ? 'Hoje' : normalizeDate(item.data)
      };
    });
  }, [agendamentosMes, hojeKey]);

  const dataHojeFormatada = useMemo(() => {
    return hoje.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }, [hoje]);

  const primeiroNome = usuarioNome.split(' ')[0] || 'Profissional';

  return (
    <div className="w-full h-full min-h-0 bg-[#F8F6F0] text-[#1B2E26] flex flex-col overflow-y-auto lg:overflow-hidden">
      <div className="flex-1 min-h-0 p-3.5 sm:p-5 lg:p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:min-h-0 space-y-3.5 sm:space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between gap-2 flex-shrink-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                Central Operacional
              </h1>
              <p className="text-[11px] sm:text-xs text-[#56635C] mt-0.5">
                Olá, <span className="font-semibold text-[#1B2E26]">{primeiroNome}</span>! Visão da clínica.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/agenda')}
              className="sm:hidden bg-[#009386] text-white p-2.5 rounded-xl shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* KPIs Principais (Visíveis tanto no Desktop quanto no Mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 flex-shrink-0">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-[#E3DEC9] flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-bold text-[#56635C] uppercase tracking-wider truncate">
                      {stat.label}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div className="text-lg sm:text-2xl font-black text-[#1B2E26]">{stat.value}</div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-[#009386] truncate">
                      {stat.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo Semanal de Atendimentos */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E3DEC9] flex-shrink-0 shadow-xs">
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-[#E3DEC9]/70">
              <div>
                <div className="text-base sm:text-xl font-black text-[#009386] leading-none mb-0.5">{statsWeekly.completed}</div>
                <div className="text-[9px] sm:text-[10px] text-[#56635C] font-bold">Concluídos</div>
              </div>
              <div className="pl-2">
                <div className="text-base sm:text-xl font-black text-[#007491] leading-none mb-0.5">{statsWeekly.scheduled}</div>
                <div className="text-[9px] sm:text-[10px] text-[#56635C] font-bold">Agendados</div>
              </div>
              <div className="pl-2">
                <div className="text-base sm:text-xl font-black text-[#D94F3C] leading-none mb-0.5">{statsWeekly.cancelled}</div>
                <div className="text-[9px] sm:text-[10px] text-[#56635C] font-bold">Cancelados</div>
              </div>
            </div>
          </div>

          {/* Grid Principal */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:min-h-0">
            {/* Agenda de Hoje (Sempre Visível no Mobile e no Desktop) */}
            <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#E3DEC9] shadow-xs overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-[#E3DEC9] flex items-center justify-between flex-shrink-0 bg-[#F8F6F0]/50">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#1B2E26]">Agenda de Hoje</h2>
                  <p className="text-[10px] sm:text-xs text-[#56635C] capitalize">{dataHojeFormatada}</p>
                </div>
                <button
                  onClick={() => navigate('/admin/agenda')}
                  className="hidden sm:flex bg-[#009386] hover:bg-[#007491] text-white px-3.5 py-2 rounded-xl items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus size={14} /> Novo
                </button>
              </div>

              <div className="flex-1 divide-y divide-[#E3DEC9]/60 overflow-y-auto min-h-[260px] max-h-[380px] lg:max-h-none">
                {agendamentosHoje.length > 0 ? (
                  agendamentosHoje.map((item, index) => (
                    <div key={index} className="p-2.5 sm:p-3 hover:bg-[#F8F6F0]/60 transition-colors flex items-center gap-2.5 sm:gap-3">
                      <div className="w-12 sm:w-14 text-center py-1 rounded-lg text-xs font-bold bg-[#009386]/10 text-[#009386] flex-shrink-0">
                        {normalizeTime(item.horaInicio)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-[#1B2E26] truncate">
                          {item.nomeCliente || 'Atendimento Reservado'}
                        </div>
                        <div className="text-[10px] sm:text-xs text-[#56635C] flex items-center gap-1 mt-0.5 truncate">
                          <Clock size={11} />
                          {item.preco ? `R$ ${item.preco}` : 'Sessão'} • 50 min
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${item.status === 'CONCLUIDO'
                          ? 'bg-[#009386]/10 text-[#009386]'
                          : 'bg-[#3CD099]/15 text-[#0E2820]'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-xs text-[#56635C]">
                    Nenhum atendimento marcado para o dia de hoje.
                  </div>
                )}
              </div>

              <div className="p-2.5 border-t border-[#E3DEC9] bg-[#F8F6F0]/40 flex-shrink-0 text-right">
                <button
                  onClick={() => navigate('/admin/agenda')}
                  className="text-[#009386] hover:underline text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  Ver agenda completa <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Painel Lateral Desktop (Atividades Recentes + Complemento: Planos em Destaque e Ações Rápidas) */}
            {/* hidden lg:flex garante que em telas mobile este bloco seja totalmente removido */}
            <div className="hidden lg:flex flex-col gap-4 min-h-0 overflow-hidden">
              {/* Bloco Complementar 1: Ações e Acesso Rápido */}
              <div className="bg-white rounded-3xl p-4 border border-[#E3DEC9] shadow-xs flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#009386]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2E26]">Planos & Operação</h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#009386] bg-[#009386]/10 px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => navigate('/admin/financeiro')}
                    className="p-2.5 rounded-2xl bg-[#F8F6F0] hover:bg-[#EBE5D3]/60 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1B2E26]">Pacote Fisa Movimento</p>
                      <span className="text-[10px] text-[#56635C]">Pilates 2x/sem + Fisioterapia</span>
                    </div>
                    <ArrowUpRight size={15} className="text-[#009386]" />
                  </div>

                  <div
                    onClick={() => navigate('/admin/clientes')}
                    className="p-2.5 rounded-2xl bg-[#F8F6F0] hover:bg-[#EBE5D3]/60 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1B2E26]">Base de Pacientes</p>
                      <span className="text-[10px] text-[#56635C]">{clientes.length} cadastrados no sistema</span>
                    </div>
                    <ArrowUpRight size={15} className="text-[#009386]" />
                  </div>
                </div>
              </div>

              {/* Bloco Complementar 2: Atividades Recentes */}
              <div className="flex-1 bg-white rounded-3xl p-4 border border-[#E3DEC9] shadow-xs flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2E26]">Atividades Recentes</h3>
                  <span className="text-[9px] font-bold bg-[#009386]/10 text-[#009386] px-2 py-0.5 rounded-full">
                    Últimas
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
                  {recentActivity.map((activity, index) => {
                    const iconMap = {
                      success: CheckCircle2,
                      booking: Calendar,
                      info: Info,
                      alert: AlertCircle
                    };
                    const Icon = iconMap[activity.type as keyof typeof iconMap] || Info;

                    return (
                      <div key={index} className="flex gap-2.5 text-xs p-2.5 rounded-2xl bg-[#F8F6F0]/60 border border-[#E3DEC9]/50">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.type === 'success'
                            ? 'bg-[#009386]/10 text-[#009386]'
                            : activity.type === 'booking'
                              ? 'bg-[#007491]/10 text-[#007491]'
                              : activity.type === 'alert'
                                ? 'bg-[#FF6954]/10 text-[#D94F3C]'
                                : 'bg-[#EBE5D3] text-[#1B2E26]'
                          }`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#1B2E26] text-[11px] truncate">{activity.title}</div>
                          <div className="text-[#56635C] text-[10px] truncate mt-0.5">{activity.description}</div>
                          <div className="text-[9px] text-[#56635C]/70 font-semibold mt-0.5">{activity.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}