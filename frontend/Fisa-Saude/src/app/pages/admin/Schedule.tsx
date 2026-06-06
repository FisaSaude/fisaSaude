import { Plus, ChevronLeft, ChevronRight, Search, X, Clock, User, Phone, Calendar as CalendarIcon, CalendarDays, CalendarRange, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

type ViewType = 'day' | 'week' | 'month';

interface AgendamentoReal {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' | 'BLOQUEADO';
  observacoes: string;
  clienteNome: string;
  clienteId?: number;
  clienteWhatsapp?: string;
  servicoNome: string;
  servicoId?: number;
}

export default function Schedule() {
  const [view, setView] = useState<ViewType>('month');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AgendamentoReal | null>(null);
  
  // --- ESTADOS DO CALENDÁRIO DINÂMICO ---
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate()); 

  // Estados para dados vindos do Back-end
  const [agendamentos, setAgendamentos] = useState<AgendamentoReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado para o Pop-up de Sucesso (Toast)
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // --- ESTADOS DO FORMULÁRIO DE AGENDAMENTO ---
  const [nomeClienteInput, setNomeClienteInput] = useState(''); 
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState('1'); 
  const [sugestoesFiltradas, setSugestoesFiltradas] = useState<{id: number, nome: string}[]>([]);
  const [showDropdownSugestoes, setShowDropdownSugestoes] = useState(false);

  // Estados para os formulários
  const [formData, setFormData] = useState({
    data: '',
    horaInicio: '',
    horaFim: '',
    observacoes: ''
  });

  const [blockData, setBlockData] = useState({
    data: '',
    horaInicio: '',
    horaFim: '',
    reason: ''
  });

  // Lista de serviços baseada estritamente no pilates.sql
  const servicosFisaSaude = [
    { id: 1, nome: 'Aula Experimental' },
    { id: 2, nome: 'Aula Avulsa' },
    { id: 3, nome: 'Aula Mensal' },
    { id: 4, nome: 'Aula Semestral' }
  ];

  // Lista de clientes cadastrados no pilates.sql para o Autocomplete
  const clientesMapeados = [
    { id: 1, nome: 'Mariana Silva' },
    { id: 2, nome: 'Joao Pereira' },
    { id: 3, nome: 'Ana Souza' },
    { id: 4, nome: 'Carlos Mendes' },
    { id: 5, nome: 'Beatriz Costa' }
  ];

  const token = localStorage.getItem('@FisaSaude:token');
  const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth(); 

  const nomesDosMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
  const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

  const dataInicioFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
  const dataFimFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(totalDiasNoMes).padStart(2, '0')}`;

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3500);
  };

  // --- REQUISIÇÕES HTTP ---

  const carregarDadosDaAgenda = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Tenta puxar primeiro os que estão confirmados
      let response = await api.get('/agendamentos', {
        params: {
          status: 'CONFIRMADO',
          dataInicio: dataInicioFormatada,
          dataFim: dataFimFormatada
        }
      });

      let dados = response.data;

      // Se o JSON vier vazio, faz o fallback para buscar os com status AGENDADO
      if (!dados || dados.length === 0) {
        const fallbackResponse = await api.get('/agendamentos', {
          params: {
            status: 'AGENDADO',
            dataInicio: dataInicioFormatada,
            dataFim: dataFimFormatada
          }
        });
        dados = fallbackResponse.data;
      }

      setAgendamentos(dados || []);
    } catch (error: any) {
      console.error(error);
      setErrorMessage('Não foi possível atualizar a agenda para este período.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDaAgenda();
  }, [currentDate]);

  // Monitora a digitação e filtra as sugestões de alunos
  useEffect(() => {
    if (nomeClienteInput.trim() === '') {
      setSugestoesFiltradas([]);
      return;
    }

    const filtrados = clientesMapeados.filter(cliente =>
      cliente.nome.toLowerCase().includes(nomeClienteInput.toLowerCase())
    );
    setSugestoesFiltradas(filtrados);
  }, [nomeClienteInput]);

  const voltarMes = () => {
    setCurrentDate(new Date(ano, mes - 1, 1));
    setSelectedDate(1);
  };

  const avancarMes = () => {
    setCurrentDate(new Date(ano, mes + 1, 1));
    setSelectedDate(1);
  };

  const irParaHoje = () => {
    const hoje = new Date();
    setCurrentDate(hoje);
    setSelectedDate(hoje.getDate());
  };

  const formatDayKey = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
  const daySchedule = agendamentos.filter(b => b.data === formatDayKey);

  const daysWithBookings = agendamentos.map(b => {
    const partes = b.data.split('-'); 
    return Number(partes[1]) === (mes + 1) && Number(partes[0]) === ano ? Number(partes[2]) : null;
  }).filter(d => d !== null) as number[];

  const getDaysInMonthGrid = () => {
    const days = [];
    for (let i = 0; i < primeiroDiaDaSemana; i++) days.push(null);
    for (let i = 1; i <= totalDiasNoMes; i++) days.push(i);
    return days;
  };

  const handleCriarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mapeia o nome em texto digitado para o ID numérico correspondente
    const clienteEncontrado = clientesMapeados.find(
      c => c.nome.toLowerCase().trim() === nomeClienteInput.toLowerCase().trim()
    );

    const finalClienteId = clienteEncontrado ? clienteEncontrado.id : 1;

    try {
      await api.post('/agendamentos', {
        data: formData.data,
        horaInicio: `${formData.horaInicio}:00`,
        horaFim: `${formData.horaFim}:00`,
        clienteId: finalClienteId,          
        servicoId: Number(servicoSelecionadoId), 
        usuarioId: 1, 
        observacoes: formData.observacoes
      });
      
      setShowNewBookingModal(false);
      setFormData({ data: '', horaInicio: '', horaFim: '', observacoes: '' });
      setNomeClienteInput('');
      
      triggerSuccess('Agendamento realizado com sucesso!');
      carregarDadosDaAgenda();
    } catch (error) {
      alert('Erro ao registrar agendamento. Verifique as chaves ou se os IDs batem no MySQL.');
    }
  };

  const handleBloquearHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/agendamentos', {
        data: blockData.data,
        horaInicio: `${blockData.horaInicio}:00`,
        horaFim: `${blockData.horaFim}:00`,
        usuarioId: 1,
        observacoes: `Bloqueado: ${blockData.reason}`
      });
      setShowBlockModal(false);
      setBlockData({ data: '', horaInicio: '', horaFim: '', reason: '' });
      
      triggerSuccess('Horário bloqueado operacionalmente!');
      carregarDadosDaAgenda();
    } catch (error) {
      alert('Erro ao bloquear horário.');
    }
  };

  const handleMudarStatus = async (id: number, novoStatus: string) => {
    try {
      await api.put(`/agendamentos/${id}/status?novoStatus=${novoStatus}`);
      setSelectedBooking(null);
      
      triggerSuccess(`Agendamento atualizado para ${novoStatus.toLowerCase()}!`);
      carregarDadosDaAgenda();
    } catch (error) {
      alert('Falha ao atualizar status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmado': return 'bg-emerald-500 border-emerald-600';
      case 'cancelado': return 'bg-red-400 border-red-500';
      case 'bloqueado': return 'bg-gray-400 border-gray-500';
      default: return 'bg-amber-400 border-amber-500';
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  return (
    <div className="h-full w-full lg:overflow-hidden flex flex-col min-h-0 bg-background relative">
      
      {/* POP-UP (TOAST) DE SUCESSO COESIVO */}
      {showSuccessToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 border border-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm animate-bounce">
          <CheckCircle2 size={18} className="text-white flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex-1 h-full lg:overflow-hidden p-4 sm:p-5 lg:p-6 flex flex-col min-h-0">
        <div className="max-w-[1600px] w-full flex-1 flex flex-col min-h-0 space-y-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Agenda</h1>
              <p className="text-xs sm:text-sm text-gray-600">Gerencie os horários do estúdio de forma totalmente dinâmica</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowBlockModal(true)} className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all font-semibold text-sm shadow-sm">
                Bloquear Horário
              </button>
              <button onClick={() => {
                setFormData({ ...formData, data: formatDayKey });
                setShowNewBookingModal(true);
              }} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-semibold text-sm">
                <Plus size={16} /> Novo Agendamento
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <ShieldAlert size={16} className="text-red-600" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Navegação de Meses Dinâmica */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                <button className="p-2 hover:bg-white rounded-md transition-all" onClick={voltarMes}>
                  <ChevronLeft className="text-gray-600" size={16} />
                </button>
                <button className="p-2 hover:bg-white rounded-md transition-all" onClick={avancarMes}>
                  <ChevronRight className="text-gray-600" size={16} />
                </button>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">{nomesDosMeses[mes]} {ano}</div>
                <div className="text-xs text-gray-500 font-medium">Visualizando Dia {selectedDate}</div>
              </div>
              <button onClick={irParaHoje} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-all">
                Hoje
              </button>
            </div>

            <div className="inline-flex gap-0.5 p-1 bg-gray-100 rounded-xl">
              {['day', 'week', 'month'].map((type) => (
                <button key={type} onClick={() => setView(type as ViewType)} className={`px-4 py-1.5 rounded-lg transition-all font-bold text-xs flex items-center gap-1.5 capitalize ${view === type ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  {type === 'day' ? <CalendarIcon size={14} /> : type === 'week' ? <CalendarRange size={14} /> : <CalendarDays size={14} />}
                  {type === 'day' ? 'Dia' : type === 'week' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Visualização */}
          <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 h-full w-full">
            <div className={`flex-1 h-full min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm ${view === 'month' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4'}`}>
              
              {loading ? (
                <div className="flex justify-center items-center h-full w-full">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : view === 'month' ? (
                <div className="h-full w-full flex flex-col min-h-0">
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-center py-2 flex-shrink-0">
                    {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d) => (
                      <span key={d} className="text-[10px] font-bold text-gray-500 tracking-wider">{d}</span>
                    ))}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-7 grid-rows-5 min-h-0">
                    {getDaysInMonthGrid().map((day, idx) => {
                      if (day === null) return <div key={`empty-${idx}`} className="border-b border-r border-gray-100 bg-gray-50/30" />;
                      
                      const hasBookings = daysWithBookings.includes(day);
                      const isSelected = day === selectedDate;
                      
                      return (
                        <button key={`day-${day}`} onClick={() => { setSelectedDate(day); setView('day'); }} className={`border-b border-r border-gray-100 p-2 text-left flex flex-col justify-between transition-colors hover:bg-gray-50/80 group ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                          <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-700'}`}>
                            {day}
                          </span>
                          {hasBookings && (
                            <div className="w-full text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded truncate font-semibold border border-emerald-100 group-hover:bg-emerald-100">
                              Sessões Ativas
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {agendamentos.map(b => (
                    <div key={b.id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center">
                      <div className="text-xs font-bold text-gray-800">{b.clienteNome} ({b.servicoNome})</div>
                      <div className="text-[11px] font-medium text-gray-500">{b.data} | {b.horaInicio.substring(0,5)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Linha do Tempo Operacional por Dia */}
            {(view === 'day' || window.innerWidth > 1024) && (
              <div className="w-full lg:w-[480px] xl:w-[520px] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Horários do Dia
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-100">{String(selectedDate).padStart(2,'0')}/{String(mes+1).padStart(2,'0')}</span>
                  </div>
                </div>

                <div className="flex-1 divide-y divide-gray-100 overflow-y-auto min-h-0 p-3 space-y-2">
                  {timeSlots.map((time) => {
                    const booking = daySchedule.find(b => b.horaInicio.substring(0, 5) === time);
                    const isOccupied = !!booking;
                    
                    return (
                      <div key={time} className={`flex items-center gap-3 p-2 rounded-xl transition-all border border-transparent ${isOccupied ? 'bg-emerald-50/40 border-emerald-100/60 hover:bg-emerald-50 cursor-pointer' : 'hover:bg-gray-50'}`} onClick={() => isOccupied && setSelectedBooking(booking)}>
                        <div className="w-12 flex-shrink-0 text-xs font-bold text-gray-500">{time}</div>
                        <div className="flex-1 min-w-0">
                          {isOccupied ? (
                            <div>
                              <div className="text-sm font-bold text-gray-900 truncate">{booking.clienteNome}</div>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">Sessão: {booking.servicoNome}</div>
                            </div>
                          ) : (
                            <button onClick={() => { 
                              setFormData({ ...formData, horaInicio: time, data: formatDayKey }); 
                              setNomeClienteInput('');
                              setShowNewBookingModal(true); 
                            }} className="text-xs font-semibold text-gray-400 hover:text-emerald-700 transition-colors">
                              Disponível
                            </button>
                          )}
                        </div>
                        {isOccupied && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">{booking.status}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DETALHES MAPEADO COM O JAVA DTO REAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedBooking.clienteNome}</h2>
                <span className="text-xs bg-amber-50 text-amber-800 border px-2 py-0.5 rounded-full mt-1 inline-block font-semibold uppercase tracking-wider">{selectedBooking.status}</span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                <strong>Horário:</strong> {selectedBooking.horaInicio ? selectedBooking.horaInicio.substring(0, 5) : ''} às {selectedBooking.horaFim ? selectedBooking.horaFim.substring(0, 5) : ''}
              </div>
              <div>
                <strong>Modalidade:</strong> {selectedBooking.servicoNome || 'Geral'}
              </div>
              {selectedBooking.clienteWhatsapp && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <strong>WhatsApp:</strong> {selectedBooking.clienteWhatsapp}
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs border border-gray-100 mt-2">
                <div className="font-bold text-gray-400 uppercase tracking-wider">Observações da Ficha</div>
                <p className="text-gray-700 italic">{selectedBooking.observacoes || 'Nenhuma observação cadastrada para este horário.'}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              {selectedBooking.status !== 'CONFIRMADO' && selectedBooking.status !== 'CANCELADO' && (
                <button onClick={() => handleMudarStatus(selectedBooking.id, 'CONFIRMADO')} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors">
                  Confirmar Presença
                </button>
              )}
              {selectedBooking.status !== 'CANCELADO' && (
                <button onClick={() => handleMudarStatus(selectedBooking.id, 'CANCELADO')} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-red-600 transition-colors">
                  Cancelar Aula
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO AGENDAMENTO COM AUTOCOMPLETE DE NOME */}
      {showNewBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewBookingModal(false)}>
          <form onSubmit={handleCriarAgendamento} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Marcar Horário de Pilates</h2>
              <button type="button" onClick={() => setShowNewBookingModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            
            <div className="space-y-3">
              {/* Autocomplete do Nome do Aluno */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome completo do aluno</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Comece a digitar o nome..." 
                  value={nomeClienteInput} 
                  onChange={e => {
                    setNomeClienteInput(e.target.value);
                    setShowDropdownSugestoes(true);
                  }} 
                  onFocus={() => setShowDropdownSugestoes(true)}
                  className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none font-medium" 
                />
                
                {/* Dropdown de sugestões flutuante */}
                {showDropdownSugestoes && sugestoesFiltradas.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-40 overflow-y-auto z-50 divide-y divide-gray-50">
                    {sugestoesFiltradas.map(cliente => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => {
                          setNomeClienteInput(cliente.nome);
                          setShowDropdownSugestoes(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-800 transition-colors font-medium flex items-center gap-2"
                      >
                        <User size={14} className="text-gray-400" />
                        {cliente.nome}
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-gray-400 mt-0.5 block">O sistema sugerirá nomes cadastrados conforme você digita.</span>
              </div>

              {/* Seletor Textual de Serviço */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modalidade do Serviço</label>
                <select 
                  value={servicoSelecionadoId} 
                  onChange={e => setServicoSelecionadoId(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none font-medium"
                >
                  {servicosFisaSaude.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data do Agendamento</label>
                <input type="date" required value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horário Início</label>
                  <input type="time" required value={formData.horaInicio} onChange={e => setFormData({...formData, horaInicio: e.target.value})} className="p-2.5 border rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horário Fim</label>
                  <input type="time" required value={formData.horaFim} onChange={e => setFormData({...formData, horaFim: e.target.value})} className="p-2.5 border rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações Clínicas</label>
                <textarea placeholder="Histórico de dores, recomendações de fisioterapia, etc." value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-emerald-500" rows={2} />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowNewBookingModal(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition-colors">Salvar na Agenda</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL BLOQUEIO */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBlockModal(false)}>
          <form onSubmit={handleBloquearHorario} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900">Bloquear Horário</h2>
            <input type="date" required value={blockData.data} onChange={e => setBlockData({...blockData, data: e.target.value})} className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="time" required value={blockData.horaInicio} onChange={e => setBlockData({...blockData, horaInicio: e.target.value})} className="p-2.5 border rounded-xl bg-gray-50 text-sm" />
              <input type="time" required value={blockData.horaFim} onChange={e => setBlockData({...blockData, horaFim: e.target.value})} className="p-2.5 border rounded-xl bg-gray-50 text-sm" />
            </div>
            <input type="text" required placeholder="Motivo" value={blockData.reason} onChange={e => setBlockData({...blockData, reason: e.target.value})} className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowBlockModal(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-sm font-semibold">Cancelar</button>
              <button type="submit" className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold">Bloquear</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}