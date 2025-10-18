import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Sparkles, Users, Heart, MessageCircle } from 'lucide-react';

export default function SerendipityPage() {
  const [matches, setMatches] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#FEF3C7] to-[#FECACA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-[#F59E0B] bg-gradient-to-r from-white to-[#FEF3C7]/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#F59E0B] to-[#EF4444] rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Serendipity Mode 🌈</CardTitle>
                <p className="text-gray-600 mt-1">
                  Balonunun dışına çık! Tamamen farklı sektörlerden insanlarla tanış.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Yaratıcı Çarpışma Teorisi:</strong> Çeşitli network = İnovasyon
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-[#FEF3C7] to-[#FECACA] border-none">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#F59E0B] mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Serendipity Nedir?</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Stanford araştırmaları gösteriyor ki, en inovatif fikirler farklı alanlardan insanların kesişiminde doğuyor. 
                  Apple + Fashion = ? 🍎👗 Tech + Healthcare = ? 💊💻
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Serendipity Mode</strong> kasıtlı olarak seni farklı sektörlerden profesyonellerle eşleştiriyor!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#F59E0B]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#EF4444] text-white">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">John Doe</CardTitle>
                      <p className="text-sm text-gray-600">Fashion Designer</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white border-none">
                    85% Serendipity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Completely different industries: Technology × Fashion
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    1 shared interest: Sustainability
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    🌈 Step outside your bubble!
                  </Badge>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button className="flex-1 bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6]">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Profili Gör
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

