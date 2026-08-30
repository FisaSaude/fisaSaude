import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { FisaLogo } from '../../components/FisaLogo';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        navigate('/admin');
      } else {
        setError('Preencha seu e-mail e senha para acessar.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div
      style={{ backgroundColor: '#F8F6F0', color: '#1B2E26' }}
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden select-none"
    >
      {/* Elementos Decorativos de Fundo */}
      <div
        style={{ backgroundColor: 'rgba(60, 208, 153, 0.18)' }}
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"
      />
      <div
        style={{ backgroundColor: 'rgba(255, 105, 84, 0.15)' }}
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3"
      />

      {/* Card de Login */}
      <div className="w-full max-w-md relative z-10">
        <div
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E3DEC9' }}
          className="rounded-3xl p-7 sm:p-9 border shadow-xl relative overflow-hidden"
        >
          {/* Faixa Superior */}
          <div
            style={{
              background: 'linear-gradient(to right, #009386, #3CD099, #FF6954)'
            }}
            className="absolute top-0 left-0 right-0 h-2"
          />

          {/* Topo do Card */}
          <div className="flex flex-col items-center text-center mb-8 mt-2">
            <div className="mb-4">
              <FisaLogo size="lg" />
            </div>

            <div
              style={{
                backgroundColor: 'rgba(0, 147, 134, 0.12)',
                color: '#007491',
                borderColor: 'rgba(0, 147, 134, 0.25)'
              }}
              className="inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2"
            >
              <Sparkles size={12} style={{ color: '#009386' }} />
              Área do Profissional
            </div>

            <h1 style={{ color: '#1B2E26' }} className="text-2xl font-extrabold tracking-tight">
              Acesso ao Sistema
            </h1>
            <p style={{ color: '#56635C' }} className="text-xs sm:text-sm mt-1">
              Painel de Gestão e Atendimento da FISA Saúde
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(158, 42, 67, 0.1)',
                borderColor: 'rgba(158, 42, 67, 0.3)',
                color: '#9E2A43'
              }}
              className="mb-5 p-3.5 border rounded-2xl text-xs font-semibold flex items-center gap-2"
            >
              <span style={{ backgroundColor: '#9E2A43' }} className="w-1.5 h-1.5 rounded-full" />
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                style={{ color: '#1B2E26' }}
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              >
                E-mail
              </label>
              <div className="relative flex items-center">
                <div style={{ color: '#56635C' }} className="absolute left-3.5 pointer-events-none">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@fisasaude.com.br"
                  required
                  style={{
                    backgroundColor: '#F8F6F0',
                    borderColor: '#E3DEC9',
                    color: '#1B2E26'
                  }}
                  className="w-full border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009386]/30 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label
                style={{ color: '#1B2E26' }}
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              >
                Senha
              </label>
              <div className="relative flex items-center">
                <div style={{ color: '#56635C' }} className="absolute left-3.5 pointer-events-none">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    backgroundColor: '#F8F6F0',
                    borderColor: '#E3DEC9',
                    color: '#1B2E26'
                  }}
                  className="w-full border rounded-2xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009386]/30 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: '#56635C' }}
                  className="absolute right-3.5 p-1 hover:text-[#1B2E26] cursor-pointer"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#FF6954', color: '#FFFFFF' }}
              className="w-full mt-2 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-md hover:brightness-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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

          {/* Rodapé Interno com Recuperação de Senha */}
          <div
            style={{ borderColor: '#E3DEC9' }}
            className="mt-7 pt-5 border-t text-center flex flex-col gap-3"
          >
            <a
              href="#recuperar"
              onClick={(e) => {
                e.preventDefault();
                alert('Solicite a recuperação de senha com a recepção ou administrador do sistema.');
              }}
              style={{ color: '#009386' }}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              Esqueceu sua senha de acesso?
            </a>

            <div style={{ color: '#56635C' }} className="inline-flex items-center justify-center gap-1.5 text-[11px]">
              <ShieldCheck size={14} style={{ color: '#009386' }} />
              Conexão criptografada e segura
            </div>
          </div>
        </div>

        <p style={{ color: '#56635C' }} className="text-center text-[11px] mt-6">
          &copy; {new Date().getFullYear()} FISA Saúde. Sistema de Gestão Interna.
        </p>
      </div>
    </div>
  );
}