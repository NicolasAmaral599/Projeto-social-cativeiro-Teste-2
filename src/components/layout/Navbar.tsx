import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search,
  Menu,
  Check,
  User,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead as dbMarkAllAsRead, 
  listenToNotifications, 
  NotificationItem 
} from '@/src/lib/notifications';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  
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

  // Check if we are using custom Google profile or static admin
  const isGoogleUser = localStorage.getItem('cativeiro_mock_login') !== 'true';

  // State loaded dynamically
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
    return listenToNotifications(() => {
      setNotifications(getNotifications());
    });
  }, []);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/families?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const markAllAsRead = () => {
    dbMarkAllAsRead();
  };

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    
    // Navigate reasonably
    if (item.type === 'volunteer') {
      navigate('/volunteers');
    } else {
      navigate('/families');
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-8 justify-between" id="navbar">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/60 px-3 py-1.5 rounded-full border border-slate-200/80 group focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar rápida por nome, CPF ou NIS... (Aperte Enter)" 
            className="bg-transparent border-none text-sm focus:outline-none w-72 placeholder:text-slate-400/80 text-slate-800"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary transition-colors cursor-pointer rounded-xl h-10 w-10">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-2 rounded-2xl shadow-xl border-slate-100 bg-white">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-bold text-slate-800 text-sm">Notificações</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                  <Check size={14} /> Marcar tudo como lido
                </button>
              )}
            </div>
            <DropdownMenuSeparator className="bg-slate-100 my-1" />
            <div className="max-h-[280px] overflow-y-auto space-y-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Nenhuma notificação no momento.</div>
              ) : (
                notifications.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleNotificationClick(item)}
                    className={`flex gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${item.unread ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                      item.type === 'urgency' ? 'bg-rose-50 text-rose-500' :
                      item.type === 'volunteer' ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/5 text-primary'
                    }`}>
                      {item.type === 'urgency' && <AlertTriangle size={16} />}
                      {item.type === 'volunteer' && <Heart size={16} />}
                      {item.type === 'registration' && <User size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <section className="font-bold text-slate-800 text-xs truncate">{item.title}</section>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <button 
                        onClick={(e) => toggleRead(item.id, e)} 
                        className={`w-2 h-2 rounded-full border border-transparent ${item.unread ? 'bg-blue-500' : 'bg-slate-200 hover:bg-slate-300'}`} 
                        title={item.unread ? "Marcar como lida" : "Marcar como não lida"}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none text-slate-800">{userName}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isGoogleUser ? userEmail : 'Administradora'}
            </p>
          </div>
          <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-all hover:ring-primary/30 cursor-pointer">
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={userName} referrerPolicy="no-referrer" />
            ) : (
              <AvatarImage src="https://github.com/shadcn.png" />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
