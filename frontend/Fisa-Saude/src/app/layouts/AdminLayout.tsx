import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  DollarSign,
  Settings,
  LogOut,
  UserRound,
  Moon,
  Sun,
  Package,
  Check,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { FisaLogo } from '../components/FisaLogo';
import { useTheme } from '../contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

type Role = 'ADMIN' | 'USUARIO';

interface UsuarioLogado {
  nome: string;
  role: Role;
  estabelecimentoNome?: string;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  mobileLabel?: string;
  path: string;
  roles: Role[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface AccountItem {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  roles: Role[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operação',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['ADMIN', 'USUARIO'] },
      { icon: Users, label: 'Alunos', path: '/admin/clientes', roles: ['ADMIN', 'USUARIO'] },
      { icon: Calendar, label: 'Agenda', path: '/admin/agenda', roles: ['ADMIN', 'USUARIO'] },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { icon: DollarSign, label: 'Financeiro', path: '/admin/financeiro', roles: ['ADMIN'] },
      { icon: Package, label: 'Planos e Pacotes', mobileLabel: 'Planos', path: '/admin/pacotes', roles: ['ADMIN'] },
      { icon: UserCog, label: 'Equipe', path: '/admin/equipe', roles: ['ADMIN'] },
    ],
  },
];

const ACCOUNT_ITEMS: AccountItem[] = [
  {
    icon: UserRound,
    label: 'Perfil',
    description: 'Dados da sua conta',
    path: '/admin/perfil',
    roles: ['ADMIN', 'USUARIO'],
  },
  {
    icon: Settings,
    label: 'Ajustes',
    description: 'Preferências e dados da unidade',
    path: '/admin/ajustes',
    roles: ['ADMIN'],
  },
];

const ROTAS_RESTRITAS = [
  '/admin/financeiro',
  '/admin/equipe',
  '/admin/ajustes',
  '/admin/configuracoes',
  '/admin/relacionamento',
  '/admin/logs',
  '/admin/pacotes',
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [usuario, setUsuario] = useState<UsuarioLogado>({
    nome: '',
    role: 'USUARIO',
    estabelecimentoNome: '',
  });

  useEffect(() => {
    let roleDetectada: Role = 'USUARIO';
    let nomeDetectado = '';
    let estNome = '';

    const usuarioSalvo = localStorage.getItem('@FisaSaude:usuario');
    if (usuarioSalvo) {
      try {
        const parsed = JSON.parse(usuarioSalvo);
        roleDetectada = parsed.role === 'ADMIN' ? 'ADMIN' : 'USUARIO';
        nomeDetectado = parsed.nome || '';
        estNome = parsed.estabelecimentoNome || '';
      } catch (e) {
        console.error(e);
      }
    }

    setUsuario({
      nome: nomeDetectado,
      role: roleDetectada,
      estabelecimentoNome: estNome,
    });

    // Proteção de rota direta por URL (a autorização real é feita pela API).
    if (roleDetectada === 'USUARIO' && ROTAS_RESTRITAS.some((r) => location.pathname.startsWith(r))) {
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Grupos filtrados por perfil, mantendo a ordem definida em NAV_GROUPS.
  const navGroups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.roles.includes(usuario.role)),
      })).filter((group) => group.items.length > 0),
    [usuario.role]
  );

  const menuItems = useMemo(
    () => navGroups.flatMap((group) => group.items),
    [navGroups]
  );

  const accountItems = useMemo(
    () => ACCOUNT_ITEMS.filter((item) => item.roles.includes(usuario.role)),
    [usuario.role]
  );

  const roleLabel = usuario.role === 'ADMIN' ? 'Administrador' : 'Instrutor / Profissional';

  const handleLogout = () => {
    localStorage.removeItem('@FisaSaude:token');
    localStorage.removeItem('@FisaSaude:usuarioId');
    localStorage.removeItem('@FisaSaude:usuario');
    localStorage.removeItem('@FisaSaude:userEmail');
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
    : 'FS';

  const renderAccountMenu = (side: 'top' | 'bottom', align: 'start' | 'end') => (
    <DropdownMenuContent
      side={side}
      align={align}
      sideOffset={8}
      className="w-64 rounded-2xl border-[#E3DEC9] bg-white p-2 shadow-xl dark:border-border dark:bg-card"
    >
      <div className="flex items-center gap-3 px-2 pb-2 pt-1">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[#009386] text-sm font-bold text-white">
          {iniciaisNome}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#1B2E26] dark:text-foreground">
            {usuario.nome || roleLabel}
          </p>
          <p className="text-[11px] text-[#56635C] dark:text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      <DropdownMenuSeparator className="bg-[#E3DEC9] dark:bg-border" />

      <DropdownMenuGroup>
        {accountItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(item.path);
          return (
            <DropdownMenuItem
              key={item.path}
              onSelect={() => navigate(item.path)}
              className={`min-h-11 cursor-pointer gap-3 rounded-xl px-2 py-2 focus:bg-[#EBE5D3]/60 dark:focus:bg-muted ${
                active ? 'bg-[#009386]/10' : ''
              }`}
            >
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#009386]/10 ${
                  active ? 'text-[#007491] dark:text-[#3CD099]' : 'text-[#009386] dark:text-[#3CD099]'
                }`}
              >
                <Icon size={16} className="text-current" />
              </span>
              <span className="min-w-0 flex-1">
                <b
                  className={`block text-xs font-bold ${
                    active ? 'text-[#007491] dark:text-[#3CD099]' : 'text-[#1B2E26] dark:text-foreground'
                  }`}
                >
                  {item.label}
                </b>
                <small className="block text-[11px] text-[#56635C] dark:text-muted-foreground">
                  {item.description}
                </small>
              </span>
              {active && <Check size={14} className="flex-shrink-0 text-[#009386] dark:text-[#3CD099]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#F8F6F0] text-[#1B2E26] dark:bg-background dark:text-foreground flex overflow-hidden select-none">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white dark:bg-card border-r border-[#E3DEC9] dark:border-border flex-col shadow-sm h-full overflow-hidden">
        <div className="p-6 border-b border-[#E3DEC9] dark:border-border flex-shrink-0">
          <FisaLogo size="lg" tone={theme === 'dark' ? 'onDark' : 'onLight'} />
          <p
            className="text-xs text-[#56635C] dark:text-muted-foreground mt-3 font-medium truncate"
            title={usuario.estabelecimentoNome || undefined}
          >
            {usuario.estabelecimentoNome || 'Unidade não informada'}
          </p>
        </div>

        {/* Itens Filtrados por Perfil */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A968F] dark:text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider cursor-pointer ${isActive
                          ? 'bg-[#009386]/15 text-[#007491] dark:text-[#3CD099] shadow-xs border border-[#009386]/30 font-bold'
                          : 'text-[#56635C] dark:text-muted-foreground hover:bg-[#EBE5D3]/60 dark:hover:bg-muted hover:text-[#1B2E26] dark:hover:text-foreground'
                        }`}
                    >
                      <Icon size={18} className={isActive ? 'text-[#009386]' : 'text-[#56635C] dark:text-muted-foreground'} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Card Usuário */}
        <div className="p-4 border-t border-[#E3DEC9] dark:border-border flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 mb-2 bg-[#F8F6F0] dark:bg-muted rounded-xl border border-[#E3DEC9] dark:border-border hover:border-[#009386]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009386]/40"
                aria-label="Abrir opções da conta"
              >
                <div className="w-9 h-9 bg-[#009386] rounded-full flex items-center justify-center shadow-xs text-white font-bold text-sm flex-shrink-0">
                  {iniciaisNome}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#1B2E26] dark:text-foreground truncate">
                    {usuario.nome || roleLabel}
                  </div>
                  <div className="text-[10px] text-[#56635C] dark:text-muted-foreground font-medium">
                    {roleLabel}
                  </div>
                </div>
                <ChevronUp size={14} className="text-[#56635C] dark:text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            {renderAccountMenu('top', 'start')}
          </DropdownMenu>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 mb-1 rounded-xl text-[#56635C] dark:text-muted-foreground hover:bg-[#EBE5D3]/60 dark:hover:bg-muted transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9E2A43] dark:text-[#FF8FA3] hover:bg-[#9E2A43]/10 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Central */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar Mobile */}
        <header className="lg:hidden bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-[#E3DEC9] dark:border-border px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-xs z-30">
          <FisaLogo size="sm" tone={theme === 'dark' ? 'onDark' : 'onLight'} />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-[#56635C] dark:text-muted-foreground rounded-lg"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#009386]/10 text-[#009386] dark:text-[#3CD099]">
              {usuario.role}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-7 h-7 bg-[#009386] rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs"
                  aria-label="Abrir opções da conta"
                >
                  {iniciaisNome}
                </button>
              </DropdownMenuTrigger>
              {renderAccountMenu('bottom', 'end')}
            </DropdownMenu>
          </div>
        </header>

        {/* Viewport Principal */}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0 h-full flex flex-col min-h-0 bg-[#F8F6F0] dark:bg-background">
          <Outlet />
        </main>

        {/* Bottom Bar Mobile (3 itens para USUARIO, 6 para ADMIN) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-[#E3DEC9] dark:border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 px-2">
          <div className="flex h-16 items-center justify-around max-w-lg mx-auto overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={`mobile-${item.path}`}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                  className={`flex flex-col flex-1 min-w-[55px] items-center justify-center py-1 rounded-xl transition-all duration-150 cursor-pointer ${isActive ? 'text-[#009386] font-bold' : 'text-[#56635C] dark:text-muted-foreground active:scale-95'
                    }`}
                >
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-[#009386]/10' : ''}`}>
                    <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                  </div>
                  <span className="text-[9px] tracking-tight mt-0.5 truncate max-w-[55px]">
                    {item.mobileLabel ?? item.label}
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
