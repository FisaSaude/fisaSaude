import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Clock,
  CheckCircle2,
  ShieldAlert,
  CalendarCheck,
  Ban,
  Calendar as CalendarIcon
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { api } from '../../services/api';

type ViewType = 'week' | 'month';

export type StatusAgendamentoEnum =
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'CONCLUIDO'
  | 'BLOQUEADO';

export interface AgendamentoUsuarioPeriodoResponseDto {
  id: number;
  data: string | number[];
  horaInicio: string | number[];
  horaFim: string | number[];
  nomeCliente?: string | null;
  status: StatusAgendamentoEnum;
  preco?: number | null;
}

interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
}

export interface FeriadoItem {
  date: string;
  name: string;
  type?: string;
}

/* =========================================================
   AUXILIARES DE DATA/HORA
========================================================= */

const normalizeDate = (value: any): string => {
  if (!value) return '';
  if (Array.isArray(value)) {
    const y = String(value[0]);
    const m = String(value[1]).padStart(2, '0');
    const d = String(value[2]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(value);
  return str.includes('T') ? str.split('T')[0] : str.substring(0, 10);
};

const normalizeTime = (value: any): string => {
  if (!value) return '';
  if (Array.isArray(value)) {
    const h = String(value[0]).padStart(2, '0');
    const m = String(value[1] || 0).padStart(2, '0');
    return `${h}:${m}`;
  }
  return String(value).substring(0, 5);
};

const dateToKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const startOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

const calcularHoraFim = (hora: string) => {
  if (!hora) return '';
  const [h, m] = hora.split(':').map(Number);
  const date = new Date();
  date.setHours(h, (m || 0) + 50, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function Schedule() {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [agendamentos, setAgendamentos] = useState<AgendamentoUsuarioPeriodoResponseDto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Modais
  const [showDayScheduleModal, setShowDayScheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AgendamentoUsuarioPeriodoResponseDto | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [clienteInput, setClienteInput] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    data: '',
    horaInicio: '',
    horaFim: '',
    observacoes: ''
  });

  const [blockData, setBlockData] = useState({
    data: '',
    horaInicio: '',
    horaFim: ''
  });

  const defaultTimeSlots = useMemo(() => [
    '07:00', '07:50', '08:40', '09:30', '10:20', '11:10',
    '12:00', '13:00', '13:50', '14:40', '15:30', '16:20',
    '17:10', '18:00', '18:50'
  ], []);

  const monthNames = useMemo(() => [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ], []);

  const weekDays = useMemo(() => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], []);

  /* =========================================================
     BUSCA DADOS E FERIADOS
  ========================================================= */

  const carregarFeriados = useCallback(async (ano: number) => {
    try {
      const res = await api.get(`/feriados/${ano}`, { timeout: 4000 });
      setFeriados(Array.isArray(res.data) ? res.data : []);
    } catch {
      try {
        const fallback = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${ano}`, { timeout: 4000 });
        setFeriados(Array.isArray(fallback.data) ? fallback.data : []);
      } catch (err) {
        console.warn('Não foi possível carregar os feriados nacionais:', err);
      }
    }
  }, []);

  const periodoChave = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    let usuarioId = localStorage.getItem('@FisaSaude:usuarioId');
    if (!usuarioId || isNaN(Number(usuarioId))) {
      usuarioId = '1';
    }

    const [anoStr, mesStr] = periodoChave.split('-');
    const ano = Number(anoStr);
    const mes = Number(mesStr) + 1;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    try {
      const [resAgendamentos, resClientes] = await Promise.all([
        api.get('/agendamentos/usuario-periodo', {
          params: { usuarioId: Number(usuarioId), dataInicio, dataFim },
          timeout: 5000
        }).catch(() => ({ data: [] })),
        api.get('/clientes', { timeout: 5000 }).catch(() => ({ data: [] }))
      ]);

      const lista = Array.isArray(resAgendamentos.data)
        ? resAgendamentos.data
        : resAgendamentos.data?.content || [];
      setAgendamentos(lista);

      const listaClientes = Array.isArray(resClientes.data)
        ? resClientes.data
        : resClientes.data?.content || [];
      setClientes(listaClientes);

      void carregarFeriados(ano);
    } catch (err: any) {
      console.error('Erro ao buscar dados do período:', err);
      setErrorMessage(
        err.response?.data?.message || 'Não foi possível carregar a agenda do servidor.'
      );
    } finally {
      setLoading(false);
    }
  }, [periodoChave, carregarFeriados]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const getFeriadoDoDia = useCallback(
    (date: Date) => {
      const key = dateToKey(date);
      return feriados.find((f) => normalizeDate(f.date) === key);
    },
    [feriados]
  );

  const getBookingsForDate = useCallback(
    (date: Date) => {
      const targetKey = dateToKey(date);
      return agendamentos.filter((booking) => {
        const itemKey = normalizeDate(booking.data);
        return itemKey === targetKey && booking.status !== 'CANCELADO';
      });
    },
    [agendamentos]
  );

  const isSlotInInterval = (slot: string, inicio: string, fim: string) => {
    return slot >= inicio && slot <= fim;
  };

  const getSlotStatus = useCallback(
    (date: Date, timeSlot: string) => {
      const bookings = getBookingsForDate(date);

      const exact = bookings.find(
        (b) => normalizeTime(b.horaInicio) === timeSlot && b.status !== 'BLOQUEADO'
      );
      if (exact) return { type: 'booking' as const, data: exact };

      const blockedRange = bookings.find((b) => {
        if (b.status !== 'BLOQUEADO') return false;
        const ini = normalizeTime(b.horaInicio);
        const fim = normalizeTime(b.horaFim);
        return isSlotInInterval(timeSlot, ini, fim);
      });

      if (blockedRange) return { type: 'blocked' as const, data: blockedRange };

      return { type: 'free' as const, data: null };
    },
    [getBookingsForDate]
  );

  const selectedDaySlots = useMemo(() => {
    const slots = new Set(defaultTimeSlots);
    const bookings = getBookingsForDate(selectedDate);
    bookings.forEach((booking) => {
      const timeStr = normalizeTime(booking.horaInicio);
      if (timeStr) slots.add(timeStr);
    });
    return Array.from(slots).sort();
  }, [getBookingsForDate, selectedDate, defaultTimeSlots]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    while (days.length % 7 !== 0) days.push(null);

    return days;
  }, [currentDate]);

  const previousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      return;
    }
    setSelectedDate(addDays(selectedDate, -7));
  };

  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      return;
    }
    setSelectedDate(addDays(selectedDate, 7));
  };

  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const calendarTitle = useMemo(() => {
    if (view === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    const start = startOfWeek(selectedDate);
    const end = addDays(start, 6);
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} de ${monthNames[start.getMonth()]}`;
    }
    return `${start.getDate()} ${monthNames[start.getMonth()].substring(0, 3)} – ${end.getDate()} ${monthNames[end.getMonth()].substring(0, 3)}`;
  }, [view, currentDate, selectedDate, monthNames]);

  const abrirModalHorariosDoDia = (date: Date) => {
    setSelectedDate(date);
    setShowDayScheduleModal(true);
  };

  const abrirNovoAgendamento = (date?: Date, time?: string) => {
    const targetDate = date || selectedDate;
    setFormData({
      data: dateToKey(targetDate),
      horaInicio: time || '',
      horaFim: time ? calcularHoraFim(time) : '',
      observacoes: ''
    });
    setClienteInput('');
    setClienteSelecionado(null);
    setShowSuggestions(false);
    setShowNewBookingModal(true);
  };

  const handleCriarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();

    let clienteId = clienteSelecionado;
    if (!clienteId) {
      const match = clientes.find(
        (c) => c.nome.toLowerCase().trim() === clienteInput.toLowerCase().trim()
      );
      clienteId = match?.id || null;
    }

    if (!clienteId) {
      alert('Selecione um cliente válido.');
      return;
    }

    let usuarioId = localStorage.getItem('@FisaSaude:usuarioId');
    if (!usuarioId || isNaN(Number(usuarioId))) {
      usuarioId = '1';
    }

    try {
      await api.post('/agendamentos', {
        clienteId: Number(clienteId),
        servicoId: 1,
        usuarioId: Number(usuarioId),
        data: formData.data,
        horaInicio: `${formData.horaInicio.substring(0, 5)}:00`,
        horaFim: `${formData.horaFim.substring(0, 5)}:00`,
        observacoes: formData.observacoes || null
      });

      setShowNewBookingModal(false);
      await carregarDados();
      showSuccessMessage('Agendamento criado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar agendamento.');
    }
  };

  const handleBloquearPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    let usuarioId = localStorage.getItem('@FisaSaude:usuarioId');
    if (!usuarioId || isNaN(Number(usuarioId))) usuarioId = '1';

    if (blockData.horaInicio >= blockData.horaFim) {
      alert('O horário de término deve ser posterior ao de início.');
      return;
    }

    try {
      await api.post('/agendamentos/bloquear-periodo', {
        usuarioId: Number(usuarioId),
        data: blockData.data,
        horaInicio: `${blockData.horaInicio.substring(0, 5)}:00`,
        horaFim: `${blockData.horaFim.substring(0, 5)}:00`
      });

      setShowBlockModal(false);
      setBlockData({ data: '', horaInicio: '', horaFim: '' });
      await carregarDados();
      showSuccessMessage('Período bloqueado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao bloquear período.');
    }
  };

  const handleConcluir = async (id: number) => {
    try {
      await api.post(`/agendamentos/${id}/concluir`);
      setSelectedBooking(null);
      await carregarDados();
      showSuccessMessage('Agendamento concluído!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Não foi possível concluir o agendamento.');
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await api.post(`/agendamentos/${id}/cancelar`);
      setSelectedBooking(null);
      await carregarDados();
      showSuccessMessage('Agendamento cancelado!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Não foi possível cancelar o agendamento.');
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredClients = clienteInput.trim()
    ? clientes.filter((c) => c.nome.toLowerCase().includes(clienteInput.toLowerCase()))
    : [];

  const feriadoDoDiaSelecionado = getFeriadoDoDia(selectedDate);

  return (
    <div className="w-full h-full min-h-0 bg-[#F8F6F0] text-[#1B2E26] flex flex-col overflow-y-auto sm:overflow-hidden">
      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-[100] bg-[#009386] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold">
          <CheckCircle2 size={16} />
          {successMessage}
        </div>
      )}

      <div className="flex-1 min-h-0 p-3 sm:p-5 lg:p-6 flex flex-col">
        {/* Header Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4 flex-shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Agenda</h1>
            <p className="text-[11px] sm:text-xs text-[#56635C] mt-0.5">
              Gerencie seus horários e atendimentos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setBlockData({ data: dateToKey(selectedDate), horaInicio: '', horaFim: '' });
                setShowBlockModal(true);
              }}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-[#E3DEC9] rounded-xl text-[11px] sm:text-xs font-bold hover:bg-[#EBE5D3]/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Ban size={13} className="text-[#FF6954]" />
              Bloquear
            </button>

            <button
              type="button"
              onClick={() => abrirNovoAgendamento()}
              className="flex-1 sm:flex-none px-3.5 py-2 sm:px-5 sm:py-2.5 bg-[#009386] hover:bg-[#007491] text-white rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Plus size={15} />
              Novo
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-[#FF6954]/10 border border-[#FF6954]/30 text-[#D94F3C] text-[11px] font-medium flex items-center gap-2">
            <ShieldAlert size={15} className="flex-shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* Card Principal */}
        <div className="flex-1 min-h-[500px] sm:min-h-0 bg-white border border-[#E3DEC9] rounded-2xl shadow-xs flex flex-col overflow-hidden">
          {/* Barra de Período e Views */}
          <div className="p-2.5 sm:p-4 border-b border-[#E3DEC9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 flex-shrink-0">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="flex items-center border border-[#E3DEC9] rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={previousPeriod}
                  className="p-2 hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} className="text-[#56635C]" />
                </button>
                <button
                  type="button"
                  onClick={nextPeriod}
                  className="p-2 hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} className="text-[#56635C]" />
                </button>
              </div>

              <button
                type="button"
                onClick={goToday}
                className="px-2.5 py-1.5 rounded-xl bg-[#F8F6F0] hover:bg-[#EBE5D3] text-xs font-bold transition-colors cursor-pointer"
              >
                Hoje
              </button>

              <h2 className="text-xs sm:text-base font-bold truncate">{calendarTitle}</h2>
            </div>

            {/* Alternador Semana / Mês */}
            <div className="flex bg-[#F8F6F0] border border-[#E3DEC9] p-0.5 rounded-xl w-full sm:w-auto">
              {[
                { value: 'week' as ViewType, label: 'Semana' },
                { value: 'month' as ViewType, label: 'Mês' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setView(item.value)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${view === item.value
                      ? 'bg-[#009386] text-white shadow-xs'
                      : 'text-[#56635C] hover:text-[#1B2E26]'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className={`h-full ${loading ? 'pointer-events-none opacity-60' : ''}`}>
              {/* VISÃO DO MÊS */}
              {view === 'month' && (
                <div className="h-full flex flex-col">
                  {/* Cabeçalho dias da semana */}
                  <div className="grid grid-cols-7 border-b border-[#E3DEC9] bg-[#F8F6F0] flex-shrink-0">
                    {weekDays.map((day) => (
                      <div key={day} className="py-2 sm:py-3 text-center text-[9px] sm:text-xs font-bold uppercase text-[#56635C]">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Dias do mês */}
                  <div className="grid grid-cols-7 grid-rows-5 flex-1 min-h-0">
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="border-r border-b border-[#E3DEC9]/50 bg-[#F8F6F0]/30" />;
                      }

                      const bookings = getBookingsForDate(date);
                      const feriado = getFeriadoDoDia(date);
                      const isToday = dateToKey(date) === dateToKey(new Date());

                      return (
                        <button
                          type="button"
                          key={dateToKey(date)}
                          onClick={() => abrirModalHorariosDoDia(date)}
                          className={`relative border-r border-b border-[#E3DEC9]/50 p-1 sm:p-2.5 text-left flex flex-col hover:bg-[#F8F6F0] transition-all cursor-pointer ${feriado ? 'bg-[#FF6954]/5' : ''
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[11px] sm:text-xs font-bold ${isToday
                                  ? 'bg-[#EBE5D3] text-[#007491]'
                                  : 'text-[#1B2E26]'
                                }`}
                            >
                              {date.getDate()}
                            </span>

                            {/* Indicador mobile (dot) */}
                            {bookings.length > 0 && (
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#009386] rounded-full sm:hidden" />
                            )}
                          </div>

                          {feriado && (
                            <div className="mt-0.5">
                              <span className="text-[8px] sm:text-[9px] font-bold text-[#D94F3C] bg-[#FF6954]/15 px-1 py-0.2 rounded sm:truncate block leading-tight">
                                {feriado.name}
                              </span>
                            </div>
                          )}

                          {bookings.length > 0 && (
                            <div className="mt-auto hidden sm:block pt-1">
                              <div className="flex items-center gap-1">
                                <CalendarCheck size={11} className="text-[#009386]" />
                                <span className="text-[10px] font-bold text-[#009386] truncate">
                                  {bookings.length} {bookings.length === 1 ? 'horário' : 'horários'}
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VISÃO DA SEMANA */}
              {view === 'week' && (
                <div className="h-full flex flex-col overflow-x-auto">
                  <div className="min-w-[560px] sm:min-w-full flex-1 flex flex-col">
                    <div className="grid grid-cols-7 border-b border-[#E3DEC9] flex-shrink-0 bg-white">
                      {weekDates.map((date) => {
                        const bookings = getBookingsForDate(date);
                        const feriado = getFeriadoDoDia(date);
                        const isToday = dateToKey(date) === dateToKey(new Date());

                        return (
                          <button
                            type="button"
                            key={dateToKey(date)}
                            onClick={() => abrirModalHorariosDoDia(date)}
                            className="p-2 sm:p-3 border-r border-[#E3DEC9] text-center hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                          >
                            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#56635C]">
                              {weekDays[date.getDay()]}
                            </div>
                            <div
                              className={`mx-auto mt-0.5 sm:mt-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${isToday
                                  ? 'bg-[#EBE5D3] text-[#007491]'
                                  : 'text-[#1B2E26]'
                                }`}
                            >
                              {date.getDate()}
                            </div>
                            {feriado ? (
                              <div className="mt-0.5 text-[8px] font-bold text-[#D94F3C] truncate">
                                {feriado.name}
                              </div>
                            ) : (
                              bookings.length > 0 && (
                                <div className="mt-0.5 text-[8px] sm:text-[9px] font-bold text-[#009386]">
                                  {bookings.length} agend.
                                </div>
                              )
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      <div className="grid grid-cols-7" style={{ minHeight: defaultTimeSlots.length * 52 }}>
                        {weekDates.map((date) => {
                          return (
                            <div key={dateToKey(date)} className="border-r border-[#E3DEC9] p-1 space-y-1">
                              {defaultTimeSlots.map((time) => {
                                const slot = getSlotStatus(date, time);

                                return (
                                  <button
                                    type="button"
                                    key={`${dateToKey(date)}-${time}`}
                                    onClick={() => {
                                      if (slot.type === 'booking' && slot.data) {
                                        setSelectedBooking(slot.data);
                                      } else if (slot.type === 'blocked') {
                                        alert('Horário compreendido dentro de um período bloqueado.');
                                      } else {
                                        abrirNovoAgendamento(date, time);
                                      }
                                    }}
                                    className={`w-full min-h-[46px] rounded-lg p-1 text-left transition-all cursor-pointer ${slot.type === 'booking'
                                        ? 'bg-[#009386]/10 border border-[#009386]/20'
                                        : slot.type === 'blocked'
                                          ? 'bg-[#FF6954]/15 border border-[#FF6954]/30'
                                          : 'border border-transparent hover:bg-[#F8F6F0]'
                                      }`}
                                  >
                                    <div className="text-[8px] sm:text-[9px] font-bold text-[#56635C]">{time}</div>
                                    {slot.type === 'booking' && (
                                      <div className="mt-0.5">
                                        <span className="text-[8px] sm:text-[9px] font-bold text-[#1B2E26] truncate block">
                                          {slot.data?.nomeCliente || 'Atendimento'}
                                        </span>
                                      </div>
                                    )}
                                    {slot.type === 'blocked' && (
                                      <div className="mt-0.5 text-[8px] font-bold text-[#D94F3C] flex items-center gap-0.5">
                                        <Ban size={9} /> Bloq.
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL HORÁRIOS DO DIA (BOTTOM-SHEET NO MOBILE)
      ========================================================= */}
      {showDayScheduleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowDayScheduleModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col"
          >
            {/* Header Modal Dia */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DEC9] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#009386]/10 flex items-center justify-center text-[#009386]">
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold leading-tight">
                    {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
                  </h2>
                  {feriadoDoDiaSelecionado ? (
                    <span className="text-[10px] font-bold text-[#D94F3C] bg-[#FF6954]/15 px-1.5 py-0.5 rounded inline-block mt-0.5">
                      Feriado: {feriadoDoDiaSelecionado.name}
                    </span>
                  ) : (
                    <p className="text-[10px] text-[#56635C]">Horários disponíveis e agendamentos</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDayScheduleModal(false)}
                className="p-1.5 hover:bg-[#F8F6F0] rounded-xl text-[#56635C] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista dos Horários com scroll */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {selectedDaySlots.map((time) => {
                const slot = getSlotStatus(selectedDate, time);

                return (
                  <button
                    type="button"
                    key={time}
                    onClick={() => {
                      if (slot.type === 'booking' && slot.data) {
                        setSelectedBooking(slot.data);
                      } else if (slot.type === 'blocked') {
                        alert('Este horário está dentro de um período bloqueado.');
                      } else {
                        abrirNovoAgendamento(selectedDate, time);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${slot.type === 'booking'
                        ? 'bg-[#009386]/10 border-[#009386]/30'
                        : slot.type === 'blocked'
                          ? 'bg-[#FF6954]/10 border-[#FF6954]/25 opacity-80'
                          : 'bg-white border-[#E3DEC9] hover:bg-[#F8F6F0]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-xs font-bold text-[#56635C] flex items-center gap-1.5">
                        <Clock size={13} />
                        {time}
                      </div>

                      {slot.type === 'booking' && (
                        <div>
                          <div className="font-bold text-[#1B2E26] text-xs">
                            {slot.data?.nomeCliente || 'Atendimento'}
                          </div>
                          <span className="text-[10px] text-[#56635C]">
                            {slot.data?.preco ? `R$ ${slot.data.preco}` : 'Confirmado'}
                          </span>
                        </div>
                      )}

                      {slot.type === 'blocked' && (
                        <div>
                          <div className="font-bold text-[#D94F3C] text-xs flex items-center gap-1">
                            <Ban size={12} /> Bloqueado
                          </div>
                          <span className="text-[9px] text-[#56635C]">
                            {normalizeTime(slot.data?.horaInicio)} até {normalizeTime(slot.data?.horaFim)}
                          </span>
                        </div>
                      )}

                      {slot.type === 'free' && (
                        <div>
                          <span className="text-xs font-semibold text-[#56635C]">Horário livre</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {slot.type === 'booking' && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${slot.data?.status === 'CONFIRMADO'
                              ? 'bg-[#009386] text-white'
                              : slot.data?.status === 'AGENDADO'
                                ? 'bg-[#3CD099] text-[#0E2820]'
                                : 'bg-[#EBE5D3] text-[#1B2E26]'
                            }`}
                        >
                          {slot.data?.status}
                        </span>
                      )}

                      {slot.type === 'blocked' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#FF6954] text-white">
                          Bloq
                        </span>
                      )}

                      {slot.type === 'free' && (
                        <span className="p-1 rounded-lg bg-[#009386]/10 text-[#009386] flex items-center">
                          <Plus size={14} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E3DEC9]">
              <button
                type="button"
                onClick={() => setShowDayScheduleModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#EBE5D3]/70 hover:bg-[#EBE5D3] text-[#1B2E26] font-bold text-xs uppercase cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO AGENDAMENTO (BOTTOM-SHEET NO MOBILE) */}
      {showNewBookingModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowNewBookingModal(false)}
        >
          <form
            onSubmit={handleCriarAgendamento}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#E3DEC9] pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold">Novo Agendamento</h2>
                <p className="text-[11px] text-[#56635C]">Preencha os dados do atendimento</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewBookingModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#F8F6F0] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-3.5 relative">
              <label className="text-[11px] font-bold uppercase block mb-1">Cliente *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#56635C]" />
                <input
                  required
                  value={clienteInput}
                  onChange={(e) => {
                    setClienteInput(e.target.value);
                    setClienteSelecionado(null);
                    setShowSuggestions(true);
                  }}
                  placeholder="Nome do cliente"
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs outline-none focus:border-[#009386]"
                />
              </div>

              {showSuggestions && filteredClients.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E3DEC9] rounded-xl shadow-xl z-20 max-h-36 overflow-y-auto">
                  {filteredClients.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => {
                        setClienteInput(c.nome);
                        setClienteSelecionado(c.id);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#F8F6F0] text-xs font-medium cursor-pointer"
                    >
                      {c.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3.5">
              <label className="text-[11px] font-bold uppercase block mb-1">Data *</label>
              <input
                required
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs outline-none focus:border-[#009386]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase block mb-1">Início *</label>
                <input
                  required
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      horaInicio: e.target.value,
                      horaFim: calcularHoraFim(e.target.value)
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs outline-none focus:border-[#009386]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase block mb-1">Término *</label>
                <input
                  required
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs outline-none focus:border-[#009386]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase block mb-1">Observações</label>
              <textarea
                rows={2}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs outline-none focus:border-[#009386] resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewBookingModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#EBE5D3]/60 hover:bg-[#EBE5D3] font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#009386] hover:bg-[#007491] text-white font-bold text-xs cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DETALHES DO AGENDAMENTO (BOTTOM-SHEET NO MOBILE) */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{selectedBooking.nomeCliente || 'Compromisso'}</h2>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#009386] text-white">
                  {selectedBooking.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-[#F8F6F0] rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[#56635C]">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#009386]" />
                <span>
                  {normalizeTime(selectedBooking.horaInicio)} às {normalizeTime(selectedBooking.horaFim)}
                </span>
              </div>

              {selectedBooking.preco && (
                <div>
                  <strong className="text-[#1B2E26]">Valor:</strong> R$ {selectedBooking.preco}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5 pt-3 border-t border-[#E3DEC9]">
              {selectedBooking.status !== 'CONCLUIDO' && selectedBooking.status !== 'CANCELADO' && (
                <button
                  type="button"
                  onClick={() => handleConcluir(selectedBooking.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#009386] hover:bg-[#007491] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Concluir
                </button>
              )}
              {selectedBooking.status !== 'CANCELADO' && (
                <button
                  type="button"
                  onClick={() => handleCancelar(selectedBooking.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF6954] hover:bg-[#E8533E] text-white font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BLOQUEIO DE INTERVALO (BOTTOM-SHEET NO MOBILE) */}
      {showBlockModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowBlockModal(false)}
        >
          <form
            onSubmit={handleBloquearPeriodo}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Bloquear Intervalo</h2>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="p-1.5 hover:bg-[#F8F6F0] rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase block mb-1">Data *</label>
                <input
                  required
                  type="date"
                  value={blockData.data}
                  onChange={(e) => setBlockData({ ...blockData, data: e.target.value })}
                  className="w-full p-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase block mb-1">Hora Início *</label>
                  <input
                    required
                    type="time"
                    value={blockData.horaInicio}
                    onChange={(e) => setBlockData({ ...blockData, horaInicio: e.target.value })}
                    className="w-full p-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase block mb-1">Hora Término *</label>
                  <input
                    required
                    type="time"
                    value={blockData.horaFim}
                    onChange={(e) => setBlockData({ ...blockData, horaFim: e.target.value })}
                    className="w-full p-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#56635C]">
                Todos os horários nesse intervalo ficarão indisponíveis para agendamento.
              </p>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#EBE5D3] font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#FF6954] text-white font-bold text-xs cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}