/**
 * TabuPlus - Özel Vektörel Kart Şablonu ve Görsel Bileşenler
 * Emojilerden arındırılmış, kurumsal ve modern vektörel tasarım.
 */

export const CardSVGTemplate = {
  /**
   * Özel Vektörel Kart Çerçevesi ve Arka Plan Deseni (SVG String)
   */
  generateBackgroundPattern(color = '#6366f1') {
    return `
      <svg class="card-bg-svg" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1e2f" stop-opacity="0.95" />
            <stop offset="50%" stop-color="#141420" stop-opacity="0.98" />
            <stop offset="100%" stop-color="#0d0d15" stop-opacity="1" />
          </linearGradient>

          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>

          <linearGradient id="tabooGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#ef4444" stop-opacity="0.04" />
          </linearGradient>

          <!-- Vektörel Geometrik Ağ Deseni -->
          <pattern id="gridPattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
            <circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.04)"/>
          </pattern>

          <!-- Vektörel Köşe Rozeti -->
          <pattern id="dotsPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="${color}" fill-opacity="0.12"/>
          </pattern>
        </defs>

        <!-- Kart Arka Planı -->
        <rect width="400" height="560" rx="28" fill="url(#cardGrad)" />
        <rect width="400" height="560" rx="28" fill="url(#gridPattern)" />

        <!-- Üst Vurgu Işığı -->
        <path d="M 28 0 L 372 0 C 388 0 400 12 400 28 L 400 120 L 0 120 L 0 28 C 0 12 12 0 28 0 Z" 
              fill="${color}" fill-opacity="0.06" />

        <!-- Yasaklı Kelimeler Alanı Vektörel Çerçevesi -->
        <rect x="20" y="160" width="360" height="340" rx="18" fill="url(#tabooGrad)" 
              stroke="rgba(239, 68, 68, 0.2)" stroke-width="1.5" stroke-dasharray="8 4"/>

        <!-- Sol ve Sağ Vektörel Kenar Çizgileri -->
        <line x1="20" y1="50" x2="20" y2="130" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
        <line x1="380" y1="50" x2="380" y2="130" stroke="${color}" stroke-width="3" stroke-linecap="round"/>

        <!-- Alt Vektörel Filigran ve Köşe Vurguları -->
        <g opacity="0.35">
          <circle cx="36" cy="524" r="4" fill="${color}"/>
          <circle cx="50" cy="524" r="2" fill="${color}"/>
          <circle cx="60" cy="524" r="1.5" fill="${color}"/>
          <line x1="70" y1="524" x2="160" y2="524" stroke="${color}" stroke-width="1"/>
          
          <line x1="240" y1="524" x2="330" y2="524" stroke="${color}" stroke-width="1"/>
          <circle cx="340" cy="524" r="1.5" fill="${color}"/>
          <circle cx="350" cy="524" r="2" fill="${color}"/>
          <circle cx="364" cy="524" r="4" fill="${color}"/>
        </g>

        <!-- Dış Vektörel Kart Kenarlık Bordürü -->
        <rect x="1.5" y="1.5" width="397" height="557" rx="27" fill="none" 
              stroke="url(#accentGrad)" stroke-width="2" opacity="0.45" />
      </svg>
    `;
  },

  /**
   * Vektörel Kategori veya Yasak Rozetleri
   */
  icons: {
    forbidden: `
      <svg class="taboo-bullet-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" stroke="#ef4444" fill="rgba(239,68,68,0.12)"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#ef4444"></line>
      </svg>
    `,
    category: `
      <svg class="category-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    `,
    brandMark: `
      <svg class="brand-svg-mark" viewBox="0 0 40 40" width="28" height="28" fill="none">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
        <path d="M12 13 H28 M20 13 V27" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <path d="M26 23 V29 M23 26 H29" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,
    correct: `
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `,
    tabooBuzzer: `
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `,
    pass: `
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 4 15 12 5 20 5 4"></polygon>
        <line x1="19" y1="5" x2="19" y2="19"></line>
      </svg>
    `,
    settings: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    `,
    qr: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    `,
    soundOn: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    `,
    soundOff: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>
    `
  },

  /**
   * Kart HTML'ini Vektörel Arka Planla Birlikte Üretir
   */
  renderCard(card, themeColor = '#6366f1') {
    if (!card) return '<div class="empty-card">Kart kalmadı!</div>';

    const forbiddenList = card.forbidden
      .map(
        (word, index) => `
        <li class="taboo-item" style="animation-delay: ${index * 0.05}s">
          <span class="taboo-bullet">${this.icons.forbidden}</span>
          <span class="taboo-word">${word.toLocaleUpperCase('tr-TR')}</span>
        </li>
      `
      )
      .join('');

    return `
      <div class="tabu-card-inner">
        <!-- Vektörel SVG Arka Plan Şablonu -->
        ${this.generateBackgroundPattern(themeColor)}

        <!-- Kart İçerik Katmanı -->
        <div class="card-content-overlay">
          <!-- Üst Bilgi Barı: Kategori & Logo -->
          <div class="card-top-bar">
            <span class="card-category-pill">
              ${this.icons.category}
              <span class="category-name">${card.category || 'GENEL KÜLTÜR'}</span>
            </span>
            <span class="card-series-tag">TABU+ #${card.id || '001'}</span>
          </div>

          <!-- Hedef / Anlatılacak Kelime -->
          <div class="target-word-container">
            <h2 class="target-word">${card.word.toLocaleUpperCase('tr-TR')}</h2>
          </div>

          <!-- Yasaklı Kelimeler Başlık Çizgisi -->
          <div class="taboo-header">
            <span class="taboo-line"></span>
            <span class="taboo-badge">YASAKLI KELİMELER</span>
            <span class="taboo-line"></span>
          </div>

          <!-- Yasaklı Kelimeler Listesi -->
          <ul class="taboo-list">
            ${forbiddenList}
          </ul>

          <!-- Kart Alt Bilgi & Filigran -->
          <div class="card-footer-branding">
            <span class="footer-brand-text">TABU PLUS</span>
            <span class="footer-dots"></span>
            <span class="footer-difficulty">${card.difficulty || 'ORTA'}</span>
          </div>
        </div>
      </div>
    `;
  }
};
