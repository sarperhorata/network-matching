# 🚀 Auto Git - Generic Commit & Push Scripts

Herhangi bir değişikliği otomatik olarak commit ve push etmek için kullanabileceğin generic scriptler.

## 📦 İki Versiyon

### 1. Bash Script (Basit)
```bash
bash auto_commit_push.sh "commit message" [branch]
```

### 2. Python Script (Gelişmiş)
```bash
python3 auto_git.py [options]
```

---

## 🎯 Kullanım Örnekleri

### Temel Kullanım (Mesaj ile)
```bash
# Bash
bash auto_commit_push.sh "feat: Add new feature"

# Python
python3 auto_git.py "feat: Add new feature"
```

### Otomatik Mesaj (Değişiklikleri analiz eder)
```bash
# Bash
bash auto_commit_push.sh --auto

# Python
python3 auto_git.py --auto
# veya
python3 auto_git.py -a
```

### Farklı Branch'e Push
```bash
# Bash
bash auto_commit_push.sh "fix: Bug fix" develop

# Python
python3 auto_git.py "fix: Bug fix" --branch develop
# veya
python3 auto_git.py "fix: Bug fix" -b develop
```

### Sadece Commit (Push Yapma)
```bash
# Python only
python3 auto_git.py "wip: Work in progress" --no-push
```

---

## 🔧 Özellikler

### Bash Script
✅ Basit ve hızlı  
✅ Tüm değişiklikleri otomatik stage eder  
✅ Commit ve push yapar  
✅ Renkli output  
✅ Otomatik mesaj oluşturma  

### Python Script (Daha Güçlü!)
✅ Bash'in tüm özellikleri +  
✅ Detaylı istatistikler (eklenen, silinen, değiştirilen dosyalar)  
✅ Akıllı commit tipi (feat, fix, chore)  
✅ Etkilenen klasörleri gösterir  
✅ Timestamp ekler  
✅ --no-push seçeneği  
✅ Daha güzel output  

---

## 📊 Otomatik Mesaj Formatı

Otomatik mesaj şu bilgileri içerir:

```
feat: Update project files

✅ Added: 5 files
📝 Modified: 3 files
🗑️  Deleted: 1 files

Affected: backend, frontend, docs

Timestamp: 2025-10-18 14:30:00
```

---

## 🎨 Output Renkleri

- 🟢 **Yeşil**: Başarılı işlemler
- 🔵 **Mavi**: Bilgi mesajları
- 🟡 **Sarı**: Uyarılar
- 🔴 **Kırmızı**: Hatalar

---

## 🚦 Çalışma Mantığı

1. **Git reset** - Bekleyen commit'leri temizler
2. **Git add -A** - Tüm değişiklikleri stage eder
3. **Değişiklikleri kontrol** - Hiç değişiklik yoksa çıkar
4. **İstatistik toplama** - Dosya değişikliklerini analiz eder
5. **Commit mesajı** - Verileni kullanır veya otomatik oluşturur
6. **Git commit** - Commit işlemini yapar
7. **Git push** - Belirtilen branch'e push eder
8. **Özet gösterir** - Tüm işlemlerin sonucunu gösterir

---

## 💡 Kullanım Senaryoları

### Senaryo 1: Hızlı güncellemeler
```bash
# Değişiklikleri yaptın, hızlı push istiyorsun
python3 auto_git.py --auto
```

### Senaryo 2: Belirli mesajla push
```bash
# Spesifik bir özellik ekledin
python3 auto_git.py "feat: Add notification system"
```

### Senaryo 3: Döküman güncellemesi
```bash
# Dökümanları güncelledin
python3 auto_git.py "docs: Update README and guides"
```

### Senaryo 4: Bug fix
```bash
# Bug düzelttin
python3 auto_git.py "fix: Resolve authentication issue"
```

### Senaryo 5: Geliştirme branch'inde çalışma
```bash
# Feature branch'inde çalışıyorsun
python3 auto_git.py "wip: Implement user dashboard" -b feature/dashboard
```

---

## 🔍 Commit Message Conventions

Conventional Commits standardını kullan:

- **feat**: Yeni özellik
- **fix**: Bug fix
- **docs**: Döküman değişikliği
- **style**: Kod formatı (logic değişikliği yok)
- **refactor**: Kod refactoring
- **test**: Test ekleme
- **chore**: Build/config değişiklikleri

Örnek:
```bash
python3 auto_git.py "feat(auth): Add OAuth2 support"
python3 auto_git.py "fix(api): Resolve CORS issue"
python3 auto_git.py "docs(readme): Update installation guide"
```

---

## ⚠️ Önemli Notlar

1. **Ana klasörde çalıştır**: Scriptler `/Users/sarperhorata/12net` dizinine otomatik cd yapar
2. **Git repo olmalı**: .git klasörü olmalı
3. **Remote olmalı**: origin remote'u tanımlı olmalı
4. **Yetki**: Push için GitHub authentication gerekli

---

## 🔗 GitHub Repo

https://github.com/sarperhorata/network-matching

---

## 📝 Örnek Kullanım Akışı

```bash
# 1. Dosyaları değiştir
vim backend/src/auth/auth.controller.ts

# 2. Otomatik commit ve push
python3 auto_git.py --auto

# VEYA belirli mesajla
python3 auto_git.py "feat: Add Google OAuth support"

# 3. GitHub'ı kontrol et - değişiklikler orada!
```

---

## 🎉 Sonuç

Artık **HERHANGİ BİR DEĞİŞİKLİK** için bu scriptleri kullanabilirsin!

**En Kolay Yol**:
```bash
python3 auto_git.py --auto
```

Bu tek komut:
- ✅ Tüm değişiklikleri bulur
- ✅ Akıllı commit mesajı oluşturur
- ✅ Commit yapar
- ✅ GitHub'a push eder
- ✅ Özet gösterir

**2 saniyede GitHub'a push!** 🚀

