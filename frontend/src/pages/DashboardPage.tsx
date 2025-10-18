import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { analyticsService, type UserAnalytics } from '../services/analytics.service';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Calendar, Users, MessageCircle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await analyticsService.getUserAnalytics(user.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Katıldığım Etkinlikler',
      value: analytics?.eventsAttended || 0,
      icon: <Calendar className="h-6 w-6 text-[#0EA5E9]" />,
      color: 'bg-[#0EA5E9]/10',
      link: '/events',
    },
    {
      title: 'Toplam Eşleşme',
      value: analytics?.totalMatches || 0,
      icon: <Users className="h-6 w-6 text-[#8B5CF6]" />,
      color: 'bg-[#8B5CF6]/10',
      link: '/matches',
    },
    {
      title: 'Kabul Edilen Eşleşmeler',
      value: (analytics as any)?.acceptedMatches || 0,
      icon: <TrendingUp className="h-6 w-6 text-[#10B981]" />,
      color: 'bg-[#10B981]/10',
      link: '/matches',
    },
    {
      title: 'Toplantı Sayısı',
      value: analytics?.totalMeetings || 0,
      icon: <MessageCircle className="h-6 w-6 text-[#F59E0B]" />,
      color: 'bg-[#F59E0B]/10',
      link: '/meetings',
    },
  ];

  // Sample data for charts
  const activityData = [
    { month: 'Oca', etkinlik: 2, eşleşme: 3, toplantı: 2 },
    { month: 'Şub', etkinlik: 3, eşleşme: 5, toplantı: 3 },
    { month: 'Mar', etkinlik: 1, eşleşme: 4, toplantı: 2 },
    { month: 'Nis', etkinlik: 4, eşleşme: 8, toplantı: 5 },
    { month: 'May', etkinlik: 2, eşleşme: 6, toplantı: 4 },
    { month: 'Haz', etkinlik: 3, eşleşme: 7, toplantı: 6 },
  ];

  const matchStatusData = [
    { name: 'Kabul Edildi', value: (analytics as any)?.acceptedMatches || 0, color: '#10b981' },
    { name: 'Beklemede', value: (analytics?.totalMatches || 0) - ((analytics as any)?.acceptedMatches || 0), color: '#f59e0b' },
  ];

  const interactionData = [
    { name: 'Pzt', value: 12 },
    { name: 'Sal', value: 19 },
    { name: 'Çar', value: 15 },
    { name: 'Per', value: 22 },
    { name: 'Cum', value: 18 },
    { name: 'Cmt', value: 8 },
    { name: 'Paz', value: 5 },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Hoş geldin, {user?.firstName || 'Kullanıcı'}!
          </h1>
          <p className="text-gray-600">
            Network aktivitelerinize genel bakış
          </p>
        </div>

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
                <span>{(analytics as any)?.profileCompletion || 70}%</span>
              </div>
              <Progress value={(analytics as any)?.profileCompletion || 70} />
              {((analytics as any)?.profileCompletion || 70) < 100 && (
                <Link to="/profile" className="text-sm text-[#0EA5E9] hover:underline inline-block">
                  Profili Tamamla →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Eylemler</CardTitle>
            <CardDescription>Ne yapmak istersiniz?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/events"
                className="p-6 border-2 rounded-lg hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-all text-left"
              >
                <Calendar className="h-8 w-8 text-[#0EA5E9] mb-2" />
                <h3 className="font-semibold mb-1">Etkinlikleri Keşfet</h3>
                <p className="text-sm text-gray-600">
                  Yeni etkinliklere katılın
                </p>
              </Link>

              <Link
                to="/matches"
                className="p-6 border-2 rounded-lg hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-all text-left"
              >
                <Users className="h-8 w-8 text-[#8B5CF6] mb-2" />
                <h3 className="font-semibold mb-1">Eşleşmeleri Gör</h3>
                <p className="text-sm text-gray-600">
                  Yeni profesyonellerle tanışın
                </p>
              </Link>

              <Link
                to="/messages"
                className="p-6 border-2 rounded-lg hover:border-[#10B981] hover:bg-[#10B981]/10 transition-all text-left"
              >
                <MessageCircle className="h-8 w-8 text-[#10B981] mb-2" />
                <h3 className="font-semibold mb-1">Mesajlar</h3>
                <p className="text-sm text-gray-600">
                  Bağlantılarınızla sohbet edin
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivite Trendi</CardTitle>
              <CardDescription>Son 6 aylık aktivite geçmişiniz</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="etkinlik" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="eşleşme" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="toplantı" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Etkinlik</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#8B5CF6] rounded" />
                  <span>Eşleşme</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#10B981] rounded" />
                  <span>Toplantı</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Interaction */}
          <Card>
            <CardHeader>
              <CardTitle>Haftalık Etkileşimler</CardTitle>
              <CardDescription>Günlük platform kullanımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={interactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Match Status & Recent Activity */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Eşleşme Durumu</CardTitle>
              <CardDescription>Eşleşme dağılımınız</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={matchStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {matchStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {matchStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>Platformdaki son hareketleriniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-[#0EA5E9]/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-[#0EA5E9] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Yeni etkinliğe katıldınız</p>
                    <p className="text-xs text-gray-600">İstanbul Teknoloji Zirvesi - 2 saat önce</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#8B5CF6]/10 rounded-lg">
                  <Users className="h-5 w-5 text-[#8B5CF6] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">5 yeni eşleşme önerisi</p>
                    <p className="text-xs text-gray-600">AI & Machine Learning Meetup için - 5 saat önce</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#10B981]/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-[#10B981] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Yeni mesajınız var</p>
                    <p className="text-xs text-gray-600">Ayşe Özkan'dan mesaj - 1 gün önce</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

