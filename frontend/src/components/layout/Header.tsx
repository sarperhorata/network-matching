import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Calendar, 
  MessageCircle, 
  Users, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  CalendarDays,
  Settings
} from 'lucide-react';
import { Logo } from './Logo';
import NotificationBell from '../NotificationBell';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {user && (
            <button onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          )}
          <Link to={user ? '/dashboard' : '/'}>
            <Logo size="md" showText={true} />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {user && (
            <>
              <Button 
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                onClick={() => navigate('/dashboard')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant={isActive('/events') ? 'default' : 'ghost'}
                onClick={() => navigate('/events')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Etkinlikler
              </Button>
              <Button 
                variant={isActive('/matches') ? 'default' : 'ghost'}
                onClick={() => navigate('/matches')}
              >
                <Users className="mr-2 h-4 w-4" />
                Eşleşmeler
              </Button>
              <Button 
                variant={isActive('/messages') ? 'default' : 'ghost'}
                onClick={() => navigate('/messages')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Mesajlar
              </Button>
              <Button 
                variant={isActive('/meetings') ? 'default' : 'ghost'}
                onClick={() => navigate('/meetings')}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Toplantılar
              </Button>
              {user.role === 'sponsor' && (
                <Button 
                  variant={isActive('/sponsor') ? 'default' : 'ghost'}
                  onClick={() => navigate('/sponsor')}
                  className="border-amber-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sponsor Panel
                </Button>
              )}
              {user.role === 'admin' && (
                <Button 
                  variant={isActive('/admin') ? 'default' : 'ghost'}
                  onClick={() => navigate('/admin')}
                  className="border-red-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>{user.firstName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Ayarlar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Giriş Yap
              </Button>
              <Button onClick={() => navigate('/register')}>
                Kayıt Ol
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
