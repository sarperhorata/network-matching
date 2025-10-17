import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { User, Briefcase, Target, Heart } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    industry: user?.industry || '',
    interests: user?.interests?.join(', ') || '',
    goals: user?.goals?.join(', ') || '',
    profileImage: user?.profileImage || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        industry: formData.industry,
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
        goals: formData.goals.split(',').map(g => g.trim()).filter(Boolean),
        profileImage: formData.profileImage,
      });
      
      toast.success('Profil güncellendi!');
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      industry: user?.industry || '',
      interests: user?.interests?.join(', ') || '',
      goals: user?.goals?.join(', ') || '',
      profileImage: user?.profileImage || '',
    });
    setEditing(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Profil</h1>
        <p className="text-gray-600">Profil bilgilerinizi görüntüleyin ve düzenleyin</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profileImage} alt={user?.name} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user?.name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {user?.role}
                </Badge>
              </div>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)}>
                Profili Düzenle
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Tamamlama</CardTitle>
          <CardDescription>
            Profilinizi tamamlayarak daha iyi eşleşmeler elde edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tamamlanma Oranı</span>
              <span>{user?.profileCompletion || 0}%</span>
            </div>
            <Progress value={user?.profileCompletion || 0} />
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-2" />
                  Ad Soyad
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  <Briefcase className="inline h-4 w-4 mr-2" />
                  Sektör
                </Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Teknoloji, Finans, vb."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">
                  <Heart className="inline h-4 w-4 mr-2" />
                  İlgi Alanları
                </Label>
                <Textarea
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="Yapay Zeka, Blockchain, Startup, vb. (virgülle ayırın)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">
                  <Target className="inline h-4 w-4 mr-2" />
                  Hedefler
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="İş ortağı bulma, Mentörlük, Yatırım, vb. (virgülle ayırın)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage">Profil Fotoğrafı URL</Label>
                <Input
                  id="profileImage"
                  type="url"
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span>Sektör</span>
                </div>
                <p>{user?.industry || 'Belirtilmemiş'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Heart className="h-4 w-4" />
                  <span>İlgi Alanları</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user?.interests && user.interests.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">Belirtilmemiş</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Target className="h-4 w-4" />
                  <span>Hedefler</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user?.goals && user.goals.length > 0 ? (
                    user.goals.map((goal, index) => (
                      <Badge key={index} variant="outline">
                        {goal}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">Belirtilmemiş</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">{user?.stats?.eventsAttended || 0}</div>
              <p className="text-sm text-gray-600">Etkinlik</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{user?.stats?.totalMatches || 0}</div>
              <p className="text-sm text-gray-600">Eşleşme</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{user?.stats?.acceptedMatches || 0}</div>
              <p className="text-sm text-gray-600">Kabul Edilen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{user?.stats?.totalMeetings || 0}</div>
              <p className="text-sm text-gray-600">Toplantı</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
