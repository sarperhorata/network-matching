import { AdminPanel } from '../components/admin/AdminPanel';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    const routes: { [key: string]: string } = {
      'dashboard': '/dashboard',
      'events': '/events',
      'matches': '/matches',
      'messages': '/messages',
      'meetings': '/meetings',
      'profile': '/profile',
      'sponsor': '/sponsor',
      'admin': '/admin',
      'landing': '/',
    };
    
    navigate(routes[page] || '/');
  };

  return <AdminPanel onNavigate={handleNavigate} />;
}

