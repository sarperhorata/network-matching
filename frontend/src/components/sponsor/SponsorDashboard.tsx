import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventsService } from '../../services/events.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Award,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  DollarSign,
  BarChart3,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface SponsorDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SponsorDashboard({ onNavigate }: SponsorDashboardProps) {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsoredEvents, setSponsoredEvents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'sponsor') {
      toast.error('Sponsor yetkisi gerekli');
      onNavigate('dashboard');
      return;
    }
    loadSponsorData();
  }, []);

  const loadSponsorData = async () => {
    try {
      // Load all events (in a real app, we'd filter by sponsorId)
      const allEvents = await eventsService.getEvents();
      
      // Simulate sponsored events (in production, backend would filter these)
      const sponsored = allEvents.slice(0, 3).map(event => ({
        ...event,
        sponsorshipLevel: 'Gold',
        impressions: Math.floor(Math.random() * 5000) + 1000,
        engagement: Math.floor(Math.random() * 500) + 100,
        leads: Math.floor(Math.random() * 50) + 10,
        roi: (Math.random() * 300 + 100).toFixed(1),
      }));

      setSponsoredEvents(sponsored);

      // Calculate analytics
      const totalImpressions = sponsored.reduce((sum, e) => sum + e.impressions, 0);
      const totalEngagement = sponsored.reduce((sum, e) => sum + e.engagement, 0);
      const totalLeads = sponsored.reduce((sum, e) => sum + e.leads, 0);
      const avgROI = sponsored.length > 0 
        ? (sponsored.reduce((sum, e) => sum + parseFloat(e.roi), 0) / sponsored.length).toFixed(1)
        : '0';

      setAnalytics({
        totalSponsored: sponsored.length,
        totalImpressions,
        totalEngagement,
        totalLeads,
        avgROI,
        activeEvents: sponsored.filter(e => new Date(e.endDate) > new Date()).length,
      });

    } catch (error: any) {
      console.error('Failed to load sponsor data:', error);
      toast.error(error.message || 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  const COLORS = ['#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6'];

  const engagementData = sponsoredEvents.map(event => ({
    name: event.title.substring(0, 20) + '...',
    impressions: event.impressions,
    engagement: event.engagement,
    leads: event.leads,
  }));

  const sponsorshipData = [
    { name: 'Gold', value: sponsoredEvents.filter(e => e.sponsorshipLevel === 'Gold').length },
    { name: 'Silver', value: sponsoredEvents.filter(e => e.sponsorshipLevel === 'Silver').length },
    { name: 'Bronze', value: sponsoredEvents.filter(e => e.sponsorshipLevel === 'Bronze').length },
  ].filter(item => item.value > 0);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Award className="h-8 w-8 text-[#F59E0B]" />
        <div>
          <h1 className="text-3xl">Sponsor Paneli</h1>
          <p className="text-gray-600">Sponsorluk performansınızı izleyin</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sponsorlu Etkinlik</p>
                <p className="text-2xl font-bold">{analytics?.totalSponsored || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  {analytics?.activeEvents} aktif
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Gösterim</p>
                <p className="text-2xl font-bold">
                  {(analytics?.totalImpressions || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Son 30 gün</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Etkileşim</p>
                <p className="text-2xl font-bold">
                  {(analytics?.totalEngagement || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics?.totalImpressions > 0 
                    ? ((analytics.totalEngagement / analytics.totalImpressions) * 100).toFixed(1) 
                    : 0}% oranı
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Lead</p>
                <p className="text-2xl font-bold">{analytics?.totalLeads || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  Ort. ROI: %{analytics?.avgROI}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Performansı</CardTitle>
            <CardDescription>Gösterim, etkileşim ve lead karşılaştırması</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="impressions" fill="#0EA5E9" name="Gösterim" />
                <Bar dataKey="engagement" fill="#F59E0B" name="Etkileşim" />
                <Bar dataKey="leads" fill="#10B981" name="Lead" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sponsorluk Seviyeleri</CardTitle>
            <CardDescription>Etkinliklerin sponsorluk dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sponsorshipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sponsorshipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sponsored Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsorlu Etkinlikler</CardTitle>
          <CardDescription>Tüm sponsorluk detaylarınız</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etkinlik</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Katılımcı</TableHead>
                <TableHead>Gösterim</TableHead>
                <TableHead>Etkileşim</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsoredEvents.map((event) => {
                const isPast = new Date(event.endDate) < new Date();
                
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          event.sponsorshipLevel === 'Gold' ? 'default' :
                          event.sponsorshipLevel === 'Silver' ? 'secondary' : 'outline'
                        }
                      >
                        {event.sponsorshipLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(event.startDate).toLocaleDateString('tr-TR')}
                        {isPast && <Badge variant="secondary" className="ml-2 text-xs">Bitti</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{event.participants?.length || 0}</TableCell>
                    <TableCell>{event.impressions.toLocaleString()}</TableCell>
                    <TableCell>{event.engagement.toLocaleString()}</TableCell>
                    <TableCell>{event.leads}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      %{event.roi}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('event-detail', event.id)}
                      >
                        Detaylar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('events')}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Calendar className="h-12 w-12 text-[#0EA5E9]" />
              <h3 className="font-semibold">Yeni Etkinlik Sponsorluğu</h3>
              <p className="text-sm text-gray-600">Sponsor olabileceğiniz etkinlikleri keşfedin</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <BarChart3 className="h-12 w-12 text-[#F59E0B]" />
              <h3 className="font-semibold">Detaylı Analitik</h3>
              <p className="text-sm text-gray-600">Derinlemesine performans raporları</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('messages')}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Users className="h-12 w-12 text-[#10B981]" />
              <h3 className="font-semibold">Organizatörlerle İletişim</h3>
              <p className="text-sm text-gray-600">Etkinlik organizatörleri ile görüşün</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
