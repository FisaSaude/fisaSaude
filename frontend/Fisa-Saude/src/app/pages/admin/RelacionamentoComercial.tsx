import { useState } from 'react';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  Percent, 
  Instagram, 
  Share2, 
  Globe, 
  MessageCircle, 
  Sparkles, 
  ArrowRight,
  Compass,
  Heart
} from 'lucide-react';

// 1. DADOS MOCKADOS (Baseados no fluxo do Pipefy e histórico da clínica)
const kpisData = [
  { label: 'Interessados', value: '45 pessoas', subtitle: 'Procuraram a clínica', icon: Users, color: 'bg-emerald-500' },
  { label: 'Aulas Agendadas', value: '32 sessões', subtitle: 'Experimentais marcadas', icon: Calendar, color: 'bg-teal-600' },
  { label: 'Novos Alunos', value: '15 matrículas', subtitle: 'Iniciaram este mês', icon: UserPlus, color: 'bg-success' },
  { label: 'Aproveitamento', value: '33%', subtitle: 'Conversão de contatos', icon: Percent, color: 'bg-primary' },
];

const journeySteps = [
  { name: 'Demonstrou Interesse', count: 45, color: 'bg-primary' },
  { name: 'Primeiro Contato', count: 38, color: 'bg-emerald-600' },
  { name: 'Conheceu os Planos', count: 32, color: 'bg-teal-600' },
  { name: 'Aula Agendada', count: 18, color: 'bg-sky-600' },
  { name: 'Tornou-se Aluno', count: 15, color: 'bg-success' },
];

const clientOrigins = [
  { name: 'Instagram', count: 24, percentage: 45, icon: Instagram, color: 'from-pink-500 to-purple-600' },
  { name: 'Indicação de amigos', count: 15, percentage: 28, icon: Share2, color: 'from-primary to-emerald-600' },
  { name: 'Pesquisas no Google', count: 8, percentage: 15, icon: Globe, color: 'from-blue-500 to-cyan-600' },
  { name: 'Site da Clínica', count: 4, percentage: 8, icon: Globe, color: 'from-teal-500 to-emerald-500' },
  { name: 'Conversas no WhatsApp', count: 2, percentage: 4, icon: MessageCircle, color: 'from-success to-emerald-500' },
];

const insightsData = [
  { text: 'O Instagram continua sendo a sua principal fonte de novos alunos. Vale a pena manter as postagens semanais movimentadas.', type: 'star' },
  { text: 'Atenção: Existem 18 pessoas que conheceram os planos e estão aguardando o agendamento da aula experimental.', type: 'alert' },
  { text: 'Os clientes que vêm por indicação de amigos apresentam a maior taxa de fechamento de planos do estúdio.', type: 'success' },
  { text: 'Os canais digitais (Instagram, Google e Site) juntos somam 68% de toda a captação atual da clínica.', type: 'info' }
];

export default function RelacionamentoComercial() {
  return (
    <div className="h-full w-full lg:overflow-hidden flex flex-col min-h-0 bg-background">
      {/* Container de Padding Responsivo */}
      <div className="flex-1 h-full lg:overflow-hidden p-4 sm:p-5 lg:p-6 flex flex-col min-h-0">
        <div className="max-w-[1600px] w-full flex-1 flex flex-col min-h-0 space-y-4">
          
          {/* Cabeçalho */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Gestão Comercial</h1>
            <p className="text-xs text-gray-600">Acompanhe a jornada dos interessados até se tornarem alunos.</p>
          </div>

          {/* Cards de Resumo (4 Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
            {kpisData.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xs flex items-center gap-3.5">
                  <div className={`w-10 h-10 ${kpi.color} rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">{kpi.label}</span>
                    <span className="text-lg font-bold text-gray-900 leading-tight block mt-0.5">{kpi.value}</span>
                    <span className="text-[10px] text-gray-500 font-medium truncate block mt-0.5">{kpi.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Destaque Central: Jornada do Cliente (Funil Horizontal) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-shrink-0">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Jornada do Cliente</h2>
            
            {/* Grid Horizontal Dinâmico */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center w-full">
              {journeySteps.map((step, index) => {
                const maxCount = journeySteps[0].count;
                const progressWidth = (step.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center w-full relative">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex-1 min-w-0 flex flex-col justify-between h-20 shadow-xs relative overflow-hidden">
                      {/* Barra de progressão sutil de fundo */}
                      <div 
                        className={`absolute bottom-0 left-0 h-1 ${step.color} transition-all duration-500`}
                        style={{ width: `${progressWidth}%` }}
                      />
                      
                      <div className="text-xs font-bold text-gray-700 truncate">{step.name}</div>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-lg font-extrabold text-gray-900">{step.count}</span>
                        <span className="text-[10px] text-gray-400 font-medium">etapa {index + 1}</span>
                      </div>
                    </div>

                    {/* Seta indicadora entre os blocos (Oculta no mobile) */}
                    {index < journeySteps.length - 1 && (
                      <div className="hidden lg:flex items-center justify-center w-4 text-gray-300 mx-1 flex-shrink-0">
                        <ArrowRight size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divisão do Layout Inferior em Duas Colunas (Split View) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 h-full w-full">
            
            {/* Como os Clientes Conheceram a Clínica (7 de 12 Colunas) */}
            <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col min-h-0">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex-shrink-0">Como os clientes conheceram a clínica</h2>
              
              {/* Gráfico de barras horizontais nativo com scroll interno seguro */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-0 justify-center flex flex-col">
                {clientOrigins.map((origin, index) => {
                  const Icon = origin.icon;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-700 flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${origin.color} flex items-center justify-center text-white`}>
                            <Icon size={12} />
                          </span>
                          {origin.name}
                        </span>
                        <span className="text-gray-900 font-bold">{origin.count} alunos ({origin.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/20">
                        <div
                          className={`h-full bg-gradient-to-r ${origin.color} rounded-full transition-all duration-500`}
                          style={{ width: `${origin.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Observações e Oportunidades - Insights Automatizados (5 de 12 Colunas) */}
            <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col min-h-0">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex-shrink-0">O que merece atenção</h2>
              
              {/* Lista Vertical Organizada com Rolagem Autônoma */}
              <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0 pr-1">
                {insightsData.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border text-xs leading-normal flex items-start gap-2.5 ${
                      insight.type === 'success' ? 'bg-emerald-50/30 border-emerald-500/10 text-gray-700' :
                      insight.type === 'alert' ? 'bg-amber-50/30 border-amber-500/10 text-gray-700' :
                      'bg-blue-50/30 border-blue-500/10 text-gray-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      insight.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      insight.type === 'alert' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.type === 'star' ? <Sparkles size={12} /> : <Compass size={12} />}
                    </div>
                    <div className="flex-1 font-medium">
                      {insight.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Rodapé Comercial FisaSaúde */}
          <div className="text-center text-[11px] text-muted-foreground font-medium pt-2 border-t border-gray-100 flex-shrink-0 flex items-center justify-center gap-1">
            <Heart size={12} className="text-red-500 fill-red-500" /> Painel gerencial simplificado integrado com as diretrizes do estúdio FisaSaúde.
          </div>
          
        </div>
      </div>
    </div>
  );
}