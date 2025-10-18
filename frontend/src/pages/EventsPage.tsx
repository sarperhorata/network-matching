import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { eventsService } from '../services/events.service';
import type { Event } from '../types';
import { EVENT_CATEGORIES } from '../utils/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, MapPin, Users, Search, Plus, Clock } from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEvents();
  }, [currentPage]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsService.getEvents(currentPage, 9);

      setEvents(response.events);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.categories?.includes(selectedCategory));
    }

    setFilteredEvents(filtered);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Etkinlikler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadEvents}>Tekrar Dene</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Etkinlikler</h1>
            <p className="text-gray-600">İlginizi çeken etkinliklere katılın</p>
          </div>
          {user?.role === 'organizer' && (
            <Link to="/events/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Etkinlik Oluştur
              </Button>
            </Link>
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {EVENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No events found in this category.</p>
            <Link
              to="/events/create"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Event Button */}
        {user?.role === 'organizer' && (
          <div className="fixed bottom-6 right-6">
            <Link
              to="/events/create"
              className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: Event }) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
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
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Image */}
      {event.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-4 right-4 ${
            isUpcoming
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-500 hover:bg-gray-600'
          }`}>
            {isUpcoming ? 'Yaklaşan' : 'Geçmiş'}
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-[#0EA5E9]" />
            {formatDate(event.startDate)}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-[#F59E0B]" />
            {new Date(event.startDate).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-[#10B981]" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {event.maxParticipants && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-[#8B5CF6]" />
              {event.maxParticipants} kişi
            </div>
          )}
        </div>

        {/* Categories */}
        {event.categories && event.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.categories.slice(0, 2).map(category => (
              <Badge key={category} className={getCategoryColor(category)} variant="secondary">
                {category}
              </Badge>
            ))}
            {event.categories.length > 2 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                +{event.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link to={`/events/${event.id}`} className="flex-1">
            <Button className="w-full" variant="default">
              Detaylar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

