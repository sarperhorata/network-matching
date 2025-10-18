import { useAuthStore } from '../stores/authStore';
import ProfileForm from '../components/ProfileForm';
import { Card, CardContent } from '../components/ui/card';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <User className="h-8 w-8 text-[#0EA5E9]" />
            Profilim
          </h1>
          <p className="text-gray-600">
            Profil bilgilerinizi ve network tercihlerinizi yönetin
          </p>
        </div>

        {user ? (
          <ProfileForm />
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Profilinizi görmek için lütfen giriş yapın.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

