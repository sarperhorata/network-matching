import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { matchesService } from '../services/matches.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Users, Briefcase, MapPin, Star, MessageCircle, Check, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function MatchesPage() {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'recommendations'>('matches');

  useEffect(() => {
    if (user) {
      loadMatches();
      loadRecommendations();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const matchesData = await matchesService.getUserMatches(user.id);
      setMatches(matchesData);
    } catch (err: any) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const recommendationsData = await matchesService.getRecommendations(user.id);
      setRecommendations(recommendationsData);
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
    }
  };

  const handleMatchAction = async (matchId: string, status: string) => {
    try {
      await matchesService.updateMatchStatus(matchId, status);
      // Reload matches after action
      await loadMatches();
    } catch (err: any) {
      console.error('Failed to update match status:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-8">
        <div className="container-app mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Please log in to view your matches.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-8">
        <div className="container-app mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading matches...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Eşleşmeler & Öneriler</h1>
          <p className="text-gray-600">İlgi alanlarınızı paylaşan profesyonellerle bağlantı kurun</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'matches' | 'recommendations')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Eşleşmelerim ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Öneriler ({recommendations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-6">
            <MatchesList matches={matches} onMatchAction={handleMatchAction} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <RecommendationsList recommendations={recommendations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Matches List Component
function MatchesList({ matches, onMatchAction }: { matches: any[]; onMatchAction: (matchId: string, status: string) => void }) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
        <p className="text-gray-600 mb-4">Complete your profile and join events to get matched with other professionals.</p>
        <a href="/events" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block">
          Browse Events
        </a>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map(match => (
        <MatchCard key={match.id} match={match} onAction={onMatchAction} />
      ))}
    </div>
  );
}

// Recommendations List Component
function RecommendationsList({ recommendations }: { recommendations: any[] }) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
        <p className="text-gray-600">Complete your profile to get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map(user => (
        <RecommendationCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// Match Card Component
function MatchCard({ match, onAction }: { match: any; onAction: (matchId: string, status: string) => void }) {
  const otherUser = match.user1?.id === match.currentUserId ? match.user2 : match.user1;

  const getStatusBadge = (status: string) => {
    const badges = {
      accepted: { variant: 'default' as const, className: 'bg-green-500', text: 'Kabul Edildi' },
      rejected: { variant: 'destructive' as const, className: '', text: 'Reddedildi' },
      connected: { variant: 'default' as const, className: 'bg-blue-500', text: 'Bağlı' },
      pending: { variant: 'secondary' as const, className: '', text: 'Bekliyor' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const statusBadge = getStatusBadge(match.status);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser?.profilePhoto} />
              <AvatarFallback className="bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] text-white">
                {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {otherUser?.firstName} {otherUser?.lastName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {otherUser?.company || 'Şirket belirtilmemiş'}
              </CardDescription>
            </div>
          </div>
          <Badge className={statusBadge.className} variant={statusBadge.variant}>
            {statusBadge.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Score with AI Icon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Star className="h-4 w-4 text-[#F59E0B]" />
              Eşleşme Skoru
            </span>
            <span className="text-sm font-bold text-[#0EA5E9]">{match.score || 85}%</span>
          </div>
          <Progress value={match.score || 85} className="h-2" />
        </div>

        {/* Location */}
        {otherUser?.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-[#10B981]" />
            {otherUser.location}
          </div>
        )}

        {/* Match Reasons */}
        {match.matchReasons?.reasons && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
              Neden eşleşti:
            </p>
            <div className="flex flex-wrap gap-2">
              {match.matchReasons.reasons.slice(0, 3).map((reason: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-[#8B5CF6]/10 text-[#8B5CF6]">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {match.status === 'pending' ? (
            <>
              <Button
                onClick={() => {
                  onAction(match.id, 'accepted');
                  toast.success('Eşleşme kabul edildi!');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Check className="h-4 w-4 mr-1" />
                Kabul Et
              </Button>
              <Button
                onClick={() => {
                  onAction(match.id, 'rejected');
                  toast.error('Eşleşme reddedildi');
                }}
                variant="destructive"
                className="flex-1"
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Reddet
              </Button>
            </>
          ) : match.status === 'accepted' || match.status === 'connected' ? (
            <Link to={`/messages?user=${otherUser?.id}`} className="flex-1">
              <Button className="w-full" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                Mesaj Gönder
              </Button>
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

// Recommendation Card Component
function RecommendationCard({ user }: { user: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profilePhoto} />
            <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#0EA5E9] text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {user?.firstName} {user?.lastName}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {user?.company || 'Şirket belirtilmemiş'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        {user?.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-[#10B981]" />
            {user.location}
          </div>
        )}

        {/* Industries */}
        {user?.industries && user.industries.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Sektörler:</p>
            <div className="flex flex-wrap gap-2">
              {user.industries.slice(0, 3).map((industry: string) => (
                <Badge key={industry} variant="secondary" className="bg-blue-100 text-blue-800">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {user?.interests && user.interests.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">İlgi Alanları:</p>
            <div className="flex flex-wrap gap-2">
              {user.interests.slice(0, 3).map((interest: string) => (
                <Badge key={interest} variant="secondary" className="bg-purple-100 text-purple-800">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Connect Button */}
        <Button className="w-full" size="sm">
          <Users className="h-4 w-4 mr-1" />
          Bağlantı Kur
        </Button>
      </CardContent>
    </Card>
  );
}

