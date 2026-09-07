import { useState, useEffect } from 'react';
import { Bell, Search, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';

interface NotificacaoResponseDto {
  id: number;
  mensagem: string;
  status: string;
  tipo: string;
  dataEnvio: string;
}

export default function Logs() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarNotificacoes() {
      try {
        setLoading(true);
        const res = await api.get('/notificacoes');
        setNotificacoes(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarNotificacoes();
  }, []);

  const filteredLogs = notificacoes.filter(n =>
    n.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full lg:overflow-hidden bg-[#F8F6F0] text-[#1B2E26]">
      <div className="h-full lg:overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#009386] rounded-2xl flex items-center justify-center text-white shadow-md">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2E26]">Auditoria & Disparos WhatsApp</h1>
              <p className="text-xs text-[#56635C]">Histórico de lembretes e mensagens do sistema</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#56635C]" size={18} />
            <input
              type="text"
              placeholder="Buscar mensagem ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3DEC9] rounded-xl text-sm font-medium"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E3DEC9] overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#56635C]">Carregando notificações...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#56635C]">Nenhum disparo registrado.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#F8F6F0] border-b border-[#E3DEC9]">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-[#56635C] uppercase">Data</th>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-[#56635C] uppercase">Tipo</th>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-[#56635C] uppercase">Mensagem</th>
                    <th className="text-right px-6 py-3.5 text-xs font-bold text-[#56635C] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DEC9]/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8F6F0]">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#1B2E26]">{log.dataEnvio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold uppercase text-[#007491]">{log.tipo}</td>
                      <td className="px-6 py-4 text-xs font-medium text-[#1B2E26] max-w-md truncate">{log.mensagem}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#009386]/10 text-[#009386] border border-[#009386]/20">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}