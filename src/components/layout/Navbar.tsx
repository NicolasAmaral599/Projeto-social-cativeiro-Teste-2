import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search,
  Menu
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
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

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-8 justify-between" id="navbar">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>
        <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full border border-border/50 group focus-within:ring-2 ring-primary/20 transition-all">
          <Search size={16} className="text-muted-foreground group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            className="bg-transparent border-none text-sm focus:outline-none w-64 placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none">{userName}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
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
