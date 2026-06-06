import { ArrowLeft, ArrowRight, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function ClientSelectTime() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('2026-04-02');
  const [selectedTime, setSelectedTime] = useState('');

  // Mock de horários disponíveis
  const availableSlots = [
    { time: '08:00', available: true },
    { time: '09:00', available: true },
    { time: '10:00', available: false },
    { time: '11:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: false },
    { time: '17:00', available: true },
    { time: '18:00', available: true },
  ];

  const handleContinue = () => {
    if (selectedTime) {
      navigate('/agendar/confirmacao');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm" role="banner">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/agendar')}
              className="p-3 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-gray-900"
              aria-label="Voltar para página anterior"
            >
              <ArrowLeft className="text-gray-600" size={24} aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl text-gray-900 font-bold">Escolher Horário</h1>
              <p className="text-sm text-gray-600">Selecione data e horário</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-md mx-auto p-4 space-y-6">
        {/* Date Selector */}
        <section className="bg-white rounded-2xl p-6 shadow-lg" aria-labelledby="date-selector-heading">
          <div className="flex items-center justify-between mb-6">
            <button
              className="p-3 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="text-gray-600" size={20} aria-hidden="true" />
            </button>
            <div className="text-center" id="date-selector-heading">
              <div className="text-sm text-gray-600 font-medium">Abril 2026</div>
              <div className="text-lg text-gray-900 font-semibold">Quarta-feira, 2</div>
            </div>
            <button
              className="p-3 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
              aria-label="Próximo mês"
            >
              <ChevronRight className="text-gray-600" size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Week Days */}
          <div role="grid" aria-label="Calendário de seleção de data" className="grid grid-cols-7 gap-2">
            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, index) => (
              <div key={index} role="columnheader" className="text-center text-sm text-gray-600 font-medium">
                {day[0]}
              </div>
            ))}
            {[30, 31, 1, 2, 3, 4, 5].map((day, index) => (
              <button
                key={index}
                role="gridcell"
                onClick={() => setSelectedDate(`2026-04-${day.toString().padStart(2, '0')}`)}
                aria-pressed={day === 2}
                aria-label={`Dia ${day}${day < 30 ? ' (mês anterior)' : ''}`}
                className={`
                  aspect-square min-h-[44px] rounded-lg flex items-center justify-center text-sm font-medium transition-all
                  ${day === 2
                    ? 'bg-emerald-600 text-white shadow-lg scale-105'
                    : day < 30
                    ? 'text-gray-300 cursor-default'
                    : 'hover:bg-emerald-50 text-gray-900 hover:scale-105 active:scale-95 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600'
                  }
                `}
                disabled={day < 30}
              >
                {day}
              </button>
            ))}
          </div>
        </section>

        {/* Available Slots */}
        <section className="bg-white rounded-2xl p-6 shadow-lg" aria-labelledby="available-slots-heading">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-emerald-600" size={20} aria-hidden="true" />
            <h2 id="available-slots-heading" className="text-lg text-gray-900 font-bold">Horários Disponíveis</h2>
          </div>

          <div className="space-y-3" role="radiogroup" aria-labelledby="available-slots-heading">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                role="radio"
                aria-checked={selectedTime === slot.time}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                aria-label={`Horário ${slot.time} - ${slot.available ? 'Disponível' : 'Indisponível'}`}
                className={`
                  w-full p-4 min-h-[72px] rounded-lg border-2 transition-all text-left
                  ${!slot.available
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                    : selectedTime === slot.time
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md scale-105'
                    : 'border-gray-200 hover:border-emerald-300 text-gray-900 hover:shadow-sm hover:scale-102 active:scale-95 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${!slot.available 
                        ? 'bg-gray-200' 
                        : selectedTime === slot.time
                        ? 'bg-emerald-600'
                        : 'bg-emerald-100'
                      }
                    `}>
                      <span className={`
                        text-sm
                        ${!slot.available 
                          ? 'text-gray-400' 
                          : selectedTime === slot.time
                          ? 'text-white'
                          : 'text-emerald-600'
                        }
                      `}>
                        {slot.time}
                      </span>
                    </div>
                    <div>
                      <div className={slot.available ? 'text-gray-900' : 'text-gray-400'}>
                        {slot.time}
                      </div>
                      <div className="text-xs text-gray-500">
                        {slot.available ? '50 minutos' : 'Indisponível'}
                      </div>
                    </div>
                  </div>
                  {selectedTime === slot.time && (
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center" aria-hidden="true">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedTime}
          aria-disabled={!selectedTime}
          className={`
            w-full px-8 py-4 min-h-[52px] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 font-medium text-lg
            ${selectedTime
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }
          `}
          aria-label={selectedTime ? `Continuar com horário ${selectedTime}` : 'Selecione um horário para continuar'}
        >
          <span>Continuar</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </main>
    </div>
  );
}
