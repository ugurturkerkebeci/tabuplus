/**
 * TabuPlus - Oyun Modları Motoru
 * Klasik, Çizerek Anlat (Tabusuz + Gizlenebilir Kelime + Canlı Beyaz Tahta),
 * Sessiz Sinema, Tek Kelime ve Yıldırım Blitz Modları
 */

export const GAME_MODES = {
  CLASSIC: {
    id: 'classic',
    name: 'Klasik Tabu',
    badge: 'KLASİK',
    icon: `📖`,
    desc: '5 yasaklı kelimeyi kullanmadan takımına kelimeyi anlat.',
    rulesText: 'Ana kelimeyi ve 5 yasaklı kelimeyi söylemeden takım arkadaşlarınıza serbestçe konuşarak anlatın.',
    allowsSpeech: true,
    hasDrawing: false,
    allowTaboo: true,
    hasWordHiding: false,
    bonusTimeOnCorrect: 0,
    oneWordOnly: false
  },
  DRAWING: {
    id: 'drawing',
    name: 'Çizerek Anlat',
    badge: 'ÇİZİM',
    icon: `✏️`,
    desc: 'Konuşmak ve yazı yazmak YASAK! Tabu cezası yoktur, sadece çizerek anlat.',
    rulesText: 'Yazı, harf veya rakam yazmak KESİNLİKLE YASAKTIR! Bu modda Tabu yoktur. Kelimeyi gizleyip çizmeye başlayın.',
    allowsSpeech: false,
    hasDrawing: true,
    allowTaboo: false, // Bu modda TABU YOKTUR!
    hasWordHiding: true, // Kelimeyi Gizle / Göster butonu
    bonusTimeOnCorrect: 0,
    oneWordOnly: false
  },
  MIME: {
    id: 'mime',
    name: 'Sessiz Sinema',
    badge: 'PANDOMİM',
    icon: `🎭`,
    desc: 'Sıfır ses! Yalnızca jest, mimik ve vücut diliyle canlandır.',
    rulesText: 'Hiçbir ses, fısıltı veya dudak hareketi olamaz! Yalnızca pandomim ile anlatın.',
    allowsSpeech: false,
    hasDrawing: false,
    allowTaboo: true,
    hasWordHiding: false,
    bonusTimeOnCorrect: 0,
    oneWordOnly: false
  },
  ONE_WORD: {
    id: 'one_word',
    name: 'Tek Kelime (Parola)',
    badge: 'TEK KELİME',
    icon: `💬`,
    desc: 'Kart başına sadece TEK BİR ipucu kelimesi söyleme hakkın var!',
    rulesText: 'Her kart için yalnızca 1 kelimelik tek bir ipucu verebilirsiniz. Takımınız tek tahminde bilmelidir.',
    allowsSpeech: true,
    hasDrawing: false,
    allowTaboo: true,
    hasWordHiding: false,
    bonusTimeOnCorrect: 0,
    oneWordOnly: true
  },
  BLITZ: {
    id: 'blitz',
    name: 'Yıldırım (Blitz)',
    badge: 'YILDIRIM',
    icon: `⚡`,
    desc: 'Pas hakkı yok! Her doğru cevapta +5 saniye kazanırsınız.',
    rulesText: 'Pas geçmek yasaktır. 30 saniye ile başlarsınız, her doğru bildiğinizde sürenize +5 saniye eklenir!',
    allowsSpeech: true,
    hasDrawing: false,
    allowTaboo: true,
    hasWordHiding: false,
    bonusTimeOnCorrect: 5,
    oneWordOnly: false
  }
};
