import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { Event, EventCategory } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, MapPin, Users, Search, Plus } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface EventsPageProps {
  onNavigate: (page: string, eventId?: string) => void;
}

export function EventsPage({ onNavigate }: EventsPageProps) {
  const { user, session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, categoryFilter]);

  const loadEvents = async () => {
    try {
      const response = await api.getEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Etkinlikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!session) {
      toast.error('Lütfen giriş yapın');
      return;
    }

    try {
      await api.joinEvent(eventId, session.access_token);
      toast.success('Katılım talebiniz gönderildi!');
      loadEvents();
    } catch (error: any) {
      toast.error(error.message || 'Katılım talebi gönderilemedi');
    }
  };

  const categories: EventCategory[] = [
    'Tech', 'Business', 'Healthcare', 'Finance', 'Marketing',
    'Design', 'Education', 'Networking', 'Sports', 'Arts'
  ];

  const getCategoryColor = (category: EventCategory) => {
    const colors: Record<EventCategory, string> = {
      Tech: 'bg-blue-100 text-blue-800',
      Business: 'bg-purple-100 text-purple-800',
      Healthcare: 'bg-green-100 text-green-800',
      Finance: 'bg-yellow-100 text-yellow-800',
      Marketing: 'bg-pink-100 text-pink-800',
      Design: 'bg-indigo-100 text-indigo-800',
      Education: 'bg-orange-100 text-orange-800',
      Networking: 'bg-teal-100 text-teal-800',
      Sports: 'bg-red-100 text-red-800',
      Arts: 'bg-violet-100 text-violet-800',
    };
    return colors[category];
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Etkinlikler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Etkinlikler</h1>
          <p className="text-gray-600">İlginizi çeken etkinliklere katılın</p>
        </div>
        {user?.role === 'organizer' && (
          <Button onClick={() => onNavigate('create-event')}>
            <Plus className="mr-2 h-4 w-4" />
            Etkinlik Oluştur
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Etkinlik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Henüz etkinlik bulunmuyor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isParticipant = event.participants?.includes(user?.id || '');
            const hasPendingRequest = event.pendingRequests?.includes(user?.id || '');
            const isFull = event.participants?.length >= event.capacity;

            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gray-100">
                  {event.imageUrl ? (
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.startDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      {event.participants?.length || 0} / {event.capacity} katılımcı
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => onNavigate('event-detail', event.id)}
                    >
                      Detaylar
                    </Button>
                    
                    {!isParticipant && !hasPendingRequest && (
                      <Button
                        className="flex-1"
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={isFull}
                      >
                        {isFull ? 'Dolu' : 'Katıl'}
                      </Button>
                    )}
                    
                    {hasPendingRequest && (
                      <Button className="flex-1" disabled>
                        Onay Bekleniyor
                      </Button>
                    )}
                    
                    {isParticipant && (
                      <Button className="flex-1" variant="secondary" disabled>
                        Katılımcısınız
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
