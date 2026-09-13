import {
  Plus,
  Search,
  User,
  ArrowUpDown,
  ChevronRight,
  X,
  Phone
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

    if (!nomeLimpo || telefoneNumeros.length < 10) {
      alert('Preencha os dados do paciente corretamente com DDD.');
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
      alert('Erro ao salvar paciente no sistema.');
    }
  };

  const filteredClients = useMemo(() => {
    return clients
      .filter((c) =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone?.includes(searchTerm)
      )
      .sort((a, b) => {
        return sortAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome);
      });
  }, [clients, searchTerm, sortAsc]);

  return (
    <div className="h-full flex flex-col bg-[#F8F6F0] text-[#1B2E26] overflow-hidden">
      {/* Top Header Mobile */}
      <div className="p-3.5 sm:p-5 border-b border-[#E3DEC9] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#009386]/10 text-[#009386] flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-bold text-[#1B2E26]">Pacientes</h1>
                <span className="bg-[#009386]/10 text-[#009386] text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {filteredClients.length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowNewClientModal(true)}
            className="sm:hidden bg-[#009386] active:scale-95 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus size={16} /> Novo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#56635C]" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou celular..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#009386]"
            />
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2 bg-white border border-[#E3DEC9] rounded-xl text-[#56635C] active:bg-[#F8F6F0] cursor-pointer"
            title="Ordenar"
          >
            <ArrowUpDown size={14} />
          </button>

          <button
            onClick={() => setShowNewClientModal(true)}
            className="hidden sm:flex bg-[#009386] hover:bg-[#007491] text-white px-3.5 py-2 rounded-xl text-xs font-bold items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={15} /> Novo Paciente
          </button>
        </div>
      </div>

      {/* Área Central com Lista */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-5 lg:p-6 gap-4">
        <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-[#E3DEC9] shadow-xs flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredClients.length > 0 ? (
              <>
                {/* Lista em Cartões para Telas Pequenas */}
                <div className="sm:hidden divide-y divide-[#E3DEC9]/60">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className="p-3.5 flex items-center justify-between gap-3 active:bg-[#F8F6F0] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#009386]/10 text-[#009386] font-black text-xs flex items-center justify-center flex-shrink-0">
                          {client.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1B2E26] truncate">{client.nome}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#56635C] mt-0.5">
                            <Phone size={10} />
                            <span>{client.telefone || 'Sem número'}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#56635C]" />
                    </div>
                  ))}
                </div>

                {/* Tabela para Desktop */}
                <table className="hidden sm:table w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3DEC9] text-[11px] font-extrabold uppercase text-[#56635C] text-left bg-white sticky top-0">
                      <th className="px-5 py-3">Paciente</th>
                      <th className="px-5 py-3">Telefone</th>
                      <th className="px-5 py-3">Nascimento</th>
                      <th className="px-5 py-3">Gênero</th>
                      <th className="px-5 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DEC9]/60 text-xs">
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="hover:bg-[#F8F6F0]/70 cursor-pointer"
                      >
                        <td className="px-5 py-3 font-bold text-[#1B2E26]">{client.nome}</td>
                        <td className="px-5 py-3 text-[#56635C] font-semibold">{client.telefone || '-'}</td>
                        <td className="px-5 py-3 text-[#56635C]">{formatDateBR(client.dataNascimento) || '-'}</td>
                        <td className="px-5 py-3 text-[#56635C]">{client.sexo === 'F' ? 'Feminino' : 'Masculino'}</td>
                        <td className="px-5 py-3 text-right">
                          <button className="p-1 hover:bg-[#EBE5D3]/60 rounded-lg text-[#56635C]">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="p-10 text-center text-xs text-[#56635C]">
                Nenhum paciente encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Modal/Drawer de Perfil */}
        {selectedClient && (
          <ClientProfile
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </div>

      {/* Modal Bottom-Sheet: Novo Paciente */}
      {showNewClientModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowNewClientModal(false)}
        >
          <form
            onSubmit={handleCriarCliente}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#E3DEC9] shadow-2xl p-5 sm:p-6 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-[#1B2E26]">Novo Paciente</h2>
              <button type="button" onClick={() => setShowNewClientModal(false)} className="p-1 text-[#56635C]">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">WhatsApp (com DDD) *</label>
              <input
                type="tel"
                required
                value={formData.telefone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Nascimento *</label>
                <input
                  type="date"
                  required
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">Gênero</label>
                <select
                  value={formData.sexo}
                  onChange={(e) => setFormData({ ...formData, sexo: e.target.value as SexoEnum })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#E3DEC9] rounded-xl text-xs font-medium"
                >
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="flex-1 bg-[#EBE5D3]/60 py-2.5 rounded-xl font-bold text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#009386] text-white py-2.5 rounded-xl font-bold text-xs uppercase shadow-sm"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}