import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  LogIn,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

interface ProfileData {
  id: number;
  nome: string;
  email: string;
  role?: string;
  ativo?: boolean;
  estabelecimentoId?: number;
  estabelecimentoNome?: string;
}

interface ProfileForm {
  nome: string;
  email: string;
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

const FORM_INICIAL: ProfileForm = {
  nome: '',
  email: '',
  senhaAtual: '',
  novaSenha: '',
  confirmarNovaSenha: '',
};

const roleLabel = (role?: string) => {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'USUARIO') return 'Instrutor / Profissional';
  return role || '-';
};

const limparSessao = () => {
  localStorage.removeItem('@FisaSaude:token');
  localStorage.removeItem('@FisaSaude:usuarioId');
  localStorage.removeItem('@FisaSaude:usuario');
  localStorage.removeItem('@FisaSaude:userEmail');
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileForm>(FORM_INICIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sessionMissing, setSessionMissing] = useState(false);

  const aplicarPerfil = (dados: ProfileData) => {
    setProfile(dados);
    setForm({
      nome: dados.nome || '',
      email: dados.email || '',
      senhaAtual: '',
      novaSenha: '',
      confirmarNovaSenha: '',
    });
  };

  useEffect(() => {
    let ativo = true;

    async function loadProfile() {
      try {
        const savedUser = localStorage.getItem('@FisaSaude:usuario');
        const id = Number(localStorage.getItem('@FisaSaude:usuarioId'));
        const email = localStorage.getItem('@FisaSaude:userEmail') || '';

        if (!savedUser || !id) {
          if (ativo) setSessionMissing(true);
          return;
        }

        try {
          const response = await api.get('/perfil');
          if (!ativo) return;
          aplicarPerfil(response.data);
          setNotice('');
        } catch (error: any) {
          if (!ativo) return;

          const user = JSON.parse(savedUser);
          aplicarPerfil({
            id,
            nome: user.nome || '',
            email,
            role: user.role,
            estabelecimentoId: user.estabelecimentoId,
            estabelecimentoNome: user.estabelecimentoNome,
          });

          setNotice(
            error.response?.data?.message ||
              'Não foi possível atualizar os dados pela API. Exibindo as informações da sessão.'
          );
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (ativo) setNotice('Não foi possível ler os dados da sessão.');
      } finally {
        if (ativo) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      ativo = false;
    };
  }, []);

  const iniciarEdicao = () => {
    if (!profile) return;
    setForm({
      nome: profile.nome || '',
      email: profile.email || '',
      senhaAtual: '',
      novaSenha: '',
      confirmarNovaSenha: '',
    });
    setEditing(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const cancelarEdicao = () => {
    setEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSalvar = async (event: FormEvent) => {
    event.preventDefault();

    const nome = form.nome.trim();
    const email = form.email.trim();

    if (!nome || !email) {
      setErrorMessage('Informe nome e e-mail.');
      return;
    }

    const querTrocarSenha =
      Boolean(form.senhaAtual) || Boolean(form.novaSenha) || Boolean(form.confirmarNovaSenha);

    if (querTrocarSenha) {
      if (!form.senhaAtual) {
        setErrorMessage('Informe a senha atual para trocar a senha.');
        return;
      }
      if (!form.novaSenha) {
        setErrorMessage('Informe a nova senha.');
        return;
      }
      if (form.novaSenha.length < 8) {
        setErrorMessage('A nova senha deve ter no mínimo 8 caracteres.');
        return;
      }
      if (form.novaSenha !== form.confirmarNovaSenha) {
        setErrorMessage('A confirmação da nova senha não confere.');
        return;
      }
    }

    const emailAnterior = profile?.email || '';

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await api.put('/perfil', {
        nome,
        email,
        senhaAtual: querTrocarSenha ? form.senhaAtual : null,
        novaSenha: querTrocarSenha ? form.novaSenha : null,
      });

      const dadosAtualizados: ProfileData = response.data;
      aplicarPerfil(dadosAtualizados);
      setEditing(false);

      const usuarioSalvo = JSON.parse(localStorage.getItem('@FisaSaude:usuario') || '{}');
      localStorage.setItem(
        '@FisaSaude:usuario',
        JSON.stringify({
          ...usuarioSalvo,
          nome: dadosAtualizados.nome,
          role: dadosAtualizados.role,
          estabelecimentoId: dadosAtualizados.estabelecimentoId,
          estabelecimentoNome: dadosAtualizados.estabelecimentoNome,
        })
      );
      localStorage.setItem('@FisaSaude:userEmail', dadosAtualizados.email);

      if (emailAnterior && dadosAtualizados.email !== emailAnterior) {
        sessionStorage.setItem(
          '@FisaSaude:flash',
          'Seus dados de acesso foram alterados. Entre novamente com o novo e-mail.'
        );
        limparSessao();
        navigate('/admin/login');
      } else {
        setSuccessMessage('Perfil atualizado com sucesso.');
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          'Não foi possível salvar o perfil. Verifique os dados e tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full grid place-items-center">
        <div className="w-8 h-8 border-4 border-[#009386] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F8F6F0] dark:bg-background p-4 sm:p-6 lg:p-8 text-[#1B2E26] dark:text-foreground">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Perfil</h1>
            <p className="text-xs text-[#56635C] dark:text-muted-foreground">
              Dados da sua conta autenticada.
            </p>
          </div>

          {profile && !editing && !sessionMissing && (
            <button
              type="button"
              onClick={iniciarEdicao}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#009386] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#007491] transition-colors cursor-pointer"
            >
              <Pencil size={14} />
              Editar dados
            </button>
          )}
        </div>

        {sessionMissing ? (
          <section className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-3xl p-6 text-center space-y-3">
            <UserRound size={34} className="mx-auto text-[#009386] dark:text-[#3CD099]" />
            <h2 className="font-bold">Sessão não encontrada</h2>
            <p className="text-xs text-[#56635C] dark:text-muted-foreground max-w-md mx-auto">
              Os dados da conta ficam disponíveis após o login. Entre novamente para consultar seu perfil.
            </p>
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009386] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#007491] transition-colors"
            >
              <LogIn size={15} />
              Ir para o login
            </button>
          </section>
        ) : (
          <>
            {notice && (
              <div
                className="p-3 rounded-xl text-xs flex gap-2 bg-[#F1B44C]/15 text-[#8A5A00] dark:text-[#F1B44C]"
                role="status"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {errorMessage && (
              <div
                className="p-3 rounded-xl text-xs flex gap-2 bg-[#FF6954]/10 border border-[#FF6954]/30 text-[#D94F3C] dark:text-[#FF8FA3]"
                role="alert"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                className="p-3 rounded-xl text-xs flex gap-2 bg-[#3CD099]/15 border border-[#3CD099]/30 text-[#0E2820] dark:text-[#3CD099]"
                role="status"
              >
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {editing ? (
              <form
                onSubmit={handleSalvar}
                className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-3xl p-5 space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-[#E3DEC9] dark:border-border pb-3">
                  <UserRound className="text-[#009386] dark:text-[#3CD099]" />
                  <h2 className="font-bold">Editar informações</h2>
                </div>

                <div className="block text-xs">
                  <label htmlFor="perfil-nome" className="font-bold">
                    Nome completo *
                  </label>
                  <input
                    id="perfil-nome"
                    type="text"
                    required
                    maxLength={100}
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border focus:outline-none focus:border-[#009386]"
                  />
                </div>

                <div className="block text-xs">
                  <label htmlFor="perfil-email" className="font-bold flex items-center gap-1">
                    <Mail size={12} /> E-mail *
                  </label>
                  <input
                    id="perfil-email"
                    type="email"
                    required
                    maxLength={100}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border focus:outline-none focus:border-[#009386]"
                  />
                  <p className="mt-1 text-[10px] text-[#56635C] dark:text-muted-foreground">
                    Ao alterar o e-mail, será necessário entrar novamente.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3DEC9] dark:border-border p-3 space-y-3">
                  <div className="flex items-start gap-2 text-[11px] text-[#56635C] dark:text-muted-foreground">
                    <Lock size={14} className="mt-0.5 flex-shrink-0 text-[#009386] dark:text-[#3CD099]" />
                    <span>Preencha os campos abaixo apenas se quiser trocar sua senha.</span>
                  </div>

                  <div className="block text-xs">
                    <label htmlFor="perfil-senha-atual" className="font-bold">
                      Senha atual
                    </label>
                    <input
                      id="perfil-senha-atual"
                      type="password"
                      autoComplete="current-password"
                      value={form.senhaAtual}
                      onChange={(e) => setForm({ ...form, senhaAtual: e.target.value })}
                      className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border focus:outline-none focus:border-[#009386]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="block text-xs">
                      <label htmlFor="perfil-nova-senha" className="font-bold">
                        Nova senha
                      </label>
                      <input
                        id="perfil-nova-senha"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={form.novaSenha}
                        onChange={(e) => setForm({ ...form, novaSenha: e.target.value })}
                        className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border focus:outline-none focus:border-[#009386]"
                      />
                    </div>

                    <div className="block text-xs">
                      <label htmlFor="perfil-confirmar-senha" className="font-bold">
                        Confirmar nova senha
                      </label>
                      <input
                        id="perfil-confirmar-senha"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={form.confirmarNovaSenha}
                        onChange={(e) => setForm({ ...form, confirmarNovaSenha: e.target.value })}
                        className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted border border-[#E3DEC9] dark:border-border focus:outline-none focus:border-[#009386]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelarEdicao}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EBE5D3]/60 dark:bg-muted/60 hover:bg-[#EBE5D3] dark:hover:bg-muted py-2.5 text-xs font-bold uppercase disabled:opacity-60"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#009386] hover:bg-[#007491] text-white py-2.5 text-xs font-bold uppercase disabled:opacity-60"
                  >
                    <Save size={14} />
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            ) : profile ? (
              <section className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E3DEC9] dark:border-border pb-3">
                  <UserRound className="text-[#009386] dark:text-[#3CD099]" />
                  <h2 className="font-bold">Informações pessoais</h2>
                </div>

                <div className="block text-xs">
                  <b>Nome completo</b>
                  <p className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted">{profile.nome || '-'}</p>
                </div>

                <div className="block text-xs">
                  <b>E-mail</b>
                  <p className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted break-all">
                    {profile.email || '-'}
                  </p>
                </div>

                <div className="block text-xs">
                  <b>Unidade</b>
                  <p className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted">
                    {profile.estabelecimentoNome || '-'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8F6F0] dark:bg-muted">
                    <b>Identificação</b>
                    <p className="mt-1">#{profile.id}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6F0] dark:bg-muted">
                    <b>Acesso</b>
                    <p className="mt-1 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-[#009386] dark:text-[#3CD099]" />
                      {roleLabel(profile.role)}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6F0] dark:bg-muted text-xs flex items-center justify-between gap-2">
                  <b>Status da conta</b>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      profile.ativo !== false
                        ? 'bg-[#3CD099]/15 text-[#0E2820] dark:text-foreground'
                        : 'bg-[#FF6954]/10 text-[#D94F3C] dark:text-[#FF8FA3]'
                    }`}
                  >
                    {profile.ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </section>
            ) : (
              <section className="bg-white dark:bg-card border border-[#E3DEC9] dark:border-border rounded-3xl p-6 text-center">
                <AlertCircle size={30} className="mx-auto text-[#D94F3C] dark:text-[#FF8FA3]" />
                <h2 className="mt-2 font-bold">Não foi possível carregar o perfil</h2>
                <p className="mt-1 text-xs text-[#56635C] dark:text-muted-foreground">
                  Entre novamente para restaurar os dados da sessão.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
