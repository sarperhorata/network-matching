import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Zap, Calendar, MessageCircle, BarChart3, Award, Database } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Logo } from '../layout/Logo';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [seeding, setSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    if (!confirm('Veritabanına örnek veriler eklensin mi? Bu işlem mevcut örnek verilerin üzerine yazabilir.')) {
      return;
    }

    setSeeding(true);
    try {
      const result = await api.seedDatabase();
      const summary = result.summary;
      toast.success(
        `Başarılı! ${summary.users} kullanıcı, ${summary.events} etkinlik, ${summary.matches || 0} eşleşme, ` +
        `${summary.conversations || 0} konuşma ve ${summary.meetings || 0} toplantı eklendi.`
      );
    } catch (error: any) {
      toast.error('Veri ekleme başarısız: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  const features = [
    {
      icon: <Zap className="h-10 w-10 text-[#0EA5E9]" />,
      title: 'Yapay Zeka Destekli Eşleştirme',
      description: 'Akıllı algoritma ile sektör, ilgi alanları ve hedeflerinize göre anlamlı bağlantılar kurun.',
    },
    {
      icon: <Calendar className="h-10 w-10 text-[#F59E0B]" />,
      title: 'Etkinlik Yönetimi',
      description: 'Etkinlikleri keşfedin, katılın ve QR kod ile hızlı check-in yapın.',
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-[#10B981]" />,
      title: 'Gerçek Zamanlı Mesajlaşma',
      description: 'Eşleştiğiniz profesyonellerle anında iletişime geçin.',
    },
    {
      icon: <Users className="h-10 w-10 text-[#0A2540]" />,
      title: 'Toplantı Planlama',
      description: 'Kolayca toplantı planlayın ve networkinginizi organize edin.',
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-[#8B5CF6]" />,
      title: 'Analitik Dashboard',
      description: 'Network büyümenizi ve etkinlik performansınızı takip edin.',
    },
    {
      icon: <Award className="h-10 w-10 text-[#0EA5E9]" />,
      title: 'White Label Destek',
      description: 'Platformu kendi markanız altında kullanın.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0A2540] via-[#0EA5E9] to-[#F59E0B] text-white py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl">
                Profesyonel Networkingin Geleceği
              </h1>
              <p className="text-xl text-white/90">
                Yapay zeka destekli platformumuzla anlamlı iş bağlantıları kurun, 
                etkinliklere katılın ve kariyerinizi bir üst seviyeye taşıyın.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => onNavigate('signup')}
                >
                  Ücretsiz Başlayın
                </Button>
                <Button 
                  size="lg" 
                  className="bg-white text-[#0A2540] hover:bg-gray-100"
                  onClick={() => onNavigate('events')}
                >
                  Etkinlikleri Keşfet
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758599543114-248f7211fddd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBwcm9mZXNzaW9uYWxzfGVufDF8fHx8MTc2MDcxMzg5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Professional networking"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Güçlü Özellikler</h2>
            <p className="text-xl text-gray-600">
              Network sürecinizi optimize etmek için ihtiyacınız olan her şey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-[#0EA5E9] transition-colors">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Nasıl Çalışır?</h2>
            <p className="text-xl text-gray-600">
              Sadece 4 adımda anlamlı bağlantılar kurun
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Kayıt Olun', desc: 'Profilinizi oluşturun ve ilgi alanlarınızı belirleyin' },
              { step: '2', title: 'Etkinlik Seçin', desc: 'İlginizi çeken etkinliklere katılın' },
              { step: '3', title: 'Eşleşin', desc: 'Yapay zeka ile uyumlu profesyonellerle tanışın' },
              { step: '4', title: 'Bağlantı Kurun', desc: 'Mesajlaşın ve toplantı planlayın' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0A2540] via-[#0EA5E9] to-[#F59E0B] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {item.step}
                </div>
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#0A2540] to-[#0EA5E9] text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl mb-4">Networkinginizi Bugün Başlatın</h2>
          <p className="text-xl mb-8 text-white/90">
            Binlerce profesyonel zaten oniki ile bağlantı kuruyor
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => onNavigate('signup')}
          >
            Ücretsiz Hesap Oluştur
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2540] text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Logo size="md" variant="white" showText={true} />
          </div>
          <p className="text-gray-400 mb-6">
            © 2025 oniki. Tüm hakları saklıdır.
          </p>
          
          {/* Developer Tool - Seed Database */}
          <div className="border-t border-gray-700 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/20"
            >
              <Database className="h-4 w-4 mr-2" />
              {seeding ? 'Ekleniyor...' : 'Demo Veri Ekle (Geliştirici)'}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
