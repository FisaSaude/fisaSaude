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
  Info
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
    let usuarioId = localStorage.getItem('@FisaSaude:usuarioId');
    if (!usuarioId || isNaN(Number(usuarioId))) {
      usuarioId = '1';
    }

    const usuarioSalvo = localStorage.getItem('@FisaSaude:usuario');
    if (usuarioSalvo) {
      try {
        const parsed = JSON.parse(usuarioSalvo);
        if (parsed.nome) setUsuarioNome(parsed.nome);
      } catch {
        // Fallback para ADMIN_USER
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

      const listaClientes = Array.isArray(resClientes.data)
        ? resClientes.data
        : resClientes.data?.content || [];
      setClientes(listaClientes);

      const listaAgendamentos = Array.isArray(resAgendamentos.data)
        ? resAgendamentos.data
        : resAgendamentos.data?.content || [];
      setAgendamentosMes(listaAgendamentos);
    } catch (err) {
      console.error('Erro ao carregar dados dinâmicos do dashboard:', err);
    }
  }, [hoje]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Atendimentos específicos do dia atual
  const agendamentosHoje = useMemo(() => {
    return agendamentosMes
      .filter((a) => normalizeDate(a.data) === hojeKey && a.status !== 'CANCELADO')
      .sort((a, b) => normalizeTime(a.horaInicio).localeCompare(normalizeTime(b.horaInicio)));
  }, [agendamentosMes, hojeKey]);

  // Métricas Semanais e Mensais
  const statsWeekly = useMemo(() => {
    const concluidos = agendamentosMes.filter((a) => a.status === 'CONCLUIDO').length;
    const agendados = agendamentosMes.filter((a) => a.status === 'AGENDADO' || a.status === 'CONFIRMADO').length;
    const cancelados = agendamentosMes.filter((a) => a.status === 'CANCELADO').length;

    return {
      completed: concluidos,
      scheduled: agendados,
      cancelled: cancelados
    };
  }, [agendamentosMes]);

  // Atendimentos Hoje concluídos vs agendados
  const hojeConcluidos = useMemo(() => {
    return agendamentosHoje.filter((a) => a.status === 'CONCLUIDO').length;
  }, [agendamentosHoje]);

  // Taxa de Ocupação estimada (horários agendados em relação aos slots disponíveis no dia)
  const taxaOcupacao = useMemo(() => {
    const totalSlotsDia = 15; // base de 15 slots disponíveis
    if (agendamentosHoje.length === 0) return '0%';
    const pct = Math.min(100, Math.round((agendamentosHoje.length / totalSlotsDia) * 100));
    return `${pct}%`;
  }, [agendamentosHoje]);

  // Taxa de Adesão (Comparecimento vs Cancelamento no mês)
  const taxaAdesao = useMemo(() => {
    const total = statsWeekly.completed + statsWeekly.cancelled;
    if (total === 0) return '100%';
    const pct = Math.round((statsWeekly.completed / total) * 100);
    return `${pct}%`;
  }, [statsWeekly]);

  // Cards de Indicadores Superiores
  const stats = useMemo(() => [
    {
      icon: Users,
      label: 'Pacientes Ativos',
      value: String(clientes.length),
      change: `${clientes.filter((c) => c.whatsappAtivo !== false).length} com WhatsApp`,
      changeType: 'positive',
      color: 'from-primary to-emerald-600',
      tooltip: 'Total de pacientes cadastrados na base de dados do sistema.'
    },
    {
      icon: Calendar,
      label: 'Atendimentos Hoje',
      value: String(agendamentosHoje.length),
      change: `${hojeConcluidos} concluídos`,
      changeType: 'info',
      color: 'from-violet-500 to-purple-600',
      tooltip: 'Total de atendimentos agendados para a data de hoje.'
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Ocupação',
      value: taxaOcupacao,
      change: agendamentosHoje.length >= 8 ? 'Acima da média' : 'Dentro do esperado',
      changeType: 'positive',
      color: 'from-success to-emerald-600',
      tooltip: 'Percentual de horários ocupados na agenda do dia em relação aos horários disponíveis.'
    },
    {
      icon: Activity,
      label: 'Índice de Adesão',
      value: taxaAdesao,
      change: Number(taxaAdesao.replace('%', '')) >= 80 ? 'Excelente resultado' : 'Atenção às faltas',
      changeType: 'positive',
      color: 'from-amber-500 to-orange-600',
      tooltip: 'Proporção de atendimentos concluídos com sucesso frente aos cancelamentos deste mês.'
    },
  ], [clientes, agendamentosHoje, hojeConcluidos, taxaOcupacao, taxaAdesao]);

  // Lista dinâmica da Agenda do Dia
  const todaySchedule = useMemo(() => {
    if (agendamentosHoje.length === 0) return [];
    return agendamentosHoje.map((item) => ({
      time: normalizeTime(item.horaInicio),
      patient: item.nomeCliente || 'Atendimento Reservado',
      service: item.preco ? `Sessão • R$ ${item.preco}` : 'Sessão de Atendimento',
      status: item.status === 'CONCLUIDO' ? 'completed' : 'upcoming'
    }));
  }, [agendamentosHoje]);

  // Atividades Recentes baseadas nos últimos agendamentos do mês
  const recentActivity = useMemo(() => {
    const ordenados = [...agendamentosMes].reverse().slice(0, 4);

    if (ordenados.length === 0) {
      return [
        {
          type: 'info',
          title: 'Sistema Conectado',
          description: 'Nenhum agendamento recente para exibir no momento.',
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
              ? 'Intervalo Bloqueado'
              : 'Atendimento Agendado',
        description: item.nomeCliente
          ? `${item.nomeCliente} às ${normalizeTime(item.horaInicio)}`
          : `Horário ${normalizeTime(item.horaInicio)} - ${item.status}`,
        time: normalizeDate(item.data) === hojeKey ? 'Hoje' : normalizeDate(item.data)
      };
    });
  }, [agendamentosMes, hojeKey]);

  // Data formatada para o cabeçalho da agenda
  const dataHojeFormatada = useMemo(() => {
    return hoje.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [hoje]);

  const primeiroNome = usuarioNome.split(' ')[0] || 'Profissional';

  return (
    <div className="w-full lg:h-full lg:overflow-hidden flex flex-col lg:min-h-0">
      <div className="flex-1 lg:h-full lg:overflow-hidden p-4 sm:p-5 lg:p-6 flex flex-col lg:min-h-0">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:min-h-0 space-y-4 lg:space-y-5">

          {/* Header */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Central Operacional FISA
            </h1>
            <p className="text-sm text-muted-foreground">
              Olá, <span className="font-semibold text-foreground">{primeiroNome}</span>!
              Acompanhe os indicadores operacionais e atendimentos do dia.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group relative bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between">
                  {/* Tooltip */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative">
                      <button className="w-5 h-5 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors peer">
                        <Info size={12} className="text-primary" />
                      </button>
                      <div className="absolute right-0 top-6 w-64 bg-foreground text-background p-3 rounded-lg shadow-2xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all text-xs leading-relaxed z-50">
                        {stat.tooltip}
                        <div className="absolute -top-1 right-2 w-2 h-2 bg-foreground rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon className="text-white" size={18} />
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none">{stat.value}</div>
                    <div className={`text-[11px] font-semibold flex items-center gap-0.5 ${stat.changeType === 'positive' ? 'text-success' :
                      stat.changeType === 'info' ? 'text-primary' : 'text-warning'
                      }`}>
                      {stat.changeType === 'positive' && <TrendingUp size={12} />}
                      {stat.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Main Content Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 lg:min-h-0 lg:h-full w-full">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 flex flex-col lg:h-full lg:min-h-0">
              <div className="bg-card rounded-xl shadow-sm border border-border flex flex-col lg:h-full lg:min-h-0 lg:overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Agenda do Dia</h2>
                    <p className="text-xs text-muted-foreground font-medium capitalize">
                      {dataHojeFormatada}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/agenda')}
                    className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:scale-[1.02] flex-shrink-0 cursor-pointer"
                  >
                    <Plus size={16} />
                    Novo Atendimento
                  </button>
                </div>

                {/* Lista de horários dinâmicos */}
                <div className="flex-1 divide-y divide-border lg:overflow-y-auto lg:min-h-0">
                  {todaySchedule.length > 0 ? (
                    todaySchedule.map((item, index) => (
                      <div key={index} className="p-3 hover:bg-accent/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`
                            min-w-[65px] text-center py-1.5 rounded-lg font-semibold text-sm
                            ${item.status === 'completed'
                              ? 'bg-success/10 text-success ring-1 ring-success/20'
                              : 'bg-primary/10 text-primary ring-1 ring-primary/20'
                            }
                          `}>
                            <div>{item.time}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{item.patient}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-0.5">
                              <Clock size={12} />
                              {item.service} • 50 min
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {item.status === 'completed' ? (
                              <span className="text-[11px] bg-success/10 text-success px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ring-1 ring-success/20">
                                <CheckCircle2 size={12} />
                                Concluído
                              </span>
                            ) : (
                              <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold ring-1 ring-primary/20">
                                Agendado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Nenhum atendimento marcado para o dia de hoje.
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-border bg-accent/20 flex-shrink-0">
                  <button
                    onClick={() => navigate('/admin/agenda')}
                    className="text-primary hover:text-primary/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Ver agenda completa
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Direita */}
            <div className="flex flex-col lg:h-full lg:min-h-0 space-y-4">
              {/* Quick Actions */}
              <div className="bg-card rounded-xl p-4 shadow-sm border border-border flex-shrink-0">
                <h3 className="text-sm font-bold text-foreground mb-3">Ações Rápidas</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/admin/agenda')}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ring-1 ring-primary/20 cursor-pointer"
                  >
                    <Calendar size={18} />
                    <span>Agendar Atendimento</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/clientes')}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ring-1 ring-emerald-200 dark:ring-emerald-500/20 cursor-pointer"
                  >
                    <Users size={18} />
                    <span>Novo Paciente</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-xl p-4 shadow-sm border border-border flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
                <h3 className="text-sm font-bold text-foreground mb-3 flex-shrink-0">Atividades Recentes</h3>
                <div className="flex-1 space-y-3.5 lg:overflow-y-auto lg:min-h-0 pr-1">
                  {recentActivity.map((activity, index) => {
                    const iconMap = {
                      success: CheckCircle2,
                      booking: Calendar,
                      info: Info,
                      alert: AlertCircle,
                    };
                    const Icon = iconMap[activity.type as keyof typeof iconMap];

                    return (
                      <div key={index} className="flex gap-3 text-xs">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${activity.type === 'success' ? 'bg-success/10 text-success' :
                            activity.type === 'booking' ? 'bg-primary/10 text-primary' :
                              activity.type === 'info' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                'bg-warning/10 text-warning'}
                        `}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">{activity.title}</div>
                          <div className="text-muted-foreground line-clamp-2 mt-0.5 leading-normal">{activity.description}</div>
                          <div className="text-[10px] text-muted-foreground mt-1 font-medium">{activity.time}</div>
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