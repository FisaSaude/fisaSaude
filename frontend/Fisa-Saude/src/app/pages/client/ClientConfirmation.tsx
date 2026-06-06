import { ArrowLeft, Calendar, Clock, User, Phone as PhoneIcon, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormField } from '../../components/FormField';
import { useToast } from '../../hooks/useToast';

export default function ClientConfirmation() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });
  const toast = useToast();

  const validateForm = () => {
    const newErrors = { name: '', phone: '' };

    if (!name.trim()) {
      newErrors.name = 'Por favor, insira seu nome completo';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Por favor, insira seu WhatsApp';
    } else if (phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'WhatsApp inválido';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      toast.success('Agendamento confirmado!', 'Você receberá uma confirmação pelo WhatsApp');
      setTimeout(() => navigate('/agendar/sucesso'), 1000);
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
              onClick={() => navigate('/agendar/horario')}
              className="p-3 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-gray-900"
              aria-label="Voltar para seleção de horário"
            >
              <ArrowLeft className="text-gray-600" size={24} aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl text-gray-900 font-bold">Confirmar Agendamento</h1>
              <p className="text-sm text-gray-600">Passo 3 de 3</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-md mx-auto p-4 space-y-6">
        {/* Resumo do Agendamento */}
        <section className="bg-white rounded-2xl p-6 shadow-lg" aria-labelledby="booking-summary">
          <h2 id="booking-summary" className="text-lg text-gray-900 font-bold mb-4">Resumo do Agendamento</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Calendar className="text-emerald-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Data</div>
                <div className="text-gray-900 font-semibold">Quarta-feira, 2 de Abril</div>
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
          </div>
        </section>

        {/* Formulário de Dados */}
        <section className="bg-white rounded-2xl p-6 shadow-lg" aria-labelledby="user-data">
          <h2 id="user-data" className="text-lg text-gray-900 font-bold mb-4">Seus Dados</h2>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
            <FormField
              label="Nome Completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              error={errors.name}
              isRequired
            />

            <FormField
              label="WhatsApp"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              error={errors.phone}
              helperText="Você receberá a confirmação neste número"
              isRequired
            />

            {/* Confirmar Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 min-h-[52px] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-medium text-lg focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600"
              aria-label="Confirmar agendamento"
            >
              <span>Confirmar Agendamento</span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>
        </section>

        {/* Info */}
        <p className="text-center text-gray-600 text-sm leading-relaxed">
          Ao confirmar, você concorda com nossos termos de agendamento
        </p>
      </main>
    </div>
  );
}
