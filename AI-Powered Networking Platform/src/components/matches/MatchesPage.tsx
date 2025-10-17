import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { Match } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, TrendingUp, MessageCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MatchesPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function MatchesPage({ onNavigate }: MatchesPageProps) {
  const { session } = useAuth();
  const [eventId, setEventId] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.getEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadRecommendations = async () => {
    if (!session || !eventId) {
      toast.error('Lütfen bir etkinlik seçin');
      return;
    }

    setLoading(true);
    try {
      const response = await api.getRecommendations(eventId, session.access_token);
      setMatches(response.matches || []);
      
      if (response.matches?.length === 0) {
        toast.info('Bu etkinlik için eşleşme bulunamadı');
      } else {
        toast.success(`${response.matches.length} eşleşme bulundu!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Eşleşmeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId: string, status: 'accepted' | 'declined') => {
    if (!session) return;

    try {
      await api.respondToMatch(matchId, status, session.access_token);
      toast.success(status === 'accepted' ? 'Eşleşme kabul edildi!' : 'Eşleşme reddedildi');
      
      // Update local state
      setMatches(matches.map(m => 
        m.id === matchId ? { ...m, status } : m
      ));
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    }
  };

  const handleStartChat = (userId: string) => {
    onNavigate('messages', { startConversationWith: userId });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#10B981]';
    if (score >= 40) return 'text-[#F59E0B]';
    return 'text-gray-600';
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Eşleşmeler</h1>
        <p className="text-gray-600">Yapay zeka destekli network önerileri</p>
      </div>

      {/* Load Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Etkinlik Eşleştirmeleri</CardTitle>
          <CardDescription>
            Katıldığınız bir etkinliği seçerek o etkinlikteki katılımcılarla eşleşin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {loadingEvents ? (
              <div className="flex-1 text-center py-2 text-gray-500">Etkinlikler yükleniyor...</div>
            ) : (
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Bir etkinlik seçin" />
                </SelectTrigger>
                <SelectContent>
                  {events.length === 0 ? (
                    <SelectItem value="no-events" disabled>Henüz etkinlik yok</SelectItem>
                  ) : (
                    events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            <Button onClick={loadRecommendations} disabled={loading || !eventId}>
              {loading ? 'Yükleniyor...' : 'Eşleştir'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            İpucu: Önce Etkinlikler sayfasından bir etkinliğe katılın, sonra buradan eşleştirme yapın
          </p>
        </CardContent>
      </Card>

      {/* Matches List */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Önerilen Eşleşmeler</h2>
            <Badge variant="secondary">
              {matches.length} eşleşme
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={match.user.profileImage} alt={match.user.name} />
                      <AvatarFallback>
                        {match.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{match.user.name}</CardTitle>
                      <CardDescription>{match.user.industry}</CardDescription>
                      <Badge variant="secondary" className="mt-2">
                        {match.user.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Match Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Uyumluluk Skoru
                      </span>
                      <span className={`${getScoreColor(match.score)}`}>
                        {match.score}/100
                      </span>
                    </div>
                    <Progress value={match.score} />
                  </div>

                  {/* Match Reasons */}
                  <div className="space-y-2">
                    <p className="text-sm">Eşleşme Nedenleri:</p>
                    <ul className="space-y-1">
                      {match.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  {match.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRespond(match.id, 'declined')}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleRespond(match.id, 'accepted')}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Kabul Et
                      </Button>
                    </div>
                  )}

                  {match.status === 'accepted' && (
                    <Button
                      className="w-full"
                      onClick={() => handleStartChat(match.user.id)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Mesaj Gönder
                    </Button>
                  )}

                  {match.status === 'declined' && (
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      Reddedildi
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Henüz eşleşme yok</p>
            <p className="text-sm text-gray-500">
              Bir etkinlik ID girerek eşleşmeleri görüntüleyin
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
