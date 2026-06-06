import { ArrowLeft, Phone, Mail, Calendar, Clock, Edit, DollarSign } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

export default function ClientProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const client = {
    name: 'Ana Paula Silva',
    email: 'ana@email.com',
    phone: '(11) 98888-1111',
    birthDate: '15/03/1985',
    plan: 'Mensal',
    fixedSchedule: 'Segunda e Quarta, 08:00',
    status: 'active',
    notes: 'Restrição lombar. Evitar exercícios de impacto.',
  };

  const appointments = [
    { date: '02/04/2026', time: '08:00', status: 'upcoming' },
    { date: '30/03/2026', time: '08:00', status: 'completed' },
    { date: '28/03/2026', time: '08:00', status: 'completed' },
    { date: '25/03/2026', time: '08:00', status: 'completed' },
  ];

  const replacements = [
    { originalDate: '20/03/2026', newDate: '22/03/2026', reason: 'Viagem' },
  ];

  const payments = [
    { date: '01/04/2026', amount: 'R$ 400,00', method: 'PIX', status: 'paid' },
    { date: '01/03/2026', amount: 'R$ 400,00', method: 'Cartão', status: 'paid' },
  ];

  return (
    <div className="h-full lg:overflow-hidden">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/clientes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Voltar para Clientes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-4">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 text-3xl">{client.name[0]}</span>
              </div>
              <h2 className="text-2xl text-gray-900 mb-1">{client.name}</h2>
              <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                Cliente Ativo
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <div className="text-xs text-gray-600">Telefone</div>
                  <div className="text-sm text-gray-900">{client.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <div className="text-xs text-gray-600">Email</div>
                  <div className="text-sm text-gray-900">{client.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <div className="text-xs text-gray-600">Data de Nascimento</div>
                  <div className="text-sm text-gray-900">{client.birthDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="text-gray-400" size={20} />
                <div>
                  <div className="text-xs text-gray-600">Plano</div>
                  <div className="text-sm text-gray-900">{client.plan}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-gray-400" size={20} />
                <div>
                  <div className="text-xs text-gray-600">Horário Fixo</div>
                  <div className="text-sm text-gray-900">{client.fixedSchedule}</div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Edit size={18} />
              Editar Cliente
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Observações</h3>
            <p className="text-gray-700">{client.notes}</p>
          </div>

          {/* Appointments History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Histórico de Atendimentos</h3>
            <div className="space-y-3">
              {appointments.map((apt, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${apt.status === 'upcoming' ? 'bg-blue-100' : 'bg-green-100'}
                    `}>
                      <Calendar className={apt.status === 'upcoming' ? 'text-blue-600' : 'text-green-600'} size={20} />
                    </div>
                    <div>
                      <div className="text-gray-900">{apt.date}</div>
                      <div className="text-sm text-gray-600">{apt.time} - 50 min</div>
                    </div>
                  </div>
                  <span className={`
                    text-xs px-3 py-1 rounded-full
                    ${apt.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                    }
                  `}>
                    {apt.status === 'upcoming' ? 'Agendada' : 'Concluída'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Replacements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Histórico de Reposições</h3>
            {replacements.length > 0 ? (
              <div className="space-y-3">
                {replacements.map((rep, index) => (
                  <div key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                    <div className="text-sm text-gray-900">
                      <strong>Original:</strong> {rep.originalDate} → <strong>Reposto:</strong> {rep.newDate}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Motivo: {rep.reason}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Nenhuma reposição registrada.</p>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Histórico de Pagamentos</h3>
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-gray-900">{payment.amount}</div>
                      <div className="text-sm text-gray-600">{payment.date} • {payment.method}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Pago
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
