import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogIn, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { FisaLogo } from '../../components/FisaLogo';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados para capturar os inputs do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados de controle visual do formulário
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Faz o POST diretamente para o endpoint de login do seu Spring Boot
      const response = await axios.post('http://localhost:8080/auth/login', {
        email: email,
        senha: senha // Mapeamento idêntico ao AuthenticationDto record do Java
      });

      // Se der certo, recebemos o seu LoginResponseDto
      if (response.status === 200) {
        const { token, nome, estabelecimentoNome } = response.data;
        
        // Guardamos o Token JWT e as informações essenciais para usar nas outras telas
        localStorage.setItem('@FisaSaude:token', token);
        localStorage.setItem('@FisaSaude:userName', nome);
        localStorage.setItem('@FisaSaude:studioName', estabelecimentoNome);

        setSuccess(true);
        
        // Pequeno delay elegante para simular o carregamento antes de ir para o painel
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      }
    } catch (error: any) {
      console.error('Erro na autenticação:', error);
      
      // Valida o erro retornado pelo Spring Security (ex: 401 Unauthorized ou dados inválidos)
      if (error.response && error.response.status === 401) {
        setErrorMessage('E-mail ou senha incorretos. Por favor, verifique os dados.');
      } else if (error.response && error.response.status === 400) {
        setErrorMessage('Por favor, insira um e-mail válido.');
      } else {
        setErrorMessage('Não foi possível conectar ao servidor. O sistema do back-end está ligado?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Identidade Visual */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <FisaLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acesso ao Sistema</h1>
          <p className="text-xs text-gray-500">Insira suas credenciais para gerenciar a clínica FisaSaúde</p>
        </div>

        {/* Alertas de Retorno Didáticos */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5 font-medium animate-fadeIn">
            <ShieldAlert size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 font-medium">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>Login realizado! Entrando no painel operacional...</div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              E-mail institucional
            </label>
            <input
              type="email"
              required
              disabled={isLoading || success}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@fisasaude.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Senha de acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading || success}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-12 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg min-w-0 min-h-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>

        <Link
          to="/"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para o site
        </Link>
      </div>
    </div>
  );
}