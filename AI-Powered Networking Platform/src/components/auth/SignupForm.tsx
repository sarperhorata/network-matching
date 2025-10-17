import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { UserRole } from '../../types';

interface SignupFormProps {
  onNavigate: (page: string) => void;
}

export function SignupForm({ onNavigate }: SignupFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'participant' as UserRole,
    industry: '',
    interests: [] as string[],
    goals: [] as string[],
  });
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentGoal, setCurrentGoal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    'Yapay Zeka', 'Blockchain', 'Web Geliştirme', 'Mobil Uygulama',
    'Veri Bilimi', 'Siber Güvenlik', 'Bulut Teknolojileri', 'IoT',
    'Pazarlama', 'Satış', 'Girişimcilik', 'Finans', 'Yönetim',
    'Tasarım', 'İçerik Üretimi', 'Eğitim', 'Danışmanlık'
  ];

  const goalOptions = [
    'İş Ortağı Bulmak', 'Yatırımcı Bulmak', 'Mentorluk Almak',
    'Mentorluk Vermek', 'İş Fırsatları', 'Proje İşbirlikleri',
    'Bilgi Paylaşımı', 'Network Genişletme', 'Müşteri Bulmak',
    'Tedarikçi Bulmak', 'Teknoloji Partnerleri', 'Etkinlik Düzenleme'
  ];

  const industries = [
    'Teknoloji', 'Finans', 'Sağlık', 'E-ticaret', 'Eğitim',
    'Pazarlama', 'Danışmanlık', 'İmalat', 'Gayrimenkul', 'Medya',
    'Turizm', 'Lojistik', 'Enerji', 'Telekomünikasyon', 'Diğer'
  ];

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  const addGoal = (goal: string) => {
    if (goal && !formData.goals.includes(goal)) {
      setFormData({ ...formData, goals: [...formData.goals, goal] });
    }
  };

  const removeGoal = (goal: string) => {
    setFormData({ ...formData, goals: formData.goals.filter(g => g !== goal) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        role: formData.role,
        industry: formData.industry,
        interests: formData.interests,
        goals: formData.goals,
      });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F0F9FF] p-4 py-8">
      <Card className="w-full max-w-md my-8">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">
            Yeni hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ahmet Yılmaz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Katılımcı</SelectItem>
                  <SelectItem value="organizer">Organizatör</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Sektör</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sektör seçin" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>İlgi Alanları</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
              <Select 
                value={currentInterest} 
                onValueChange={(value) => {
                  addInterest(value);
                  setCurrentInterest('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="İlgi alanı ekle" />
                </SelectTrigger>
                <SelectContent>
                  {interestOptions.filter(opt => !formData.interests.includes(opt)).map((interest) => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hedefler</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.goals.map((goal) => (
                  <Badge key={goal} variant="secondary" className="gap-1">
                    {goal}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeGoal(goal)}
                    />
                  </Badge>
                ))}
              </div>
              <Select 
                value={currentGoal} 
                onValueChange={(value) => {
                  addGoal(value);
                  setCurrentGoal('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hedef ekle" />
                </SelectTrigger>
                <SelectContent>
                  {goalOptions.filter(opt => !formData.goals.includes(opt)).map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>

            <div className="text-center text-sm">
              Zaten hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[#0EA5E9] hover:underline"
              >
                Giriş yapın
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
