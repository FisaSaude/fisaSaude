import { Calendar, Users, Activity, TrendingUp, Clock, Plus, ChevronRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ADMIN_USER } from '../../constants/company';

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: Users,
      label: 'Pacientes Ativos',
      value: '156',
      change: '+12 neste mês',
      changeType: 'positive',
      color: 'from-primary to-emerald-600',
      tooltip: 'Total de pacientes com atendimentos regulares agendados ou realizados nos últimos 30 dias.'
    },
    {
      icon: Calendar,
      label: 'Atendimentos Hoje',
      value: '18',
      change: '6 concluídos',
      changeType: 'info',
      color: 'from-violet-500 to-purple-600',
      tooltip: 'Atendimentos agendados para hoje. O total includes sessões de fisioterapia, pilates e outras modalidades.'
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Ocupação',
      value: '87%',
      change: 'Acima da meta (80%)',
      changeType: 'positive',
      color: 'from-success to-emerald-600',
      tooltip: 'Percentual de horários preenchidos em relação ao total disponível na agenda. Cálculo baseado nas últimas 4 semanas.'
    },
    {
      icon: Activity,
      label: 'Índice de Adesão',
      value: '94%',
      change: 'Excelente resultado',
      changeType: 'positive',
      color: 'from-amber-500 to-orange-600',
      tooltip: 'Percentual de pacientes que comparecem às sessões agendadas. Métrica importante para avaliar engajamento.'
    },
  ];

  const todaySchedule = [
    { time: '08:00', patient: 'Ana Paula Silva', service: 'Fisioterapia', status: 'completed' },
    { time: '08:50', patient: 'Carlos Eduardo Santos', service: 'Pilates Terapêutico', status: 'completed' },
    { time: '09:40', patient: 'Juliana Rodrigues', service: 'Acupuntura', status: 'completed' },
    { time: '10:30', patient: 'Roberto Lima Oliveira', service: 'Fisioterapia', status: 'completed' },
    { time: '11:20', patient: 'Marina Costa Souza', service: 'Pilates Terapêutico', status: 'completed' },
    { time: '12:10', patient: 'Fernando Alves', service: 'Terapia Ocupacional', status: 'completed' },
    { time: '14:00', patient: 'Beatriz Mendes', service: 'Fisioterapia', status: 'upcoming' },
    { time: '14:50', patient: 'Lucas Ferreira', service: 'Pilates Terapêutico', status: 'upcoming' },
    { time: '15:40', patient: 'Camila Santos', service: 'Acupuntura', status: 'upcoming' },
    { time: '16:30', patient: 'André Moreira', service: 'Fisioterapia', status: 'upcoming' },
    { time: '17:20', patient: 'Patrícia Lima', service: 'Pilates Terapêutico', status: 'upcoming' },
    { time: '18:10', patient: 'Ricardo Souza', service: 'Terapia Ocupacional', status: 'upcoming' },
  ];

  const recentActivity = [
    {
      type: 'success',
      title: 'Sessão Concluída',
      description: 'Ana Paula Silva - Fisioterapia Postural',
      time: '12 min atrás'
    },
    {
      type: 'booking',
      title: 'Novo Agendamento',
      description: 'Beatriz Mendes agendou sessão para amanhã',
      time: '45 min atrás'
    },
    {
      type: 'info',
      title: 'Observação Clínica',
      description: 'Lucas Ferreira reportou melhora significativa',
      time: '1h atrás'
    },
    {
      type: 'alert',
      title: 'Confirmação Pendente',
      description: 'Ricardo Souza - confirmar presença',
      time: '2h atrás'
    },
  ];

  const statsWeekly = {
    completed: 124,
    scheduled: 38,
    cancelled: 3,
  };

  return (
    <div className="w-full lg:h-full lg:overflow-hidden flex flex-col lg:min-h-0">
      <div className="flex-1 lg:h-full lg:overflow-hidden p-4 sm:p-5 lg:p-6 flex flex-col lg:min-h-0">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:min-h-0 space-y-4 lg:space-y-5">

          {/* Header - Reduzido o espaçamento */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Central Operacional FISA
            </h1>
            <p className="text-sm text-muted-foreground">
              Olá, <span className="font-semibold text-foreground">{ADMIN_USER.name.split(' ')[1]}</span>!
              Acompanhe os indicadores operacionais e atendimentos do dia.
            </p>
          </div>

          {/* Stats Grid - Layout compacto com tamanhos e paddings reduzidos */}
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

          {/* Weekly Summary - Compactado */}
          <div className="bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-xl p-4 border border-primary/20 flex-shrink-0">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center border-r border-border/60">
                <div className="text-2xl font-bold text-success leading-none mb-1">{statsWeekly.completed}</div>
                <div className="text-xs text-muted-foreground font-semibold">Atendimentos Concluídos</div>
              </div>
              <div className="text-center border-r border-border/60">
                <div className="text-2xl font-bold text-primary leading-none mb-1">{statsWeekly.scheduled}</div>
                <div className="text-xs text-muted-foreground font-semibold">Próximos Atendimentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning leading-none mb-1">{statsWeekly.cancelled}</div>
                <div className="text-xs text-muted-foreground font-semibold">Cancelamentos</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Travado na tela apenas no desktop (lg), no mobile a página cresce e rola via <main> */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 lg:min-h-0 lg:h-full w-full">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 flex flex-col lg:h-full lg:min-h-0">
              <div className="bg-card rounded-xl shadow-sm border border-border flex flex-col lg:h-full lg:min-h-0 lg:overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Agenda do Dia</h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      Quinta-feira, 29 de Maio de 2026
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/agenda')}
                    className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:scale-[1.02] flex-shrink-0"
                  >
                    <Plus size={16} />
                    Novo Atendimento
                  </button>
                </div>

                {/* Lista de horários com scroll interno e independente (apenas no desktop) */}
                <div className="flex-1 divide-y divide-border lg:overflow-y-auto lg:min-h-0">
                  {todaySchedule.map((item, index) => (
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
                  ))}
                </div>
                <div className="p-3 border-t border-border bg-accent/20 flex-shrink-0">
                  <button
                    onClick={() => navigate('/admin/agenda')}
                    className="text-primary hover:text-primary/80 text-xs font-semibold flex items-center gap-1 transition-colors"
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
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ring-1 ring-primary/20"
                  >
                    <Calendar size={18} />
                    <span>Agendar Atendimento</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/clientes')}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ring-1 ring-emerald-200 dark:ring-emerald-500/20"
                  >
                    <Users size={18} />
                    <span>Novo Paciente</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity - Agora com flex-1 e scroll interno autônomo (apenas no desktop) */}
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