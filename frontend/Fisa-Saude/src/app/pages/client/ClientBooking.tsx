import { ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function ClientBooking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100" role="banner">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white text-xl font-semibold">P</span>
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">Pilates Studio</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          {/* Welcome Badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-100 mb-6" role="status">
              <Sparkles size={16} aria-hidden="true" />
              <span>Agendamento Online</span>
            </div>
          </div>

          {/* Welcome Card */}
          <article className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30" aria-hidden="true">
              <Calendar className="text-white" size={40} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Bem-vinda!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Vamos agendar sua aula de Pilates. O processo é rápido e simples!
            </p>

            {/* Info Cards */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="text-emerald-600" size={24} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Duração</div>
                  <div className="text-lg font-semibold text-gray-900">50 minutos</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Calendar className="text-emerald-600" size={24} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Modalidade</div>
                  <div className="text-lg font-semibold text-gray-900">Aula Individual</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/agendar/horario')}
              className="group w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 min-h-[52px] rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-medium text-lg focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
              aria-label="Escolher horário para agendamento"
            >
              <span>Escolher Horário</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </article>

          {/* Helper Text */}
          <p className="text-center text-gray-600 text-sm leading-relaxed">
            <span aria-label="Seguro">🔒</span> Ambiente seguro • Confirmação instantânea
          </p>
        </div>
      </main>
    </div>
  );
}