import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Zap, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SpeedDatingPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [currentPairing, setCurrentPairing] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const getRoundProgress = () => {
    if (!currentPairing) return 0;
    return ((currentPairing.round / currentPairing.totalRounds) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F0F9FF] to-[#FEF3C7] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-[#0EA5E9]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Business Speed Networking</CardTitle>
                <CardDescription>
                  5-dakikalık yapılandırılmış görüşmeler - Maksimum verim!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Current Round */}
        {currentPairing && (
          <Card className="border-2 border-[#0EA5E9]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Round {currentPairing.round} / {currentPairing.totalRounds}
                </CardTitle>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {timeRemaining} dakika kaldı
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>İlerleme</span>
                    <span>{Math.round(getRoundProgress())}%</span>
                  </div>
                  <Progress value={getRoundProgress()} className="h-2" />
                </div>

                {/* Current Partner */}
                {currentPairing.pairing && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#0EA5E9]/10 to-[#8B5CF6]/10 rounded-lg">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={currentPairing.pairing.user?.profilePhoto} />
                      <AvatarFallback className="bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] text-white">
                        {currentPairing.pairing.user?.firstName?.[0]}
                        {currentPairing.pairing.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {currentPairing.pairing.user?.firstName} {currentPairing.pairing.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{currentPairing.pairing.user?.position}</p>
                      <p className="text-sm text-gray-500">{currentPairing.pairing.user?.company}</p>
                    </div>
                    <Button>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      İlgi işaretle
                    </Button>
                  </div>
                )}

                {/* Tips */}
                <div className="p-4 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">💡 Hızlı İpuçları:</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Kendinizi 30 saniyede tanıtın</li>
                    <li>• Ne aradığınızı net söyleyin</li>
                    <li>• LinkedIn değiş tokuşu yapın</li>
                    <li>• İlgi duyarsanız "İlgi işaretle" butonuna basın</li>
                    <li>• Sonra mutual match'ler birbirine bağlanır!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Session Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Toplam Round</p>
                <p className="text-xl font-semibold">10 round</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Round Süresi</p>
                <p className="text-xl font-semibold">5 dakika</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Katılımcı</p>
                <p className="text-xl font-semibold">24 kişi</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Görüşme</p>
                <p className="text-xl font-semibold">12 kişi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

