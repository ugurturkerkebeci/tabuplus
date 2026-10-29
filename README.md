# TabuPlus 🎯

Modern, ultra hafif, sunucu tarafında Python/NodeJS gerektirmeyen ve en düşük donanımlı sunucularda bile anlık yüzlerce kişinin aynı anda oynayabileceği yeni nesil web tabanlı Tabu oyunu.

<a href="https://ugurturkerkebeci.github.io/tabuplus">Tıkla Uç</a>

---

## 🌟 Öne Çıkan Özellikler

1. **Sıfır Sunucu Yükü (Zero-Backend Overhead)**:
   - Sunucu tarafında Python, Node.js veya veritabanı process'i çalıştırmaz.
   - Tüm oyun mantığı tarayıcı içinde (client-side) çalışır. En ucuz paylaşımlı hostingde veya GitHub Pages / Cloudflare Pages üzerinde sıfır maliyetle anlık yüzlerce kişi oynayabilir.

2. **WebRTC P2P Çok Cihazlı Oda & QR Katılımı**:
   - Host odayı kurduğunda ekranda otomatik olarak **QR Kod** ve 4 haneli kolay bir **Oda Kodu** (`TP-XXXX`) üretilir.
   - Diğer oyuncular telefon kameralarıyla QR kodu taratarak veya linki açarak anında odaya bağlanır.
   - Bağlantı doğrudan cihazlar arasında (WebRTC DataChannel) şifreli ve P2P olarak kurulur.

3. **Pass & Play (Tek Cihazda Oynama)**:
   - İnternetsiz veya tek bir telefonla arkadaş grubunda elden ele devredilerek anında oynanabilir.

4. **%100 Mobil Uyumlu & Anti-Blue-Highlight**:
   - Ekrana veya butonlara basılı tutulduğunda metin seçimi veya mavi parlamalar/büyüteç açılmaz (`user-select: none`, `-webkit-tap-highlight-color: transparent`, `-webkit-touch-callout: none`).
   - Dokunmatik gecikmesi kaldırılmıştır (`touch-action: manipulation`).
   - Web Audio API ile sıfır gecikmeli sentetik sesler (Doğru, Pas, Buzzer, Süre Tik-Tak ve Gong).
   - Titreşim motoru (Haptic Feedback - `navigator.vibrate`).

5. **Özel Vektörel Kart Şablonu (Sıfır Emoji!)**:
   - Emojiler yerine tamamen sitemize özel geometrik SVG desenleri, fütüristik çerçeveler, hologram çizgileri ve yüksek kontrastlı tipografi kullanılmıştır.
   - Her kart; ana kelime, 5 adet yasaklı kelime, kategori ve zorluk derecesi içerir.
   - Kullanıcılar kendi özel kartlarını ekleyebilir (Local Storage ile kalıcı hale getirilir).

6. **1.800 Kartlık Dev Veritabanı & Çoklu Kategori Seçimi**:
   - **Her biri tam 100 karttan oluşan 18 farklı zengin kategori (Toplam 1.800 özgün kart)**:
     - 🏛️ **Tarih (100 Kart)**
     - 🌍 **Coğrafya (100 Kart)**
     - 🔬 **Bilim & Uzay (100 Kart)**
     - ☪️ **Din & İnanç (100 Kart)**
     - 📚 **Edebiyat & Şiir (100 Kart)**
     - 🧠 **Felsefe & Mantık (100 Kart)**
     - ⚡ **Mitoloji & Efsane (100 Kart)**
     - 🩺 **Tıp & Sağlık (100 Kart)**
     - 🎬 **Sinema & Dizi (100 Kart)**
     - 🎵 **Müzik & Sanat (100 Kart)**
     - ⚽ **Spor & Oyun (100 Kart)**
     - 🍲 **Yemek & Mutfak (100 Kart)**
     - 💻 **Teknoloji & Dijital (100 Kart)**
     - 🏠 **Günlük Yaşam & Ev (100 Kart)**
     - 👔 **Meslekler (100 Kart)**
     - 🌿 **Doğa & Canlılar (100 Kart)**
     - 💡 **Deyimler & Kavramlar (100 Kart)**
     - 🌟 **Popüler Kültür (100 Kart)**
   - Asla çakışma yaşanmaz, saatlerce kesintisiz ve tekrarsız oyun oynanabilir!
   - Kullanıcılar tek tıkla istedikleri kategorileri seçebilir veya çıkarabilir ("Tümünü Seç" / "Temizle" butonları ve anlık kart sayacı).

