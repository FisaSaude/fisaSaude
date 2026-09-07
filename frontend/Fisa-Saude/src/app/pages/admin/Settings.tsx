import { useState, useEffect } from 'react';
import { Building2, Save } from 'lucide-react';
import { api } from '../../services/api';

interface EstabelecimentoResponseDto {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: string;
}

export default function Settings() {
  const [estabelecimento, setEstabelecimento] = useState<EstabelecimentoResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function carregarConfig() {
      try {
        setLoading(true);
        const res = await api.get('/estabelecimentos');
        if (res.data && res.data.length > 0) {
          setEstabelecimento(res.data[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do estabelecimento:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarConfig();
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estabelecimento) return;
    try {
      setSaving(true);
      await api.put(`/estabelecimentos/${estabelecimento.id}`, estabelecimento);
      alert('Configurações salvas no Spring Boot com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-[#56635C]">Carregando configurações...</div>;
  }

  return (
    <div className="h-full lg:overflow-hidden bg-[#F8F6F0] text-[#1B2E26]">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1B2E26] mb-1">Configurações do Estúdio</h1>
            <p className="text-sm text-[#56635C]">Parâmetros cadastrais e operacionais do estúdio FISA Saúde</p>
          </div>

          <form onSubmit={handleSalvar} className="bg-white rounded-3xl p-6 shadow-sm border border-[#E3DEC9] space-y-4">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 bg-[#009386]/10 text-[#009386] rounded-xl flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#1B2E26]">Dados da Unidade</h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Nome do Estabelecimento</label>
              <input
                type="text"
                value={estabelecimento?.nome || ''}
                onChange={(e) => setEstabelecimento(prev => prev ? { ...prev, nome: e.target.value } : null)}
                className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">CNPJ</label>
                <input
                  type="text"
                  value={estabelecimento?.cnpj || ''}
                  onChange={(e) => setEstabelecimento(prev => prev ? { ...prev, cnpj: e.target.value } : null)}
                  className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Telefone Principal</label>
                <input
                  type="text"
                  value={estabelecimento?.telefone || ''}
                  onChange={(e) => setEstabelecimento(prev => prev ? { ...prev, telefone: e.target.value } : null)}
                  className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Endereço Completo</label>
              <input
                type="text"
                value={estabelecimento?.endereco || ''}
                onChange={(e) => setEstabelecimento(prev => prev ? { ...prev, endereco: e.target.value } : null)}
                className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl text-sm"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#009386] hover:bg-[#007491] text-white px-6 py-2.5 rounded-xl font-bold uppercase text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}