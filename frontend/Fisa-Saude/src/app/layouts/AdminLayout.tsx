import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  DollarSign,
  Settings,
  LogOut
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { FisaLogo } from '../components/FisaLogo';
import { ADMIN_USER } from '../constants/company';
interface UsuarioLogado {
  nome: string;
  role: 'ADMIN' | 'USUARIO';
  estabelecimentoNome?: string;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState<UsuarioLogado>({
    nome: ADMIN_USER.name,
    role: 'USUARIO',
    estabelecimentoNome: 'Fisa Saúde Unidade Central',
  });

  useEffect(() => {
    const carregarUsuario = () => {
      let roleDetectada: 'ADMIN' | 'USUARIO' = 'USUARIO';
      let nomeDetectado = ADMIN_USER.name;
      let estNome = 'Fisa Saúde Unidade Central';

      const usuarioSalvo = localStorage.getItem('@FisaSaude:usuario');
      if (usuarioSalvo) {
        try {
          const parsed = JSON.parse(usuarioSalvo);
          roleDetectada = parsed.role === 'ADMIN' ? 'ADMIN' : 'USUARIO';
          nomeDetectado = parsed.nome || ADMIN_USER.name;
          estNome = parsed.estabelecimentoNome || estNome;
        } catch (e) {
          console.error(e);
        }
      }

      setUsuario({
        nome: nomeDetectado,
        role: roleDetectada,
        estabelecimentoNome: estNome
      });

      // Proteção de rota direta por URL
      const rotasRestritas = ['/admin/financeiro', '/admin/equipe', '/admin/configuracoes', '/admin/relacionamento', '/admin/logs'];
      if (roleDetectada === 'USUARIO' && rotasRestritas.some(r => location.pathname.startsWith(r))) {
        navigate('/admin', { replace: true });
      }
    };

    carregarUsuario();
  }, [location.pathname, navigate]);

  // Lista mestre de rotas com controle de acesso por role
  const menuItems = useMemo(() => {
    const base = [
      { icon: LayoutDashboard, label: 'Painel', path: '/admin', roles: ['ADMIN', 'USUARIO'] },
      { icon: Calendar, label: 'Agenda', path: '/admin/agenda', roles: ['ADMIN', 'USUARIO'] },
      { icon: Users, label: 'Pacientes', path: '/admin/clientes', roles: ['ADMIN', 'USUARIO'] },
      { icon: UserCog, label: 'Equipe', path: '/admin/equipe', roles: ['ADMIN'] },
      { icon: DollarSign, label: 'Financeiro', path: '/admin/financeiro', roles: ['ADMIN'] },
      { icon: Settings, label: 'Ajustes', path: '/admin/configuracoes', roles: ['ADMIN'] },
    ];

    return base.filter((item) => item.roles.includes(usuario.role));
  }, [usuario.role]);

  const handleLogout = () => {
    localStorage.removeItem('@FisaSaude:token');
    localStorage.removeItem('@FisaSaude:usuarioId');
    localStorage.removeItem('@FisaSaude:usuario');
    navigate('/admin/login');
  };

  const isActivePath = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const iniciaisNome = usuario.nome
    ? usuario.nome
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'AD';

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#F8F6F0] text-[#1B2E26] flex overflow-hidden select-none">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#E3DEC9] flex-col shadow-sm h-full overflow-hidden">
        <div className="p-6 border-b border-[#E3DEC9] flex-shrink-0">
          <FisaLogo size="lg" />
          <p className="text-xs text-[#56635C] mt-3 font-medium truncate" title={usuario.estabelecimentoNome}>
            {usuario.estabelecimentoNome}
          </p>
        </div>

        {/* Itens Filtrados por Perfil */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={`${item.path}-${index}`}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider cursor-pointer ${isActive
                      ? 'bg-[#009386]/15 text-[#007491] shadow-xs border border-[#009386]/30 font-bold'
                      : 'text-[#56635C] hover:bg-[#EBE5D3]/60 hover:text-[#1B2E26]'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#009386]' : 'text-[#56635C]'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Card Usuário */}
        <div className="p-4 border-t border-[#E3DEC9] flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-[#F8F6F0] rounded-xl border border-[#E3DEC9]">
            <div className="w-9 h-9 bg-[#009386] rounded-full flex items-center justify-center shadow-xs text-white font-bold text-sm flex-shrink-0">
              {iniciaisNome}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#1B2E26] truncate">{usuario.nome}</div>
              <div className="text-[10px] text-[#56635C] font-medium">
                {usuario.role === 'ADMIN' ? 'Administrador' : 'Instrutor / Profissional'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9E2A43] hover:bg-[#9E2A43]/10 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Central */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar Mobile */}
        <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#E3DEC9] px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-xs z-30">
          <FisaLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#009386]/10 text-[#009386]">
              {usuario.role}
            </span>
            <div className="w-7 h-7 bg-[#009386] rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
              {iniciaisNome}
            </div>
          </div>
        </header>

        {/* Viewport Principal */}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0 h-full flex flex-col min-h-0 bg-[#F8F6F0]">
          <Outlet />
        </main>

        {/* Bottom Bar Mobile (adaptando as colunas automaticamente para 3 ou 6) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E3DEC9] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 px-2">
          <div
            className={`grid h-16 items-center max-w-lg mx-auto ${menuItems.length === 3 ? 'grid-cols-3' : 'grid-cols-6'
              }`}
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={`mobile-${item.path}-${index}`}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 cursor-pointer ${isActive ? 'text-[#009386] font-bold' : 'text-[#56635C] active:scale-95'
                    }`}
                >
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-[#009386]/10' : ''}`}>
                    <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                  </div>
                  <span className="text-[9px] tracking-tight mt-0.5 truncate max-w-[55px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}