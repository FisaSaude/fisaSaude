import { Plus, Search, MoreVertical, Phone, Mail, X, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Clients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [formStep, setFormStep] = useState<'simple' | 'complete'>('simple');

  const clients = [
    { id: 1, name: 'Ana Paula Silva', phone: '(11) 98888-1111', email: 'ana@email.com', plan: 'Mensal', status: 'active' },
    { id: 2, name: 'Carlos Eduardo', phone: '(11) 98888-2222', email: 'carlos@email.com', plan: 'Semestral', status: 'active' },
    { id: 3, name: 'Juliana Santos', phone: '(11) 98888-3333', email: 'juliana@email.com', plan: 'Mensal', status: 'active' },
    { id: 4, name: 'Roberto Lima', phone: '(11) 98888-4444', email: 'roberto@email.com', plan: 'Avulso', status: 'active' },
    { id: 5, name: 'Marina Costa', phone: '(11) 98888-5555', email: 'marina@email.com', plan: 'Semestral', status: 'inactive' },
  ];

  const filteredClients = searchTerm
    ? clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : clients;

  return (
    <div className="h-full lg:overflow-hidden">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Clientes</h1>
            <p className="text-gray-600">Gerencie sua base de clientes</p>
          </div>
          <button 
            onClick={() => setShowNewClientModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nome..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-2xl text-gray-900 mb-1">32</div>
          <div className="text-sm text-gray-600">Clientes Ativos</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-2xl text-gray-900 mb-1">5</div>
          <div className="text-sm text-gray-600">Novos este Mês</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-2xl text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600">Inativos</div>
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/clientes/${client.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600">{client.name[0]}</span>
                        </div>
                        <div className="text-gray-900">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{client.phone}</div>
                      <div className="text-xs text-gray-600">{client.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{client.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        text-xs px-3 py-1 rounded-full
                        ${client.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Tente buscar com outro termo' : 'Comece adicionando seu primeiro cliente'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowNewClientModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Novo Cliente
            </button>
          )}
        </div>
      )}

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl text-gray-900">
                {formStep === 'simple' ? 'Novo Cliente - Dados Básicos' : 'Novo Cliente - Dados Completos'}
              </h2>
              <button 
                onClick={() => {
                  setShowNewClientModal(false);
                  setFormStep('simple');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {formStep === 'simple' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <User className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Digite o nome completo"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      WhatsApp *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Phone className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      Você pode adicionar mais informações depois no perfil do cliente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Mail className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Plano
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors">
                      <option value="">Selecione um plano</option>
                      <option value="mensal">Mensal</option>
                      <option value="semestral">Semestral</option>
                      <option value="avulso">Avulso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Horário Fixo (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <select className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors">
                        <option value="">Dia da semana</option>
                        <option value="segunda">Segunda</option>
                        <option value="terca">Terça</option>
                        <option value="quarta">Quarta</option>
                        <option value="quinta">Quinta</option>
                        <option value="sexta">Sexta</option>
                      </select>
                      <select className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors">
                        <option value="">Horário</option>
                        <option value="08:00">08:00</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                      placeholder="Restrições, objetivos, observações médicas..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              {formStep === 'simple' ? (
                <>
                  <button 
                    onClick={() => {
                      setShowNewClientModal(false);
                      setFormStep('simple');
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => setFormStep('complete')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Cadastro Completo
                  </button>
                  <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors">
                    Salvar
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setFormStep('simple')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => {
                      setShowNewClientModal(false);
                      setFormStep('simple');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Criar Cliente
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
