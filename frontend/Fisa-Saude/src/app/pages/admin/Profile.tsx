import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../../services/api';

interface ProfileData {
  id: number;
  nome: string;
  email: string;
  role?: string;
  estabelecimentoId?: number;
  estabelecimentoNome?: string;
}

const roleLabel = (role?: string) => {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'USUARIO') return 'Instrutor / Profissional';
  return role || '-';
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [sessionMissing, setSessionMissing] = useState(false);

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

        const user = JSON.parse(savedUser);
        if (!ativo) return;

        setProfile({
          id,
          nome: user.nome || '',
          email,
          role: user.role,
          estabelecimentoId: user.estabelecimentoId,
          estabelecimentoNome: user.estabelecimentoNome,
        });

        if (user.role === 'ADMIN') {
          try {
            const response = await api.get(`/usuarios/${id}`);
            if (!ativo) return;
            setProfile(response.data);
            setNotice('');
          } catch (error: any) {
            if (!ativo) return;
            setNotice(
              error.response?.data?.message ||
              'Não foi possível atualizar os dados pela API. Exibindo as informações da sessão.'
            );
          }
        } else {
          if (ativo) {
            setNotice('A consulta de usuários é exclusiva de administradores. Estes dados vêm da sua sessão de login.');
          }
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
        <div>
          <h1 className="text-2xl font-bold">Perfil</h1>
          <p className="text-xs text-[#56635C] dark:text-muted-foreground">Dados da sua conta autenticada.</p>
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
            <div className="p-3 rounded-xl text-xs flex gap-2 bg-[#E3DEC9]/40 dark:bg-muted text-[#56635C] dark:text-muted-foreground">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>
                A edição de dados pessoais permanece indisponível: o endpoint atual exige senha, papel e
                estabelecimento completos e é exclusivo para administradores.
              </span>
            </div>

            {notice && (
              <div className="p-3 rounded-xl text-xs flex gap-2 bg-[#F1B44C]/15 text-[#8A5A00] dark:text-[#F1B44C]" role="status">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {profile && (
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
                  <p className="mt-1 w-full p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-muted break-all">{profile.email || '-'}</p>
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
              </section>
            )}

            {!profile && !sessionMissing && (
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
