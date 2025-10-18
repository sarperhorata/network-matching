import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Zap, Calendar, MessageCircle, BarChart3, Award } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

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
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Profesyonel Networkingin Geleceği
              </h1>
              <p className="text-xl text-white/90">
                Yapay zeka destekli platformumuzla anlamlı iş bağlantıları kurun, 
                etkinliklere katılın ve kariyerinizi bir üst seviyeye taşıyın.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" variant="secondary">
                      Dashboard'a Git
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" variant="secondary">
                        Ücretsiz Başlayın
                      </Button>
                    </Link>
                    <Link to="/events">
                      <Button size="lg" className="bg-white text-[#0A2540] hover:bg-gray-100">
                        Etkinlikleri Keşfet
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop"
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
            <h2 className="text-4xl font-bold mb-4">Güçlü Özellikler</h2>
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
            <h2 className="text-4xl font-bold mb-4">Nasıl Çalışır?</h2>
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
                <div className="w-16 h-16 bg-gradient-to-br from-[#0A2540] via-[#0EA5E9] to-[#F59E0B] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Platform İstatistikleri</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '85%', label: 'Eşleşme Doğruluğu' },
              { number: '10x', label: 'Daha Fazla Bağlantı' },
              { number: '95%', label: 'Kullanıcı Memnuniyeti' },
              { number: '50+', label: 'Başarılı Etkinlik' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-[#0EA5E9] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#0A2540] to-[#0EA5E9] text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Networkinginizi Bugün Başlatın</h2>
          <p className="text-xl mb-8 text-white/90">
            Binlerce profesyonel zaten Oniki ile bağlantı kuruyor
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Ücretsiz Hesap Oluştur
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2540] text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Oniki.net</h3>
              <p className="text-gray-400">
                AI-powered professional networking platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/events" className="hover:text-white transition">Etkinlikler</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Kayıt Ol</Link></li>
                <li><a href="#" className="hover:text-white transition">Fiyatlandırma</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Kariyer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white transition">İletişim</a></li>
                <li><a href="#" className="hover:text-white transition">Gizlilik</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2025 Oniki.net. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

