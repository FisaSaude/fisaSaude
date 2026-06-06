import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, X } from 'lucide-react';
import { useState } from 'react';

export default function Financial() {
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');

  const stats = [
    { label: 'Receita do Mês', value: 'R$ 12.800', change: '+15%', color: 'green' },
    { label: 'Despesas do Mês', value: 'R$ 3.200', change: '+5%', color: 'red' },
    { label: 'Lucro Líquido', value: 'R$ 9.600', change: '+20%', color: 'blue' },
    { label: 'Previsão Próx. Mês', value: 'R$ 14.000', change: '+9%', color: 'purple' },
  ];

  const transactions = [
    { date: '02/04/2026', description: 'Mensalidade - Ana Paula Silva', amount: 'R$ 400', type: 'income' },
    { date: '01/04/2026', description: 'Aluguel do Estúdio', amount: 'R$ 2.000', type: 'expense' },
    { date: '01/04/2026', description: 'Mensalidade - Carlos Eduardo', amount: 'R$ 400', type: 'income' },
    { date: '30/03/2026', description: 'Manutenção de Equipamentos', amount: 'R$ 500', type: 'expense' },
    { date: '30/03/2026', description: 'Aula Avulsa - Roberto Lima', amount: 'R$ 80', type: 'income' },
  ];

  return (
    <div className="h-full lg:overflow-hidden">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Financeiro</h1>
            <p className="text-gray-600">Controle suas finanças e receitas</p>
          </div>
          <button 
            onClick={() => setShowNewEntryModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Nova Movimentação
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                {stat.color === 'red' ? (
                  <TrendingDown className="text-red-600" size={24} />
                ) : (
                  <TrendingUp className={`text-${stat.color}-600`} size={24} />
                )}
              </div>
            </div>
            <div className="text-2xl text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
            <div className={`text-xs text-${stat.color}-600`}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Calendar className="text-gray-600" size={20} />
          </button>
          <div className="text-center">
            <div className="text-lg text-gray-900">Abril 2026</div>
            <div className="text-sm text-gray-600">Movimentações do mês</div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
              Entradas
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
              Saídas
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg text-gray-900">Movimentações</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.map((transaction, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}
                  `}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="text-green-600" size={20} />
                    ) : (
                      <TrendingDown className="text-red-600" size={20} />
                    )}
                  </div>
                  <div>
                    <div className="text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-600">{transaction.date}</div>
                  </div>
                </div>
                <div className={`text-lg ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} {transaction.amount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl text-gray-900">Nova Movimentação</h2>
              <button 
                onClick={() => setShowNewEntryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setEntryType('income')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      entryType === 'income'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingUp className="mx-auto mb-2" size={24} />
                    <div className="text-sm">Entrada</div>
                  </button>
                  <button
                    onClick={() => setEntryType('expense')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      entryType === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingDown className="mx-auto mb-2" size={24} />
                    <div className="text-sm">Saída</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Mensalidade, Aluguel, Equipamentos..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
                  <input
                    type="text"
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Método de Pagamento</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors">
                  <option value="">Selecione</option>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowNewEntryModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}