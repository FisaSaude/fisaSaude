import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { FisaLogo } from '../components/FisaLogo';
import { ADMIN_USER } from '../constants/company';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu simplificado conforme solicitação
  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel da Clínica', path: '/admin' },
    { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
    { icon: Users, label: 'Pacientes', path: '/admin/clientes' },
    { icon: TrendingUp, label: 'Matrículas', path: '/admin/relacionamento' },
  ];

  const handleLogout = () => {
    navigate('/admin/login');
  };

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    /* fixed, inset-0 e overflow-hidden aqui isolam a trava de tela apenas no painel administrativo */
    <div className="fixed inset-0 h-screen w-screen bg-muted/30 flex overflow-hidden select-none">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-card border-r border-border flex-col shadow-sm h-full overflow-hidden">
        {/* Logo */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <FisaLogo size="lg" />
          <p className="text-xs text-muted-foreground mt-3 font-medium">Sistema de Gestão Operacional</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold
                    ${isActive
                      ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-accent rounded-xl">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">
                {ADMIN_USER.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{ADMIN_USER.name}</div>
              <div className="text-xs text-muted-foreground font-medium">{ADMIN_USER.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-semibold"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar Mobile */}
        <header className="lg:hidden bg-card border-b border-border px-4 py-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-center">
            <FisaLogo size="md" />
          </div>
        </header>

        {/* Page Content - Mantém a estrutura flexível interna bloqueada no layout pai */}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0 h-full flex flex-col min-h-0">
          <Outlet />
        </main>

        {/* Bottom Navigation Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl z-40">
          <div className="grid grid-cols-4 h-18">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex flex-col items-center justify-center gap-1.5 py-2 transition-colors
                    ${isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground active:text-foreground'
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-semibold leading-tight text-center px-1">
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