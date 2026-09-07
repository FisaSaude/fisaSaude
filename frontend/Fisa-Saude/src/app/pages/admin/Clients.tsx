import {
  Plus,
  Search,
  User,
  ArrowUpDown,
  ChevronRight,
  X
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import ClientProfile, { ClienteResponseDto, SexoEnum } from './ClientProfile';

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
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<ClienteResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClienteResponseDto | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    dataNascimento: '',
    sexo: 'F' as SexoEnum,
    fotoLink: ''
  });

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clientes');
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setClients(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length > 6) {
      val = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    } else if (val.length > 2) {
      val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    }
    setFormData({ ...formData, telefone: val });
  };

  const handleCriarCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    const nomeLimpo = formData.nome.trim();
    const telefoneNumeros = formData.telefone.replace(/\D/g, '');

    if (!nomeLimpo) {
      alert('Informe o nome do paciente.');
      return;
    }

    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
      alert('Informe um número de telefone com DDD válido.');
      return;
    }

    if (!formData.dataNascimento) {
      alert('Data de nascimento é obrigatória.');
      return;
    }

    const payload = {
      nome: nomeLimpo,
      telefone: telefoneNumeros,
      whatsappAtivo: true,
      dataNascimento: formData.dataNascimento,
      sexo: formData.sexo,
      fotoLink: formData.fotoLink.trim() ? formData.fotoLink.trim() : null
    };

    console.log('Payload enviado para o Spring Boot:', payload);

    try {
      await api.post('/clientes', payload);

      setShowNewClientModal(false);
      setFormData({
        nome: '',
        telefone: '',
        dataNascimento: '',
        sexo: 'F' as SexoEnum,
        fotoLink: ''
      });

      await carregarClientes();
      alert('Paciente cadastrado com sucesso!');
    } catch (err: any) {
      console.error('Detalhe do erro no Spring Boot:', err.response?.data || err);

      const res = err.response?.data;
      let mensagem = 'Erro ao cadastrar paciente.';

      if (res) {
        if (Array.isArray(res.errors) && res.errors.length > 0) {
          mensagem = res.errors.map((e: any) => e.defaultMessage || e.message || e).join(' | ');
        } else if (res.message) {
          mensagem = res.message;
        } else if (res.mensagem) {
          mensagem = res.mensagem;
        } else if (res.error) {
          mensagem = res.error;
        }
      }

      alert(`Falha no cadastro: ${mensagem}`);
    }
  };

  const filteredClients = useMemo(() => {
    return clients
      .filter((c) =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone?.includes(searchTerm)
      )
      .sort((a, b) => {
        return sortAsc
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome);
      });
  }, [clients, searchTerm, sortAsc]);

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="h-full flex flex-col bg-[#F8F6F0] text-[#1B2E26] overflow-hidden relative">
      {/* Top Header */}
      <div className="p-4 sm:p-6 lg:px-8 border-b border-[#E3DEC9] bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#009386]/10 border border-[#009386]/20 flex items-center justify-center text-[#009386]">
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1B2E26]">Lista de Pacientes</h1>
              <span className="bg-[#009386]/10 text-[#009386] border border-[#009386]/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {filteredClients.length} total
              </span>
            </div>
            <p className="text-xs text-[#56635C]">Gerenciamento e histórico de atendimentos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#56635C]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou WhatsApp..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386] transition-all"
            />
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2.5 bg-white border border-[#E3DEC9] hover:bg-[#F8F6F0] rounded-xl text-[#56635C] hover:text-[#1B2E26] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            title="Ordenar Alfabeticamente"
          >
            <ArrowUpDown size={15} />
            <span className="hidden sm:inline">{sortAsc ? 'A - Z' : 'Z - A'}</span>
          </button>

          <button
            onClick={() => setShowNewClientModal(true)}
            className="bg-[#009386] hover:bg-[#007491] text-white px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 font-bold text-xs cursor-pointer"
          >
            <Plus size={16} /> Novo Paciente
          </button>
        </div>
      </div>

      {/* Grid Principal + Drawer Lateral */}
      <div className="flex-1 flex overflow-hidden p-4 sm:p-6 lg:p-8 gap-6">
        <div className="flex-1 bg-white rounded-3xl border border-[#E3DEC9] shadow-xs flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3DEC9] bg-[#F8F6F0]/60 flex items-center justify-between">
            <div className="text-xs font-bold text-[#56635C] uppercase tracking-wider">
              {filteredClients.length} Registros Encontrados
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64 w-full">
                <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredClients.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#E3DEC9] text-[11px] font-extrabold uppercase text-[#56635C] tracking-wider text-left bg-white sticky top-0">
                    <th className="px-6 py-3.5">Nome do Paciente</th>
                    <th className="px-6 py-3.5">WhatsApp / Telefone</th>
                    <th className="px-6 py-3.5">Data Nasc.</th>
                    <th className="px-6 py-3.5">Gênero</th>
                    <th className="px-6 py-3.5">Status WhatsApp</th>
                    <th className="px-6 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DEC9]/60 text-xs">
                  {filteredClients.map((client) => {
                    const isSelected = selectedClient?.id === client.id;
                    return (
                      <tr
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`transition-colors cursor-pointer hover:bg-[#F8F6F0]/70 ${isSelected ? 'bg-[#009386]/5 border-l-4 border-l-[#009386]' : ''
                          }`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {client.fotoLink ? (
                              <img
                                src={client.fotoLink}
                                alt={client.nome}
                                className="w-9 h-9 rounded-full object-cover border border-[#009386]/20 shadow-xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#009386]/10 text-[#009386] font-bold flex items-center justify-center text-xs flex-shrink-0 border border-[#009386]/20 shadow-xs">
                                {client.nome?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="font-bold text-[#1B2E26] truncate max-w-[200px] sm:max-w-[240px]">
                              {client.nome}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-[#1B2E26]">
                          {client.telefone || 'Sem telefone'}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-[#56635C]">
                          {formatDateBR(client.dataNascimento) || '-'}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-[#56635C]">
                          {client.sexo === 'F' ? 'Feminino' : client.sexo === 'M' ? 'Masculino' : client.sexo || '-'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${client.whatsappAtivo !== false
                                ? 'bg-[#3CD099]/15 text-[#0E2820] border-[#3CD099]/30'
                                : 'bg-[#FF6954]/10 text-[#D94F3C] border-[#FF6954]/30'
                              }`}
                          >
                            {client.whatsappAtivo !== false ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(client);
                            }}
                            className="p-1.5 hover:bg-[#EBE5D3]/60 rounded-lg text-[#56635C] hover:text-[#009386] transition-colors cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-sm text-[#56635C]">
                Nenhum paciente cadastrado no momento.
              </div>
            )}
          </div>
        </div>

        {/* Modal / Drawer Lateral */}
        {selectedClient && (
          <ClientProfile
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </div>

      {/* Modal Cadastro de Paciente */}
      {showNewClientModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewClientModal(false)}
        >
          <form
            onSubmit={handleCriarCliente}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E3DEC9] shadow-2xl"
          >
            <div className="p-6 border-b border-[#E3DEC9] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#1B2E26]">Cadastrar Novo Paciente</h2>
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="p-2 hover:bg-[#F8F6F0] rounded-xl text-[#56635C] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1.5">Nome Completo *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do paciente"
                  className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl focus:bg-white focus:border-[#009386] focus:outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1.5">Telefone / WhatsApp (com DDD) *</label>
                <input
                  type="tel"
                  required
                  maxLength={15}
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl focus:bg-white focus:border-[#009386] focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1.5">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    max={hoje}
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl focus:bg-white focus:border-[#009386] focus:outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1.5">Gênero *</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value as SexoEnum })}
                    className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl focus:bg-white focus:border-[#009386] focus:outline-none text-sm font-medium"
                  >
                    <option value="F">Feminino</option>
                    <option value="M">Masculino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2E26] uppercase mb-1.5">Foto (Link opcional)</label>
                <input
                  type="url"
                  maxLength={255}
                  value={formData.fotoLink}
                  onChange={(e) => setFormData({ ...formData, fotoLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#E3DEC9] rounded-2xl focus:bg-white focus:border-[#009386] focus:outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#E3DEC9] flex gap-3">
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="flex-1 bg-[#EBE5D3]/60 hover:bg-[#EBE5D3] text-[#1B2E26] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#009386] hover:bg-[#007491] text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Salvar Paciente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}