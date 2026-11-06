import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { FisaLogo } from '../../components/FisaLogo';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const emailLimpo = login.trim();
      const response = await api.post('/auth/login', {
        email: emailLimpo,
        senha: senha,
      });

      const {
        token,
        id,
        nome,
        role,
        estabelecimentoId,
        estabelecimentoNome,
      } = response.data;

      if (token) {
        localStorage.setItem('@FisaSaude:token', token);
        localStorage.setItem('@FisaSaude:userEmail', emailLimpo);

        if (id != null) {
          localStorage.setItem('@FisaSaude:usuarioId', String(id));
        }

        const roleNormalizada = role === 'ADMIN' ? 'ADMIN' : 'USUARIO';
        localStorage.setItem(
          '@FisaSaude:usuario',
          JSON.stringify({
            nome: nome || emailLimpo,
            role: roleNormalizada,
            estabelecimentoId,
            estabelecimentoNome,
          })
        );

        navigate('/admin');
      } else {
        setError('Resposta do servidor inválida. Token não recebido.');
      }
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      const mensagemErro =
        err.response?.data?.message ||
        err.response?.data?.mensagem ||
        (err.response?.status === 400 ? 'Dados inválidos. Verifique os campos.' : null) ||
        (err.response?.status === 403 || err.response?.status === 401
          ? 'Usuário ou senha incorretos.'
          : null) ||
        'Não foi possível conectar ao servidor. Verifique se o back-end está ativo.';

      setError(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden select-none bg-[#F8F6F0] dark:bg-background text-[#1B2E26] dark:text-foreground">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 bg-[#3CD099]/[0.18]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3 bg-[#FF6954]/[0.15]" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl p-7 sm:p-9 border shadow-xl relative overflow-hidden bg-white dark:bg-card border-[#E3DEC9] dark:border-border">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#009386] via-[#3CD099] to-[#FF6954]" />

          <div className="flex flex-col items-center text-center mb-8 mt-2">
            <div className="mb-4">
              <FisaLogo size="lg" tone={theme === 'dark' ? 'onDark' : 'onLight'} />
            </div>

            <div className="inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 bg-[#009386]/10 dark:bg-[#3CD099]/15 text-[#007491] dark:text-[#3CD099] border-[#009386]/25 dark:border-[#3CD099]/30">
              <Sparkles size={12} className="text-[#009386] dark:text-[#3CD099]" />
              Área do Profissional
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#1B2E26] dark:text-foreground">
              Acesso ao Sistema
            </h1>
            <p className="text-xs sm:text-sm mt-1 text-[#56635C] dark:text-muted-foreground">
              Painel de Gestão e Atendimento da FISA Saúde
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 border rounded-2xl text-xs font-semibold flex items-center gap-2 bg-[#9E2A43]/10 dark:bg-[#FF8FA3]/10 border-[#9E2A43]/30 dark:border-[#FF8FA3]/30 text-[#9E2A43] dark:text-[#FF8FA3]">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#9E2A43] dark:bg-[#FF8FA3]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <div>
              <label
                htmlFor="login"
                className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#1B2E26] dark:text-foreground"
              >
                Login / E-mail
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-[#56635C] dark:text-muted-foreground">
                  <Mail size={18} />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="seu.login"
                  required
                  className="w-full border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009386]/30 font-medium transition-all bg-[#F8F6F0] dark:bg-muted border-[#E3DEC9] dark:border-border text-[#1B2E26] dark:text-foreground placeholder:text-[#56635C]/70 dark:placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#1B2E26] dark:text-foreground"
              >
                Senha
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-[#56635C] dark:text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  id="senha"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border rounded-2xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009386]/30 font-medium transition-all bg-[#F8F6F0] dark:bg-muted border-[#E3DEC9] dark:border-border text-[#1B2E26] dark:text-foreground placeholder:text-[#56635C]/70 dark:placeholder:text-muted-foreground/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 cursor-pointer text-[#56635C] dark:text-muted-foreground hover:text-[#1B2E26] dark:hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-md hover:brightness-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 bg-[#FF6954] text-white"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t text-center flex flex-col gap-3 border-[#E3DEC9] dark:border-border">
            <a
              href="#recuperar"
              onClick={(e) => {
                e.preventDefault();
                alert('Solicite a redefinição de senha ao administrador do sistema.');
              }}
              className="text-xs font-semibold hover:underline cursor-pointer text-[#009386] dark:text-[#3CD099]"
            >
              Esqueceu sua senha de acesso?
            </a>

            <div className="inline-flex items-center justify-center gap-1.5 text-[11px] text-[#56635C] dark:text-muted-foreground">
              <ShieldCheck size={14} className="text-[#009386] dark:text-[#3CD099]" />
              Conexão criptografada e segura
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
