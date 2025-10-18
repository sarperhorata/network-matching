import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService } from '../../services/analytics.service';
import { eventsService } from '../../services/events.service';
import { usersService } from '../../services/users.service';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Users,
  Calendar,
  MessageCircle,
  TrendingUp,
  Ban,
  CheckCircle,
  Trash2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin yetkisi gerekli');
      onNavigate('dashboard');
      return;
    }
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [analyticsRes, usersRes, eventsRes] = await Promise.all([
        analyticsService.getGlobalAnalytics(),
        usersService.getAllUsers(),
        eventsService.getEvents(),
      ]);

      setAnalytics(analyticsRes);
      setUsers(usersRes || []);
      setEvents(eventsRes || []);
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      toast.error(error.message || 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, status: 'active' | 'banned') => {
    try {
      await usersService.updateUser(userId, { status });
      toast.success(`Kullanıcı durumu güncellendi: ${status === 'active' ? 'Aktif' : 'Yasaklandı'}`);
      loadAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Durum güncellenemedi');
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;

    try {
      await eventsService.deleteEvent(deleteEventId);
      toast.success('Etkinlik silindi');
      setDeleteEventId(null);
      loadAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Etkinlik silinemedi');
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      participant: { label: 'Katılımcı', variant: 'secondary' as const },
      organizer: { label: 'Organizatör', variant: 'default' as const },
      sponsor: { label: 'Sponsor', variant: 'outline' as const },
      admin: { label: 'Admin', variant: 'destructive' as const },
    };
    const { label, variant } = config[role as keyof typeof config] || config.participant;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const COLORS = ['#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  const userRoleData = analytics?.usersByRole ? Object.entries(analytics.usersByRole).map(([name, value]) => ({
    name: name === 'participant' ? 'Katılımcı' : 
          name === 'organizer' ? 'Organizatör' : 
          name === 'sponsor' ? 'Sponsor' : 'Admin',
    value
  })) : [];

  const eventCategoryData = analytics?.eventsByCategory ? Object.entries(analytics.eventsByCategory).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl">Admin Paneli</h1>
          <p className="text-gray-600">Platform yönetimi ve istatistikleri</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Etkinlik</p>
                <p className="text-2xl font-bold">{analytics?.totalEvents || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Eşleşme</p>
                <p className="text-2xl font-bold">{analytics?.totalMatches || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Toplantı</p>
                <p className="text-2xl font-bold">{analytics?.totalMeetings || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Konuşma</p>
                <p className="text-2xl font-bold">{analytics?.totalConversations || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Rolleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Kategorileri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Users and Events */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Kullanıcılar ({users.length})</TabsTrigger>
          <TabsTrigger value="events">Etkinlikler ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
              <CardDescription>Tüm kullanıcıları görüntüle ve yönet</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Sektör</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.profileImage} />
                            <AvatarFallback>{u.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell>{u.industry || '-'}</TableCell>
                      <TableCell>
                        {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {u.status === 'banned' ? (
                          <Badge variant="destructive">Yasaklı</Badge>
                        ) : (
                          <Badge variant="outline">Aktif</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {u.status !== 'banned' && u.id !== user?.id && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUserStatusChange(u.id, 'banned')}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Yasakla
                            </Button>
                          )}
                          {u.status === 'banned' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserStatusChange(u.id, 'active')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aktifleştir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etkinlik Yönetimi</CardTitle>
              <CardDescription>Tüm etkinlikleri görüntüle ve yönet</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Organizatör</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Katılımcı</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <Badge>{event.category}</Badge>
                      </TableCell>
                      <TableCell>{event.organizerId}</TableCell>
                      <TableCell>
                        {new Date(event.startDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {event.participants?.length || 0} / {event.capacity}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('event-detail', event.id)}
                          >
                            Görüntüle
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteEventId(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Etkinliği Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
