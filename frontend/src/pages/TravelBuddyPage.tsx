import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Plane, MapPin, Users, Car, Utensils, Camera } from 'lucide-react';

export default function TravelBuddyPage() {
  const [travelInfo, setTravelInfo] = useState({
    departureCity: '',
    arrivalDate: '',
    flightNumber: '',
    lookingForRoommate: false,
    needsTransport: false,
    interestedInDinner: false,
    interestedInCityTour: false,
  });

  const [matches, setMatches] = useState([
    {
      user: { firstName: 'Ayşe', lastName: 'K.', company: 'Startup Inc' },
      matchType: 'same_flight',
      details: 'Same flight: TK123',
      similarity: 100,
    },
    {
      user: { firstName: 'Mehmet', lastName: 'D.', company: 'Tech Corp' },
      matchType: 'same_day',
      details: 'Arriving same day',
      similarity: 90,
    },
  ]);

  const getMatchIcon = (type: string) => {
    switch (type) {
      case 'same_flight': return <Plane className="h-4 w-4" />;
      case 'accommodation': return <MapPin className="h-4 w-4" />;
      case 'transport': return <Car className="h-4 w-4" />;
      case 'dinner': return <Utensils className="h-4 w-4" />;
      case 'city_tour': return <Camera className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E0E7FF] to-[#FEF3C7] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-[#0EA5E9]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#0EA5E9] to-[#10B981] rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Event Travel Buddy ✈️</CardTitle>
                <p className="text-gray-600 mt-1">
                  Aynı şehire giden profesyonellerle tanış - Uçuştan sohbete! 🌍
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Travel Info Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seyahat Bilgilerin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Kalkış Şehri</Label>
                  <Input
                    placeholder="örn: Istanbul"
                    value={travelInfo.departureCity}
                    onChange={(e) => setTravelInfo({ ...travelInfo, departureCity: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Varış Tarihi</Label>
                  <Input
                    type="date"
                    value={travelInfo.arrivalDate}
                    onChange={(e) => setTravelInfo({ ...travelInfo, arrivalDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Uçuş Numarası (opsiyonel)</Label>
                  <Input
                    placeholder="örn: TK123"
                    value={travelInfo.flightNumber}
                    onChange={(e) => setTravelInfo({ ...travelInfo, flightNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Oda arkadaşı arıyorum</Label>
                    <Switch
                      checked={travelInfo.lookingForRoommate}
                      onCheckedChange={(checked) => setTravelInfo({ ...travelInfo, lookingForRoommate: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Ulaşım paylaşımı isterim</Label>
                    <Switch
                      checked={travelInfo.needsTransport}
                      onCheckedChange={(checked) => setTravelInfo({ ...travelInfo, needsTransport: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Akşam yemeği ilgim var</Label>
                    <Switch
                      checked={travelInfo.interestedInDinner}
                      onCheckedChange={(checked) => setTravelInfo({ ...travelInfo, interestedInDinner: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Şehir turu isterim</Label>
                    <Switch
                      checked={travelInfo.interestedInCityTour}
                      onCheckedChange={(checked) => setTravelInfo({ ...travelInfo, interestedInCityTour: checked })}
                    />
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#10B981]">
                  Kaydet ve Eşleştir
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Travel Matches */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Seyahat Arkadaşların ({matches.length})
            </h3>

            {matches.map((match, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-[#0EA5E9] to-[#10B981] text-white">
                        {match.user.firstName[0]}{match.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="font-semibold">{match.user.firstName} {match.user.lastName}</p>
                      <p className="text-sm text-gray-600">{match.user.company}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {getMatchIcon(match.matchType)}
                          <span className="ml-1">{match.details}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {match.similarity}% match
                        </Badge>
                      </div>
                    </div>

                    <Button size="sm">Mesaj Gönder</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

