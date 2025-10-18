import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Settings, User, Bell, Lock, Palette, Mail } from 'lucide-react';
import TenantThemeSwitcher from '../components/TenantThemeSwitcher';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Ayarlarınızı görmek için lütfen giriş yapın.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8 text-[#0EA5E9]" />
            Ayarlar
          </h1>
          <p className="text-gray-600">
            Hesap ve platform tercihlerinizi yönetin
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Hesap</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Bildirimler</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Gizlilik</span>
            </TabsTrigger>
            {(user.role === 'admin' || user.role === 'organizer') && (
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Hesap Bilgileri</CardTitle>
                <CardDescription>
                  Email adresinizi ve şifrenizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Adresi</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email değişikliği için destek ekibiyle iletişime geçin.
                  </p>
                </div>

                <Separator />

                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Şifre Değiştir</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mevcut Şifre</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Yeni Şifre</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <Button onClick={() => toast.success('Şifre güncelleme özelliği yakında!')}>
                    Şifreyi Güncelle
                  </Button>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-red-600">Tehlikeli Bölge</h3>
                  <p className="text-sm text-gray-600">
                    Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz.
                  </p>
                  <Button variant="destructive" size="sm">
                    Hesabı Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Tercihleri</CardTitle>
                <CardDescription>
                  Hangi bildirimleri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Yeni Eşleşme Bildirimleri</Label>
                      <p className="text-sm text-gray-500">
                        Yeni bir eşleşme bulunduğunda bildirim al
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mesaj Bildirimleri</Label>
                      <p className="text-sm text-gray-500">
                        Yeni mesaj geldiğinde bildirim al
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Etkinlik Hatırlatıcıları</Label>
                      <p className="text-sm text-gray-500">
                        Katılacağınız etkinlikler için hatırlatıcı
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Toplantı Bildirimleri</Label>
                      <p className="text-sm text-gray-500">
                        Toplantı davetleri ve hatırlatıcılar
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Bildirimleri</Label>
                      <p className="text-sm text-gray-500">
                        Önemli güncellemeler için email al
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button onClick={() => toast.success('Bildirim tercihleri kaydedildi!')}>
                  Tercihleri Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Gizlilik Ayarları</CardTitle>
                <CardDescription>
                  Profil görünürlüğünüzü ve gizlilik tercihlerinizi yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profil Görünürlüğü</Label>
                      <p className="text-sm text-gray-500">
                        Profiliniz diğer kullanıcılar tarafından görülebilir
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Eşleşme Önerileri Göster</Label>
                      <p className="text-sm text-gray-500">
                        Eşleşme önerilerinde görün
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>LinkedIn Profili Göster</Label>
                      <p className="text-sm text-gray-500">
                        LinkedIn profilinizi diğer kullanıcılara göster
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>İstatistikleri Paylaş</Label>
                      <p className="text-sm text-gray-500">
                        Network istatistiklerinizi profilde göster
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button onClick={() => toast.success('Gizlilik ayarları kaydedildi!')}>
                  Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab (Admin/Organizer only) */}
          {(user.role === 'admin' || user.role === 'organizer') && (
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-[#0EA5E9]" />
                    Branding & Theme Customization
                  </CardTitle>
                  <CardDescription>
                    White-label platformunuzu kendi markanıza göre özelleştirin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Integrate TenantThemeSwitcher Component! */}
                  <TenantThemeSwitcher 
                    tenantId={user.tenantId || 'default'} 
                    isAdmin={user.role === 'admin' || user.role === 'organizer'}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Email Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Tercihleri</CardTitle>
                <CardDescription>
                  Hangi email'leri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Email'leri</Label>
                      <p className="text-sm text-gray-500">
                        Yeni özellikler ve güncellemeler hakkında
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Haftalık Özet</Label>
                      <p className="text-sm text-gray-500">
                        Haftalık network aktiviteleriniz
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Etkinlik Önerileri</Label>
                      <p className="text-sm text-gray-500">
                        İlginizi çekebilecek etkinlikler
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button onClick={() => toast.success('Email tercihleri kaydedildi!')}>
                  Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

