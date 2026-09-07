import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  HeartHandshake,
  CheckCircle2,
  XCircle,
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
    year: 'numeric',
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
  if (limpo.length === 10) {
    return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 6)}-${limpo.substring(6)}`;
  }
  return tel;
};

const calcularIdade = (dataNasc: any): string => {
  const iso = normalizeDate(dataNasc);
  if (!iso || iso.length < 10) return '';
  const nasc = new Date(iso);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade >= 0 ? `(${idade} anos)` : '';
};

export default function ClientProfile({ client, onClose }: ClientProfileProps) {
  const [prontuarios, setProntuarios] = useState<ProntuarioItem[]>([]);
  const [novaObservacao, setNovaObservacao] = useState('');

  const storageKey = `prontuarios_cliente_${client.id}`;

  // Carrega observações salvas localmente para este paciente
  useEffect(() => {
    try {
      const salvos = localStorage.getItem(storageKey);
      if (salvos) {
        setProntuarios(JSON.parse(salvos));
      } else {
        setProntuarios([]);
      }
    } catch {
      setProntuarios([]);
    }
  }, [client.id, storageKey]);

  const handleSalvarObservacao = (e: React.FormEvent) => {
    e.preventDefault();
    const textoLimpo = novaObservacao.trim();
    if (!textoLimpo) return;

    const novoRegistro: ProntuarioItem = {
      id: String(Date.now()),
      observacoes: textoLimpo,
      criadoEm: new Date().toISOString()
    };

    const listaAtualizada = [novoRegistro, ...prontuarios];
    setProntuarios(listaAtualizada);
    localStorage.setItem(storageKey, JSON.stringify(listaAtualizada));
    setNovaObservacao('');
  };

  const sexoRotulo = {
    M: 'Masculino',
    F: 'Feminino',
    OUTRO: 'Outro'
  }[client.sexo] || client.sexo || '-';

  const telFormatado = formatTelefone(client.telefone);
  const telNumeros = client.telefone?.replace(/\D/g, '') || '';
  const idadeTexto = calcularIdade(client.dataNascimento);

  return (
    <div className="w-96 md:w-[450px] bg-white border border-[#E3DEC9] rounded-3xl flex flex-col h-full shadow-xl overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header do Drawer */}
      <div className="p-5 border-b border-[#E3DEC9] bg-[#F8F6F0]/60 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#009386]" />
          <h2 className="text-xs font-black uppercase text-[#1B2E26] tracking-wider">
            Ficha do Paciente #{client.id}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#EBE5D3]/60 rounded-xl text-[#56635C] hover:text-[#1B2E26] transition-colors cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Identificação Principal */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-[#E3DEC9]/60">
          {client.fotoLink ? (
            <img
              src={client.fotoLink}
              alt={client.nome}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#009386] shadow-sm mb-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#009386]/10 text-[#009386] border-2 border-[#009386]/30 flex items-center justify-center text-3xl font-black mb-3">
              {client.nome?.charAt(0).toUpperCase()}
            </div>
          )}

          <h3 className="text-lg font-black text-[#1B2E26] leading-tight">
            {client.nome}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border ${client.whatsappAtivo !== false
                  ? 'bg-[#3CD099]/15 text-[#0E2820] border-[#3CD099]/30'
                  : 'bg-[#FF6954]/10 text-[#D94F3C] border-[#FF6954]/30'
                }`}
            >
              {client.whatsappAtivo !== false ? (
                <>
                  <CheckCircle2 size={13} className="text-[#009386]" /> WhatsApp Ativo
                </>
              ) : (
                <>
                  <XCircle size={13} className="text-[#D94F3C]" /> WhatsApp Inativo
                </>
              )}
            </span>
          </div>
        </div>

        {/* Detalhes Cadastrais vindos da API */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-extrabold uppercase text-[#56635C] tracking-wider">
            Informações Cadastrais
          </h4>

          {/* Telefone / WhatsApp */}
          <div className="p-3.5 bg-[#F8F6F0]/70 rounded-2xl border border-[#E3DEC9]/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#009386]/10 text-[#009386] flex items-center justify-center">
                <Phone size={15} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#56635C]">WhatsApp</div>
                <div className="text-xs font-black text-[#1B2E26]">{telFormatado}</div>
              </div>
            </div>
            {telNumeros && (
              <a
                href={`https://wa.me/${telNumeros.startsWith('55') ? telNumeros : `55${telNumeros}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-[#009386]/10 hover:bg-[#009386] text-[#009386] hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Abrir no WhatsApp"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Data de Nascimento & Idade */}
          <div className="p-3.5 bg-[#F8F6F0]/70 rounded-2xl border border-[#E3DEC9]/70 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#009386]/10 text-[#009386] flex items-center justify-center">
              <Calendar size={15} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#56635C]">Data de Nascimento</div>
              <div className="text-xs font-black text-[#1B2E26]">
                {formatDateBR(client.dataNascimento)} <span className="font-semibold text-[#56635C]">{idadeTexto}</span>
              </div>
            </div>
          </div>

          {/* Gênero */}
          <div className="p-3.5 bg-[#F8F6F0]/70 rounded-2xl border border-[#E3DEC9]/70 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#009386]/10 text-[#009386] flex items-center justify-center">
              <HeartHandshake size={15} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#56635C]">Gênero</div>
              <div className="text-xs font-black text-[#1B2E26]">{sexoRotulo}</div>
            </div>
          </div>

          {/* Foto */}
          {client.fotoLink && (
            <div className="p-3.5 bg-[#F8F6F0]/70 rounded-2xl border border-[#E3DEC9]/70 flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#009386]/10 text-[#009386] flex items-center justify-center flex-shrink-0">
                <User size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold text-[#56635C]">Foto Cadastrada</div>
                <a
                  href={client.fotoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#009386] hover:underline truncate block"
                >
                  {client.fotoLink}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Campo para Nova Observação Clínica */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-extrabold uppercase text-[#56635C] tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-[#009386]" /> Nova Observação Clínica
          </h4>

          <form onSubmit={handleSalvarObservacao} className="space-y-2">
            <textarea
              rows={3}
              required
              value={novaObservacao}
              onChange={(e) => setNovaObservacao(e.target.value)}
              placeholder="Ex: Restrição lombar, dor em rotação, evolução de postura..."
              className="w-full p-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl text-xs font-medium text-[#1B2E26] focus:bg-white focus:outline-none focus:border-[#009386] transition-all resize-none"
            />
            <button
              type="submit"
              disabled={!novaObservacao.trim()}
              className="w-full bg-[#009386] hover:bg-[#007491] disabled:opacity-50 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Send size={13} /> Salvar no Prontuário
            </button>
          </form>
        </div>

        {/* Histórico de Anotações */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-extrabold uppercase text-[#56635C] tracking-wider">
              Histórico de Prontuários
            </h4>
            <span className="text-[10px] font-bold bg-[#009386]/10 text-[#009386] px-2 py-0.5 rounded-full">
              {prontuarios.length}
            </span>
          </div>

          {prontuarios.length > 0 ? (
            <div className="space-y-2.5">
              {prontuarios.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#56635C]">
                    <Clock size={12} className="text-[#009386]" />
                    <span>{formatDateTimeBR(item.criadoEm)}</span>
                  </div>
                  <p className="text-xs text-[#1B2E26] leading-relaxed whitespace-pre-wrap font-medium">
                    {item.observacoes}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#F8F6F0]/50 border border-dashed border-[#E3DEC9] rounded-2xl text-center text-xs text-[#56635C]">
              Nenhum registro clínico cadastrado para este paciente.
            </div>
          )}
        </div>
      </div>

      {/* Rodapé da Gaveta */}
      <div className="p-4 border-t border-[#E3DEC9] bg-[#F8F6F0]/40 flex gap-2 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full bg-[#EBE5D3]/70 hover:bg-[#EBE5D3] text-[#1B2E26] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}