7. **5 Farklı ve Eğlenceli Oyun Modu**:
   - 📖 **Klasik Tabu**: Standart kurallar; 5 yasaklı kelimeyi söylemeden takımına anlat.
   - ✏️ **Çizerek Anlat (Pictionary)**: Konuşmak kesinlikle yasak! Yerleşik dokunmatik dijital çizim tahtasını (Whiteboard) kullanarak çizerek anlat. Farklı fırça renkleri, silgi ve tek tıkla temizleme araçları dahildir.
   - 🎭 **Sessiz Sinema (Pandomim)**: Sıfır ses! Sadece jest, mimik ve vücut diliyle canlandırma.
   - 💬 **Tek Kelime (Parola)**: Her kart için anlatıcının sadece TEK BİR kelimelik ipucu verme hakkı vardır!
   - ⚡ **Yıldırım (Blitz)**: Pas hakkı yok! 30 saniye ile başlanır, her doğru bilindiğinde süreye +5 saniye eklenir.

8. **Gelişmiş Kurallar ve Takım Özelleştirme (Host Paneli)**:
   - 2, 3 veya 4 takım desteği.
   - Takım adı serbestçe yazılabilir, takım renkleri dinamik renk paletinden tek tıkla değiştirilebilir.
   - Tur süresi (30s, 45s, 60s, 90s, 120s), pas hakkı (1, 2, 3, 5, Sınırsız), kazanma skoru (15, 25, 50, 100) ve tabu cezası (-1 veya 0) ayarlanabilir.

---

## 🚀 Nasıl Çalıştırılır?

Projeyi çalıştırmak için hiçbir sunucu kurulumu veya paket yöneticisi (`npm`, `pip` vb.) gerekmez.

### Seçenek 1: Doğrudan Statik Barındırma (Tavsiye Edilen)
Dosyaları (`index.html`, `css/`, `js/`) dilediğiniz herhangi bir statik barındırma platformuna yükleyin:
- **GitHub Pages**
- **Cloudflare Pages**
- **Netlify / Vercel**
- **cPanel / Paylaşımlı Apache / Nginx Hosting**

### Seçenek 2: Yerel Olarak Test Etme
Proje dizininde basit bir HTTP sunucusu açabilirsiniz:
```bash
# Python ile:
python -m http.server 8080

# Tarayıcınızda açın:
http://localhost:8080
```

---

## 📁 Proje Dosya Yapısı

```
TabuPlus/
│
├── index.html            # Ana tek sayfa uygulama (SPA)
├── README.md             # Kullanım ve kurulum kılavuzu
│
├── css/
│   └── style.css         # Modern glassmorphism, no-blue-highlight ve mobil stiller
│
└── js/
    ├── app.js            # Ana oyun durumu ve tur kontrolcüsü
    ├── svg-templates.js  # Özel vektörel SVG kart şablonları ve ikonlar
    ├── audio.js          # Web Audio API ses efektleri ve haptic titreşim motoru
    ├── cards.js          # 100+ kaliteli Türkçe Tabu kartı ve özel kart yöneticisi
    ├── p2p.js            # PeerJS WebRTC P2P bağlantı motoru
    └── qrcode.js         # SVG tabanlı QR kod üreteci
```

---

*TabuPlus - Keyifli Oyunlar!*
