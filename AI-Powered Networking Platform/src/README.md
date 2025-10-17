# oniki - Network Matchmaking Platform

Yapay zeka destekli, veri odaklı profesyonel network matchmaking platformu.

## 🚀 Özellikler

### ✅ MVP Özellikleri (Tamamlandı)

#### 1. Authentication & User Management
- ✅ Email/Şifre ile kayıt ve giriş sistemi
- ✅ OAuth altyapısı (Google ve LinkedIn için hazır)
- ✅ 4 Kullanıcı Rolü: Participant, Organizer, Sponsor, Admin
- ✅ Kapsamlı profil yönetimi
- ✅ Profil tamamlama göstergesi
- ✅ JWT token tabanlı kimlik doğrulama

#### 2. Event Management
- ✅ Etkinlik CRUD operasyonları
- ✅ 10+ kategori sistemi (Tech, Business, Healthcare, vb.)
- ✅ Katılım talep ve onay workflow'u
- ✅ QR kod check-in sistemi (backend hazır)
- ✅ Otomatik kapasite kontrolü
- ✅ Responsive tasarım

#### 3. AI-Powered Matching (v1)
- ✅ Kural tabanlı eşleştirme algoritması
- ✅ İş alanı, ilgi alanı ve hedeflere göre skor hesaplama (0-100)
- ✅ Eşleşme nedenleri açıklaması
- ✅ Günlük personalize öneriler
- ✅ Accept/Decline eşleşme sistemi

#### 4. Real-time Messaging
- ✅ 1-1 özel mesajlaşma
- ✅ Konuşma geçmişi
- ✅ Mesaj gönderme ve alma
- ⏳ WebSocket entegrasyonu (geliştirilecek)
- ⏳ Read receipts
- ⏳ Typing indicators

#### 5. Meeting Scheduler
- ✅ Backend API hazır
- ⏳ Frontend UI geliştirilecek
- ⏳ Tarih/saat/konum seçimi
- ⏳ Status workflow (pending, confirmed, completed)
- ⏳ iCal export

#### 6. Analytics Dashboard
- ✅ Kullanıcı istatistikleri (etkinlikler, eşleşmeler, toplantılar)
- ✅ Etkinlik analitiği (katılım, check-in oranları)
- ✅ Profil tamamlama takibi
- ✅ Real-time güncellemeler
- ✅ Görsel grafikler (Recharts ile area, bar, pie charts)
- ✅ Aktivite trend analizi
- ✅ Haftalık etkileşim gösterimi

#### 7. PWA Support
- ✅ Progressive Web App manifest
- ✅ Mobil ve desktop uyumlu
- ✅ Responsive tasarım
- ⏳ Offline support (geliştirilecek)
- ⏳ Push notifications (geliştirilecek)

## 🏗️ Teknik Mimari

### Frontend
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context API
- **Icons:** Lucide React

### Backend
- **Runtime:** Deno
- **Web Framework:** Hono
- **Database:** Supabase (KV Store)
- **Authentication:** Supabase Auth
- **API:** RESTful API

### Database Schema (KV Store)
```
user:{userId}                     -> User data
event:{eventId}                   -> Event data
organizer_events:{userId}         -> Array of event IDs
match:{matchId}                   -> Match data
conversation:{conversationId}     -> Conversation + messages
meeting:{meetingId}              -> Meeting data
```

## 📱 Kullanıcı Akışları

### Participant (Katılımcı)
1. ✅ Kayıt ol ve profili tamamla
2. ✅ Etkinliklere göz at ve katıl
3. ✅ Etkinlik için AI eşleştirmeler al
4. ✅ Eşleşmelerle mesajlaş
5. ⏳ Toplantı planla
6. ✅ Profil ve analitiği görüntüle

### Organizer (Organizatör)
1. ✅ Organizatör rolüyle kayıt ol
2. ✅ Yeni etkinlik oluştur
3. ✅ Katılım isteklerini onayla/reddet
4. ✅ Etkinlik analitiğini görüntüle
5. ⏳ Katılımcı eşleştirmelerini izle

## 🔧 Kurulum ve Demo Veriler

1. Proje Figma Make'de çalışmaktadır
2. Supabase bağlantısı yapılandırılmıştır
3. Tüm API endpoint'leri `/supabase/functions/server/index.tsx` içinde tanımlıdır

### Demo Verilerle Başlama

Platform demo verileriyle test edilebilir:

