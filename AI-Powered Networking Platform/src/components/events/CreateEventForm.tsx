import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EventCategory } from '../../types';
import { toast } from 'sonner@2.0.3';

interface CreateEventFormProps {
  onNavigate: (page: string) => void;
}

export function CreateEventForm({ onNavigate }: CreateEventFormProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tech' as EventCategory,
    startDate: '',
    endDate: '',
    location: '',
    capacity: 50,
    imageUrl: '',
  });

  const categories: EventCategory[] = [
    'Tech', 'Business', 'Healthcare', 'Finance', 'Marketing',
    'Design', 'Education', 'Networking', 'Sports', 'Arts'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Lütfen giriş yapın');
      return;
    }

    setLoading(true);

    try {
      await api.createEvent(formData, session.access_token);
      toast.success('Etkinlik başarıyla oluşturuldu!');
      onNavigate('events');
    } catch (error: any) {
      toast.error(error.message || 'Etkinlik oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Etkinlik Oluştur</CardTitle>
          <CardDescription>
            Etkinlik detaylarını girin ve katılımcıları davet edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Etkinlik Başlığı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Teknoloji Networking Etkinliği"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Etkinlik hakkında detaylı bilgi..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as EventCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Bitiş Tarihi *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Konum *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="İstanbul, Türkiye"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasite *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Görsel URL (İsteğe bağlı)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onNavigate('events')}
              >
                İptal
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
