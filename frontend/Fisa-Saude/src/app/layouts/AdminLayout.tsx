import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { FisaLogo } from '../components/FisaLogo';
import { ADMIN_USER } from '../constants/company';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Todos os itens de menu registrados no roteador
  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel da Clínica', path: '/admin' },
    { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
    { icon: Users, label: 'Pacientes', path: '/admin/clientes' },
    // { icon: TrendingUp, label: 'Comercial & Marketing', path: '/admin/relacionamento' },
    { icon: DollarSign, label: 'Financeiro', path: '/admin/financeiro' },
    // { icon: FileText, label: 'Histórico & Logs', path: '/admin/logs' },
    { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('@FisaSaude:token');
    navigate('/admin/login');
  };

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#F8F6F0] text-[#1B2E26] flex overflow-hidden select-none">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#E3DEC9] flex-col shadow-sm h-full overflow-hidden">
        {/* Logo */}
        <div className="p-6 border-b border-[#E3DEC9] flex-shrink-0">
          <FisaLogo size="lg" />
          <p className="text-xs text-[#56635C] mt-3 font-medium">Sistema de Gestão Operacional</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider cursor-pointer
                    ${isActive
                      ? 'bg-[#009386]/15 text-[#007491] shadow-xs border border-[#009386]/30 font-bold'
                      : 'text-[#56635C] hover:bg-[#EBE5D3]/60 hover:text-[#1B2E26]'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-[#009386]' : 'text-[#56635C]'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-[#E3DEC9] flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-[#F8F6F0] rounded-xl border border-[#E3DEC9]">
            <div className="w-9 h-9 bg-[#009386] rounded-full flex items-center justify-center shadow-xs text-white font-bold text-sm">
              {ADMIN_USER.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#1B2E26] truncate">{ADMIN_USER.name}</div>
              <div className="text-[10px] text-[#56635C] font-medium">{ADMIN_USER.role}</div>
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

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar Mobile */}
        <header className="lg:hidden bg-white border-b border-[#E3DEC9] px-4 py-3 flex-shrink-0 shadow-xs">
          <div className="flex items-center justify-center">
            <FisaLogo size="sm" />
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0 h-full flex flex-col min-h-0 bg-[#F8F6F0]">
          <Outlet />
        </main>

        {/* Barra de Navegação Inferior Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E3DEC9] shadow-2xl z-40">
          <div className="grid grid-cols-5 h-16 items-center">
            {menuItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex flex-col items-center justify-center gap-1 py-1 transition-colors
                    ${isActive
                      ? 'text-[#009386]'
                      : 'text-[#56635C] active:text-[#1B2E26]'
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-bold tracking-tight text-center truncate px-1">
                    {item.label.split(' ')[0]}
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