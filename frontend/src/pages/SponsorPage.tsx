import { SponsorDashboard } from '../components/sponsor/SponsorDashboard';
import { useNavigate } from 'react-router-dom';

export default function SponsorPage() {
  const navigate = useNavigate();

  const handleNavigate = (page: string, data?: any) => {
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
    
    navigate(routes[page] || '/', { state: data });
  };

  return <SponsorDashboard onNavigate={handleNavigate} />;
}

