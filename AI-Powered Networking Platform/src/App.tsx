import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/layout/Header';
import { Logo } from './components/layout/Logo';
import { LandingPage } from './components/landing/LandingPage';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { EventsPage } from './components/events/EventsPage';
import { CreateEventForm } from './components/events/CreateEventForm';
import { MatchesPage } from './components/matches/MatchesPage';
import { MessagesPage } from './components/messages/MessagesPage';
import { ProfilePage } from './components/profile/ProfilePage';

type Page = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'events'
  | 'create-event'
  | 'event-detail'
  | 'matches'
  | 'messages'
  | 'meetings'
  | 'profile'
  | 'analytics';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(user ? 'dashboard' : 'landing');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page as Page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F0F9FF]">
        <div className="text-center space-y-4">
          <Logo size="lg" showText={false} />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Public pages (no authentication required)
  if (currentPage === 'landing') {
    return (
      <>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <LandingPage onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  if (currentPage === 'login') {
    return (
      <>
        <LoginForm onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  if (currentPage === 'signup') {
    return (
      <>
        <SignupForm onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  // Protected pages (authentication required)
  if (!user) {
    return (
      <>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F0F9FF] p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl">Giriş Yapmanız Gerekiyor</h2>
            <p className="text-gray-600">Bu sayfayı görüntülemek için lütfen giriş yapın.</p>
            <button
              onClick={() => handleNavigate('login')}
              className="inline-flex items-center justify-center rounded-md bg-[#0A2540] px-6 py-2 text-white hover:bg-[#0A2540]/90 transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentPage === 'events' && <EventsPage onNavigate={handleNavigate} />}
        {currentPage === 'create-event' && <CreateEventForm onNavigate={handleNavigate} />}
        {currentPage === 'matches' && <MatchesPage onNavigate={handleNavigate} />}
        {currentPage === 'messages' && <MessagesPage startConversationWith={pageData?.startConversationWith} />}
        {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
        
        {/* Default fallback */}
        {!['dashboard', 'events', 'create-event', 'matches', 'messages', 'profile'].includes(currentPage) && (
          <div className="container mx-auto py-8 px-4 text-center">
            <h2 className="text-2xl mb-4">Sayfa bulunamadı</h2>
            <button
              onClick={() => handleNavigate('dashboard')}
              className="text-[#0EA5E9] hover:underline"
            >
              Dashboard'a dön
            </button>
          </div>
        )}
      </main>

      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
