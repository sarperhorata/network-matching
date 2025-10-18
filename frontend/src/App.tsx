import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import MeetingsPage from './pages/MeetingsPage';
import SettingsPage from './pages/SettingsPage';
import SpeedDatingPage from './pages/SpeedDatingPage';
import SerendipityPage from './pages/SerendipityPage';
import SocialCapitalPage from './pages/SocialCapitalPage';
import TravelBuddyPage from './pages/TravelBuddyPage';
import AdminPage from './pages/AdminPage';
import SponsorPage from './pages/SponsorPage';

// Layout
import Layout from './components/layout/Layout';
import PrivateRoute from './components/layout/PrivateRoute';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <PWAInstallPrompt />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="speed-dating/:sessionId" element={<SpeedDatingPage />} />
            <Route path="serendipity" element={<SerendipityPage />} />
            <Route path="social-capital" element={<SocialCapitalPage />} />
            <Route path="travel-buddy" element={<TravelBuddyPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="sponsor" element={<SponsorPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
