import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  UserX,
  Shield,
  Plus,
  Search,
  Mail,
  X,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';

export type RoleEnum = 'ADMIN' | 'USUARIO';

export interface UsuarioResponseDto {
  id: number;
  nome: string;
  email: string;
  role: RoleEnum;
  ativo: boolean;
  estabelecimentoId?: number;
}

export default function TeamManagement() {
  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'USUARIO' as RoleEnum,
    estabelecimentoId: 1
  });

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.get('/usuarios');
      const lista = Array.isArray(res.data) ? res.data : res.data?.content || [];

      setUsuarios(lista);
    } catch (err) {
      setErrorMessage('Não foi possível carregar a lista de funcionários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeLimpo = formData.nome.trim();
    const emailLimpo = formData.email.trim();

    if (!nomeLimpo || !emailLimpo || !formData.senha) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await api.post('/usuarios', {
        nome: nomeLimpo,
        email: emailLimpo,
        senha: formData.senha,
        role: formData.role,
        ativo: true,
        estabelecimentoId: Number(formData.estabelecimentoId) || 1
      });

      setShowModal(false);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        role: 'USUARIO',
        estabelecimentoId: 1
      });

      await carregarUsuarios();
      showSuccess('Funcionário cadastrado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cadastrar funcionário.');
    }
  };

  const handleToggleAtivo = async (user: UsuarioResponseDto) => {
    const novoStatus = !user.ativo;
    try {
      await api.put(`/usuarios/${user.id}`, {
        ...user,
        ativo: novoStatus
      });

      setUsuarios((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ativo: novoStatus } : u))
      );
      showSuccess(`Status de ${user.nome} atualizado!`);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || `Não foi possível atualizar o status de ${user.nome}.`);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredUsers = useMemo(() => {
    return usuarios.filter(
      (u) =>
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usuarios, searchTerm]);

  return (
    <div className="h-full bg-[#F8F6F0] dark:bg-background text-[#1B2E26] dark:text-foreground flex flex-col overflow-hidden">
      {successMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-[100] bg-[#009386] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs font-semibold">
          <CheckCircle2 size={16} />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-[#E3DEC9] dark:border-border bg-white dark:bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#1B2E26] dark:text-foreground">Equipe & Funcionários</h1>
            <span className="bg-[#009386]/10 text-[#009386] dark:text-[#3CD099] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {usuarios.length} cadastrados
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#56635C] dark:text-muted-foreground mt-0.5">
            Gerenciamento de acessos, instrutores e permissões da unidade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#56635C] dark:text-muted-foreground" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-8 pr-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#009386] hover:bg-[#007491] active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform"
          >
            <Plus size={15} /> Novo
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-3 sm:p-5 lg:p-6 overflow-hidden flex flex-col">
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-[#FF6954]/10 border border-[#FF6954]/30 text-[#D94F3C] dark:text-[#FF8FA3] text-[11px] font-medium flex items-center gap-2 flex-shrink-0">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex-1 bg-white dark:bg-card rounded-2xl sm:rounded-3xl border border-[#E3DEC9] dark:border-border shadow-xs flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <>
                {/* Visualização Mobile em Cards */}
                <div className="sm:hidden divide-y divide-[#E3DEC9]/60 dark:divide-border/60">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              user.role === 'ADMIN'
                                ? 'bg-[#007491]/10 text-[#007491] dark:text-[#3CD099]'
                                : 'bg-[#EBE5D3] dark:bg-muted text-[#1B2E26] dark:text-foreground'
                            }`}
                          >
                            <Shield size={10} />
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#1B2E26] dark:text-foreground truncate">{user.nome}</p>
                        <p className="text-[10px] text-[#56635C] dark:text-muted-foreground truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => handleToggleAtivo(user)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          user.ativo
                            ? 'bg-[#3CD099]/15 text-[#0E2820] dark:text-foreground border border-[#3CD099]/30'
                            : 'bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3] border border-[#FF6954]/30'
                        }`}
                      >
                        {user.ativo ? <UserCheck size={13} /> : <UserX size={13} />}
                        <span>{user.ativo ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tabela Desktop */}
                <table className="hidden sm:table w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3DEC9] dark:border-border text-[11px] font-extrabold uppercase text-[#56635C] dark:text-muted-foreground text-left bg-white dark:bg-card sticky top-0">
                      <th className="px-5 py-3">Funcionário</th>
                      <th className="px-5 py-3">E-mail</th>
                      <th className="px-5 py-3">Perfil / Cargo</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DEC9]/60 dark:divide-border/60 text-xs">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#F8F6F0]/60 dark:hover:bg-muted/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#009386]/10 text-[#009386] dark:text-[#3CD099] font-bold flex items-center justify-center text-xs">
                              {user.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#1B2E26] dark:text-foreground">{user.nome}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#56635C] dark:text-muted-foreground">{user.email}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${
                              user.role === 'ADMIN'
                                ? 'bg-[#007491]/10 text-[#007491] dark:text-[#3CD099]'
                                : 'bg-[#EBE5D3] dark:bg-muted text-[#1B2E26] dark:text-foreground'
                            }`}
                          >
                            <Shield size={11} />
                            {user.role === 'ADMIN' ? 'Administrador' : 'Instrutor / Usuário'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              user.ativo
                                ? 'bg-[#3CD099]/15 text-[#0E2820] dark:text-foreground'
                                : 'bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3]'
                            }`}
                          >
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleAtivo(user)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              user.ativo
                                ? 'bg-[#FF6954]/10 hover:bg-[#FF6954]/20 text-[#D94F3C] dark:text-[#FF8FA3]'
                                : 'bg-[#3CD099]/15 hover:bg-[#3CD099]/25 text-[#0E2820] dark:text-foreground'
                            }`}
                          >
                            {user.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="p-10 text-center text-xs text-[#56635C] dark:text-muted-foreground">
                Nenhum funcionário encontrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Bottom-Sheet: Novo Funcionário */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={handleCriarUsuario}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-card rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#E3DEC9] dark:border-border shadow-2xl p-5 sm:p-6 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-[#1B2E26] dark:text-foreground">Cadastrar Funcionário</h2>
                <p className="text-[11px] text-[#56635C] dark:text-muted-foreground">Crie um novo acesso para o estúdio</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-[#56635C] dark:text-muted-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Ex: Dra. Mariana Costa"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1 flex items-center gap-1">
                <Mail size={12} className="text-[#56635C] dark:text-muted-foreground" /> E-mail de Acesso *
              </label>
              <input
                type="email"
                required
                maxLength={100}
                placeholder="profissional@fisasaude.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1 flex items-center gap-1">
                <Lock size={12} className="text-[#56635C] dark:text-muted-foreground" /> Senha Provisória *
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">Perfil de Acesso *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleEnum })}
                className="w-full px-3 py-2 bg-[#F8F6F0] dark:bg-background border border-[#E3DEC9] dark:border-border rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-card focus:outline-none focus:border-[#009386]"
              >
                <option value="USUARIO">Instrutor / Fisioterapeuta (Padrão)</option>
                <option value="ADMIN">Administrador (Acesso Total)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-[#EBE5D3]/60 dark:bg-muted/60 hover:bg-[#EBE5D3] dark:hover:bg-muted py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#009386] hover:bg-[#007491] text-white py-2.5 rounded-xl font-bold text-xs uppercase shadow-sm cursor-pointer"
              >
                Salvar Funcionário
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
