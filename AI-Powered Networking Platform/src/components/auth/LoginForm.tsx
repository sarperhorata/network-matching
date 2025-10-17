import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';

interface LoginFormProps {
  onNavigate: (page: string) => void;
}

export function LoginForm({ onNavigate }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { email: 'ahmet@example.com', name: 'Ahmet Yılmaz', role: 'Participant' },
    { email: 'zeynep@example.com', name: 'Zeynep Kaya', role: 'Organizer' },
    { email: 'mehmet@example.com', name: 'Mehmet Demir', role: 'Sponsor' },
  ];

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F0F9FF] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
          <CardDescription className="text-center">
            Hesabınıza giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo Accounts Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm mb-2">
              <strong>Demo Hesaplar:</strong> (Şifre: demo123)
            </p>
            <div className="flex flex-wrap gap-2">
              {demoUsers.map((user) => (
                <Badge 
                  key={user.email}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => fillDemoCredentials(user.email)}
                >
                  {user.name}
                </Badge>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>

            <div className="text-center text-sm">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="text-[#0EA5E9] hover:underline"
              >
                Kayıt olun
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
