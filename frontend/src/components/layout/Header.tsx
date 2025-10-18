import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  CalendarDays
} from 'lucide-react';
import { Logo } from './Logo';
import { NotificationBell } from '../notifications/NotificationBell';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onMenuClick?: () => void;
}

export function Header({ onNavigate, currentPage, onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {user && (
            <button onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          )}
          <button onClick={() => onNavigate(user ? 'dashboard' : 'landing')}>
            <Logo size="md" showText={true} />
          </button>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {user && (
            <>
              <Button 
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onNavigate('dashboard')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant={currentPage === 'events' ? 'default' : 'ghost'}
                onClick={() => onNavigate('events')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Etkinlikler
              </Button>
              <Button 
                variant={currentPage === 'matches' ? 'default' : 'ghost'}
                onClick={() => onNavigate('matches')}
              >
                <Users className="mr-2 h-4 w-4" />
                Eşleşmeler
              </Button>
              <Button 
                variant={currentPage === 'messages' ? 'default' : 'ghost'}
                onClick={() => onNavigate('messages')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Mesajlar
              </Button>
              <Button 
                variant={currentPage === 'meetings' ? 'default' : 'ghost'}
                onClick={() => onNavigate('meetings')}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Toplantılar
              </Button>
              {user.role === 'sponsor' && (
                <Button 
                  variant={currentPage === 'sponsor' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('sponsor')}
                  className="border-amber-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sponsor Panel
                </Button>
              )}
              {user.role === 'admin' && (
                <Button 
                  variant={currentPage === 'admin' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('admin')}
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
              <NotificationBell onNavigate={onNavigate} />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={() => onNavigate('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
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
              <Button variant="ghost" onClick={() => onNavigate('login')}>
                Giriş Yap
              </Button>
              <Button onClick={() => onNavigate('signup')}>
                Kayıt Ol
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