1. Ana sayfanın alt kısmındaki **"Demo Veri Ekle"** butonuna tıklayın
2. Sistem otomatik olarak şunları oluşturur:
   - 5 örnek kullanıcı (farklı roller ve profillerle)
   - 5 örnek etkinlik (görseller dahil)
   - 4 örnek eşleşme
   - 3 örnek konuşma (mesajlarla birlikte)
   - 2 örnek toplantı

### Demo Kullanıcılar

```
Email: ahmet@example.com     | Şifre: demo123 | Rol: Participant
Email: zeynep@example.com    | Şifre: demo123 | Rol: Organizer
Email: mehmet@example.com    | Şifre: demo123 | Rol: Sponsor
Email: ayse@example.com      | Şifre: demo123 | Rol: Participant
Email: can@example.com       | Şifre: demo123 | Rol: Participant
```

## 📝 API Endpoints

### Auth
- `POST /auth/signup` - Yeni kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi

### Users
- `GET /users/me` - Kullanıcı bilgilerini getir
- `PUT /users/me` - Profil güncelle

### Events
- `POST /events` - Etkinlik oluştur
- `GET /events` - Tüm etkinlikleri listele
- `GET /events/:id` - Etkinlik detayı
- `POST /events/:id/join` - Etkinliğe katılma talebi
- `POST /events/:id/approve/:userId` - Katılım talebini onayla
- `POST /events/:id/checkin` - QR kod ile check-in

### Matches
- `GET /matches/recommendations?eventId=xxx` - Eşleştirme önerileri
- `POST /matches/:id/respond` - Eşleşmeyi kabul/reddet

### Conversations & Messages
- `GET /conversations` - Konuşmaları listele
- `POST /conversations` - Yeni konuşma başlat
- `GET /conversations/:id/messages` - Mesajları getir
- `POST /conversations/:id/messages` - Mesaj gönder

### Meetings
- `POST /meetings` - Toplantı oluştur
- `GET /meetings` - Toplantıları listele
- `PATCH /meetings/:id/status` - Toplantı durumunu güncelle

### Analytics
- `GET /analytics/user` - Kullanıcı istatistikleri
- `GET /analytics/event/:id` - Etkinlik analitiği

### Development
- `POST /seed` - Demo veri ekleme (geliştirme amaçlı)

## 🎨 Tasarım

Platform modern, minimalist ve kurumsal bir arayüze sahiptir:
- **Renk Paleti:** 
  - Primary: Koyu Mavi (#0A2540) - Güven ve profesyonellik
  - Secondary: Sky Blue (#0EA5E9) - Bağlantı ve iletişim
  - Accent: Amber (#F59E0B) - Enerji ve networking
  - Success: Green (#10B981)
  - Purple: (#8B5CF6)
- **Logo:** "12" geometrik konsepti - networking ve bağlantıları temsil eden çember
- **Tipografi:** Modern sans-serif sistem font stack
- **Bileşenler:** shadcn/ui ile tutarlı tasarım sistemi
- **Responsive:** Mobil-first yaklaşım

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Row-level security (Supabase)
- CORS yapılandırması
- Secure session management

## 📈 Gelecek Geliştirmeler

### Öncelikli
- [ ] Real-time WebSocket entegrasyonu (Socket.IO)
- [ ] Meeting scheduler frontend UI
- [ ] QR kod check-in frontend
- [ ] Event detail sayfası
- [ ] White label theme customization
- [ ] OAuth sosyal giriş (Google, LinkedIn)

### İleri Seviye
- [ ] Machine learning tabanlı eşleştirme (v2)
- [ ] Video görüşme entegrasyonu
- [ ] Advanced analytics ve raporlama
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Sponsor analytics ve ROI tracking
- [ ] Push notifications
- [ ] Email notifications
- [ ] Calendar sync (Google Calendar, Outlook)

## 🌐 White Label Desteği

Platform, farklı markalar için özelleştirilebilir:
- Logo ve renk teması
- Domain mapping
- Custom branding
- Multi-tenant architecture (geliştirilecek)

## 📱 PWA Özellikleri

- Install prompt
- Standalone app deneyimi
- Responsive design
- App shortcuts
- Offline support (geliştirilecek)

## 🤝 Katkıda Bulunma

Bu prototip Figma Make ortamında geliştirilmiştir. Production ortamına geçiş için:
1. Supabase migration'ları hazırlayın
2. Environment variables'ları yapılandırın
3. OAuth provider'ları yapılandırın
4. Domain ve SSL sertifikası ayarlayın

## 📄 Lisans

© 2025 oniki. Tüm hakları saklıdır.
