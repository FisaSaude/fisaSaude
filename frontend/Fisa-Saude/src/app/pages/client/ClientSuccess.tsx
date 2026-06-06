import { CheckCircle, Calendar, Clock, MapPin, Phone, Home } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function ClientSuccess() {
  const navigate = useNavigate();

  const whatsappNumber = "5511999999999";
  const whatsappMessage = encodeURIComponent("Olá! Acabei de fazer um agendamento pelo site.");

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>

      <main id="main-content" className="max-w-md w-full">
        {/* Success Card */}
        <article className="bg-white rounded-3xl p-8 shadow-xl text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6" role="img" aria-label="Sucesso">
            <CheckCircle className="text-emerald-600" size={48} aria-hidden="true" />
          </div>

          <h1 className="text-3xl sm:text-4xl text-gray-900 font-bold mb-4">
            Agendamento Confirmado!
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Sua aula foi agendada com sucesso. Em breve você receberá uma confirmação no WhatsApp.
          </p>

          {/* Detalhes do Agendamento */}
          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Calendar className="text-emerald-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Data</div>
                <div className="text-gray-900 font-semibold">Quarta-feira, 2 de Abril de 2026</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Clock className="text-emerald-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Horário</div>
                <div className="text-gray-900 font-semibold">08:00 - 08:50</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <MapPin className="text-emerald-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Local</div>
                <div className="text-gray-900 font-semibold">Rua das Flores, 123 - Jardim Paulista</div>
              </div>
            </div>
          </div>

          {/* Observação */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6 text-left" role="note">
            <p className="text-sm text-yellow-900 font-medium leading-relaxed">
              <strong>Lembrete:</strong> Chegue com 5 minutos de antecedência e traga roupas confortáveis.
            </p>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 min-h-[52px] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-medium text-lg mb-4 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
            aria-label="Falar no WhatsApp sobre o agendamento"
          >
            <Phone size={20} aria-hidden="true" />
            <span>Falar no WhatsApp</span>
          </button>

          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 min-h-[52px] rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-medium text-lg focus:outline-2 focus:outline-offset-2 focus:outline-gray-900"
            aria-label="Voltar para página inicial"
          >
            <Home size={20} aria-hidden="true" />
            <span>Voltar ao Início</span>
          </button>
        </article>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-1">
            Dúvidas? Entre em contato pelo WhatsApp
          </p>
          <a href={`https://wa.me/${whatsappNumber}`} className="text-sm text-emerald-600 font-semibold hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600">
            (11) 99999-9999
          </a>
        </div>
      </main>
    </div>
  );
}
