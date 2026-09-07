import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, Plus, X } from 'lucide-react';
import { api } from '../../services/api';

interface DespesaResponseDto {
  id: number;
  descricao: string;
  valor: number;
  dataDespesa: string;
  observacao?: string;
}

export default function Financial() {
  const [despesas, setDespesas] = useState<DespesaResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataDespesa: '',
    estabelecimentoId: 1
  });

  const carregarDespesas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/despesas');
      setDespesas(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDespesas();
  }, []);

  const handleCriarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/despesas', {
        descricao: formData.descricao,
        valor: Number(formData.valor),
        dataDespesa: formData.dataDespesa,
        estabelecimentoId: formData.estabelecimentoId
      });
      setShowModal(false);
      setFormData({ descricao: '', valor: '', dataDespesa: '', estabelecimentoId: 1 });
      carregarDespesas();
    } catch (err) {
      alert('Erro ao registrar despesa no sistema.');
    }
  };

  const totalDespesas = despesas.reduce((acc, d) => acc + (d.valor || 0), 0);

  return (
    <div className="h-full lg:overflow-hidden bg-[#F8F6F0] text-[#1B2E26]">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1B2E26] mb-1">Controle Financeiro</h1>
              <p className="text-sm text-[#56635C]">Lançamento e controle de saídas operacionais da clínica</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#009386] hover:bg-[#007491] text-white px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 font-semibold text-sm cursor-pointer"
            >
              <Plus size={18} /> Nova Despesa
            </button>
          </div>

          {/* Card Total */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E3DEC9] max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#9E2A43]/10 text-[#9E2A43] rounded-xl flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#56635C] uppercase tracking-wider">Total de Despesas</span>
                <div className="text-2xl font-bold text-[#9E2A43]">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Despesas */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E3DEC9] overflow-hidden">
            <div className="p-4 border-b border-[#E3DEC9] bg-[#F8F6F0]">
              <h3 className="text-xs font-bold text-[#1B2E26] uppercase tracking-wider">Lançamentos de Despesas</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-xs text-[#56635C]">Carregando despesas...</div>
            ) : despesas.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#56635C]">Nenhuma despesa registrada.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#F8F6F0] border-b border-[#E3DEC9]">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-[#56635C] uppercase">Data</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-[#56635C] uppercase">Descrição</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-[#56635C] uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DEC9]/60">
                  {despesas.map((d) => (
                    <tr key={d.id} className="hover:bg-[#F8F6F0]">
                      <td className="px-6 py-4 text-xs font-medium text-[#1B2E26]">{d.dataDespesa}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#1B2E26]">{d.descricao}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#9E2A43] text-right">
                        - R$ {d.valor?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal Nova Despesa */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <form onSubmit={handleCriarDespesa} className="bg-white rounded-3xl max-w-md w-full border border-[#E3DEC9] shadow-2xl overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="text-lg font-bold text-[#1B2E26]">Lançar Despesa</h2>
                  <button type="button" onClick={() => setShowModal(false)} className="text-[#56635C]"><X size={18} /></button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Descrição *</label>
                  <input
                    type="text"
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.dataDespesa}
                    onChange={(e) => setFormData({ ...formData, dataDespesa: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-[#EBE5D3]/60 py-2.5 rounded-xl text-xs font-bold uppercase">Cancelar</button>
                  <button type="submit" className="flex-1 bg-[#FF6954] text-white py-2.5 rounded-xl text-xs font-bold uppercase shadow-sm">Salvar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}