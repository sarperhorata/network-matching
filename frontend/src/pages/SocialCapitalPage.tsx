import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Trophy, TrendingUp, Users, Star, Award, Target } from 'lucide-react';

export default function SocialCapitalPage() {
  const [score, setScore] = useState({
    totalScore: 72,
    rank: 'Connector',
    level: 8,
    nextLevelAt: 80,
    breakdown: {
      connectionsScore: 18,
      diversityScore: 22,
      engagementScore: 20,
      reliabilityScore: 12,
    },
    badges: ['First Connection', 'Rising Networker', 'Meeting Master'],
  });

  const [leaderboard, setLeaderboard] = useState([
    { user: { firstName: 'Ahmet', lastName: 'Y.', company: 'Tech Corp' }, totalScore: 95, rank: 'Maven' },
    { user: { firstName: 'Ayşe', lastName: 'K.', company: 'Startup Inc' }, totalScore: 88, rank: 'Influencer' },
    { user: { firstName: 'Mehmet', lastName: 'D.', company: 'Finance Ltd' }, totalScore: 79, rank: 'Influencer' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#FEF3C7] to-[#E0E7FF] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-[#8B5CF6]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Social Capital Score</CardTitle>
                <p className="text-gray-600">Network değerini ölç ve liderlikte yüksel!</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Score Card */}
        <Card className="border-2 border-[#8B5CF6]">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white">
                <div>
                  <div className="text-4xl font-bold">{score.totalScore}</div>
                  <div className="text-sm">/ 100</div>
                </div>
              </div>

              <div>
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]">
                  {score.rank}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">Level {score.level}</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span>Next Level</span>
                  <span>{score.nextLevelAt} points</span>
                </div>
                <Progress value={(score.totalScore / score.nextLevelAt) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0EA5E9]" />
                Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.breakdown.connectionsScore}/25</div>
              <Progress value={(score.breakdown.connectionsScore / 25) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#10B981]" />
                Diversity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.breakdown.diversityScore}/25</div>
              <Progress value={(score.breakdown.diversityScore / 25) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-[#F59E0B]" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.breakdown.engagementScore}/25</div>
              <Progress value={(score.breakdown.engagementScore / 25) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-[#8B5CF6]" />
                Reliability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.breakdown.reliabilityScore}/25</div>
              <Progress value={(score.breakdown.reliabilityScore / 25) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Kazanılan Rozetler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {score.badges.map((badge) => (
                <Badge key={badge} variant="outline" className="px-4 py-2 text-sm border-2 border-[#8B5CF6]">
                  🏆 {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#F59E0B]" />
              Liderlik Tablosu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-[#8B5CF6]/10 hover:to-[#EC4899]/10 transition-colors"
                >
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white">
                      {entry.user.firstName[0]}{entry.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.user.firstName} {entry.user.lastName}</p>
                    <p className="text-sm text-gray-600">{entry.user.company}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#8B5CF6]">{entry.totalScore}</div>
                    <Badge variant="secondary" className="text-xs">{entry.rank}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

