import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Calendar,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  FileText,
  Clock,
  Send
} from 'lucide-react';

export type SexoEnum = 'M' | 'F' | 'OUTRO';

export interface ClienteResponseDto {
  id: number;
  nome: string;
  telefone: string;
  whatsappAtivo?: boolean;
  dataNascimento: string | number[];
  sexo: SexoEnum;
  fotoLink?: string | null;
}

export interface ProntuarioItem {
  id: string;
  observacoes: string;
  criadoEm: string;
}

interface ClientProfileProps {
  client: ClienteResponseDto;
  onClose: () => void;
}

const normalizeDate = (val: any): string => {
  if (!val) return '';
  if (Array.isArray(val)) {
    const y = String(val[0]);
    const m = String(val[1]).padStart(2, '0');
    const d = String(val[2]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val);
  return str.includes('T') ? str.split('T')[0] : str.substring(0, 10);
};

const formatDateBR = (val: any): string => {
  const iso = normalizeDate(val);
  if (!iso || iso.length < 10) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const formatDateTimeBR = (isoStr: string): string => {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return isoStr;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTelefone = (tel: string): string => {
  if (!tel) return 'Sem telefone';
  const limpo = tel.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 7)}-${limpo.substring(7)}`;
  }
  return tel;
};

export default function ClientProfile({ client, onClose }: ClientProfileProps) {
  const [prontuarios, setProntuarios] = useState<ProntuarioItem[]>([]);
  const [novaObservacao, setNovaObservacao] = useState('');

  const storageKey = `prontuarios_cliente_${client.id}`;

  useEffect(() => {
    try {
      const salvos = localStorage.getItem(storageKey);
      setProntuarios(salvos ? JSON.parse(salvos) : []);
    } catch {
      setProntuarios([]);
    }
  }, [client.id, storageKey]);

  const handleSalvarObservacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaObservacao.trim()) return;

    const novoRegistro: ProntuarioItem = {
      id: String(Date.now()),
      observacoes: novaObservacao.trim(),
      criadoEm: new Date().toISOString()
    };

    const atualizados = [novoRegistro, ...prontuarios];
    setProntuarios(atualizados);
    localStorage.setItem(storageKey, JSON.stringify(atualizados));
    setNovaObservacao('');
  };

  const telNumeros = client.telefone?.replace(/\D/g, '') || '';

  return (
    <div className="fixed sm:static inset-0 z-50 sm:z-auto bg-black/50 sm:bg-transparent flex items-end sm:items-stretch">
      <div className="w-full sm:w-80 md:w-96 bg-white sm:border border-[#E3DEC9] rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[85vh] sm:max-h-full h-full shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Header Drawer */}
        <div className="p-3.5 sm:p-4 border-b border-[#E3DEC9] bg-[#F8F6F0]/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#009386]" />
            <h2 className="text-xs font-bold uppercase text-[#1B2E26]">
              Ficha do Paciente #{client.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#56635C] active:bg-[#EBE5D3]/60 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col items-center text-center pb-3 border-b border-[#E3DEC9]/60">
            <div className="w-14 h-14 rounded-full bg-[#009386]/10 text-[#009386] font-black text-xl flex items-center justify-center mb-1.5 border border-[#009386]/20">
              {client.nome.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#1B2E26]">{client.nome}</h3>
            <span className="mt-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#3CD099]/15 text-[#0E2820] flex items-center gap-1">
              <CheckCircle2 size={11} className="text-[#009386]" /> WhatsApp Ativo
            </span>
          </div>

          {/* Dados do Paciente */}
          <div className="space-y-2">
            <div className="p-2.5 bg-[#F8F6F0] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[#009386]" />
                <span className="font-bold text-[#1B2E26]">{formatTelefone(client.telefone)}</span>
              </div>
              {telNumeros && (
                <a
                  href={`https://wa.me/${telNumeros.startsWith('55') ? telNumeros : `55${telNumeros}`}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-[#009386] bg-white rounded-md shadow-2xs"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="p-2.5 bg-[#F8F6F0] rounded-xl flex items-center gap-2 text-xs">
              <Calendar size={13} className="text-[#009386]" />
              <span className="text-[#56635C]">Nascimento:</span>
              <strong className="text-[#1B2E26]">{formatDateBR(client.dataNascimento)}</strong>
            </div>

            <div className="p-2.5 bg-[#F8F6F0] rounded-xl flex items-center gap-2 text-xs">
              <HeartHandshake size={13} className="text-[#009386]" />
              <span className="text-[#56635C]">Gênero:</span>
              <strong className="text-[#1B2E26]">{client.sexo === 'F' ? 'Feminino' : 'Masculino'}</strong>
            </div>
          </div>

          {/* Prontuário Rápido */}
          <div className="pt-2 space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-[#56635C] flex items-center gap-1">
              <FileText size={13} className="text-[#009386]" /> Adicionar Evolução
            </h4>
            <form onSubmit={handleSalvarObservacao} className="space-y-2">
              <textarea
                rows={2}
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Anotações sobre a sessão..."
                className="w-full p-2.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs resize-none"
              />
              <button
                type="submit"
                disabled={!novaObservacao.trim()}
                className="w-full py-2 bg-[#009386] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs disabled:opacity-50"
              >
                <Send size={12} /> Salvar no Prontuário
              </button>
            </form>

            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold uppercase text-[#56635C]">
                Histórico ({prontuarios.length})
              </div>
              {prontuarios.length > 0 ? (
                prontuarios.map((item) => (
                  <div key={item.id} className="p-2.5 bg-[#F8F6F0] rounded-xl border border-[#E3DEC9]/70 text-xs">
                    <div className="flex items-center gap-1 text-[9px] text-[#56635C] font-semibold mb-1">
                      <Clock size={10} className="text-[#009386]" />
                      <span>{formatDateTimeBR(item.criadoEm)}</span>
                    </div>
                    <p className="text-[#1B2E26] leading-snug">{item.observacoes}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-[#F8F6F0]/40 rounded-xl text-center text-[11px] text-[#56635C]">
                  Sem histórico registrado.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé Drawer */}
        <div className="p-3 border-t border-[#E3DEC9] bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#EBE5D3]/70 rounded-xl text-xs font-bold uppercase"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}