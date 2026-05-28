import { useNavigate, useLocation } from 'react-router';
import { 
  BarChart3, 
  Users, 
  UserPlus, 
  Search, 
  Settings, 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CativeiroLogo } from '@/src/components/CativeiroLogo';

const MENU_ITEMS = [
  { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
  { icon: Search, label: 'Buscar Famílias', path: '/families' },
  { icon: UserPlus, label: 'Novo Cadastro', path: '/families/new' },
  { icon: Users, label: 'Voluntários', path: '/volunteers' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

interface SidebarProps {
  onLogout: () => void;
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({ onLogout, className, onItemClick }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const userName = localStorage.getItem('cativeiro_user_name') || 'Sara Freitas';
  const userEmail = localStorage.getItem('cativeiro_user_email') || 'admin@projeto.org';
  const userAvatar = localStorage.getItem('cativeiro_user_avatar') || '';
  
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SF';

  const isGoogleUser = localStorage.getItem('cativeiro_mock_login') !== 'true';

  return (
    <div className={cn("w-64 border-r bg-[#0f172a] h-screen flex flex-col text-white", className)} id="sidebar">
      {/* Dynamic Cativeiro Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <CativeiroLogo />
        </div>
        <div>
          <h1 className="font-display font-bold text-base leading-none text-white tracking-tight">Cativeiro</h1>
          <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mt-1">Projeto Social</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-4 mb-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Menu Principal</div>
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (onItemClick) onItemClick();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group relative text-left",
                isActive 
                  ? "bg-white/10 text-white border-l-4 border-emerald-500 rounded-l-none" 
                  : "text-blue-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("transition-colors", isActive ? "text-emerald-400" : "group-hover:text-white")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6 overflow-hidden">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full ring-2 ring-emerald-500/20 object-cover flex-shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate leading-tight">{userName}</p>
            <p className="text-[10px] text-blue-400 truncate mt-1">
              {isGoogleUser ? userEmail : 'Administradora'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-blue-200/60 hover:text-white hover:bg-white/5 px-4 h-9 text-xs rounded-lg"
          onClick={onLogout}
        >
          <LogOut size={14} className="mr-3" />
          Sair do Sistema
        </Button>
      </div>
    </div>
  );
}
