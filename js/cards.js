/**
 * TabuPlus - Kapsamlı Türkçe Kart Veritabanı ve Kategori Motoru
 * 18 Kategori x 100 Kart = 1800 Kartlık Dev Veritabanı
 */

import { ALL_TABU_CARDS } from '../cards/all_cards.js';

export const CATEGORIES = [
  'TARİH',
  'COĞRAFYA',
  'BİLİM & UZAY',
  'DİN & İNANÇ',
  'EDEBİYAT & ŞİİR',
  'FELSEFE & MANTIK',
  'MİTOLOJİ & EFSANE',
  'TIP & SAĞLIK',
  'SİNEMA & DİZİ',
  'MÜZİK & SANAT',
  'SPOR & OYUN',
  'YEMEK & MUTFAK',
  'TEKNOLOJİ & DİJİTAL',
  'GÜNLÜK YAŞAM & EV',
  'MESLEKLER',
  'DOĞA & CANLILAR',
  'DEYİMLER & KAVRAMLAR',
  'POPÜLER KÜLTÜR'
];

export const DEFAULT_CARDS = ALL_TABU_CARDS;

class CardManager {
  constructor() {
    this.storageKey = 'tabuplus_custom_cards';
    this.customCards = this.loadCustomCards();
    this.selectedCategories = [...CATEGORIES]; // Başlangıçta tümü seçili
    this.deck = [];
    this.currentIndex = 0;
    this.rebuildDeck();
  }

  loadCustomCards() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomCards() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customCards));
    } catch (e) {
      console.error('Kart kaydedilemedi', e);
    }
  }

  addCustomCard(word, forbiddenArray, category = 'ÖZEL KART', difficulty = 'ORTA') {
    const newCard = {
      id: 5000 + this.customCards.length + 1,
      word: word.trim(),
      forbidden: forbiddenArray.map((w) => w.trim()).filter((w) => w.length > 0),
      category,
      difficulty,
      isCustom: true
    };
    this.customCards.push(newCard);
    this.saveCustomCards();
    this.rebuildDeck();
    return newCard;
  }

  deleteCustomCard(id) {
    this.customCards = this.customCards.filter((c) => c.id !== id);
    this.saveCustomCards();
    this.rebuildDeck();
  }

  setSelectedCategories(categories) {
    if (!categories || categories.length === 0) {
      this.selectedCategories = [...CATEGORIES];
    } else {
      this.selectedCategories = [...categories];
    }
    this.rebuildDeck();
  }

  getSelectedCategories() {
    return this.selectedCategories;
  }

  getAllCategories() {
    return CATEGORIES;
  }

  rebuildDeck() {
    const all = [...DEFAULT_CARDS, ...this.customCards];
    // Seçili kategorilere göre filtrele (Özel kartlar her zaman dahil edilir)
    this.deck = all.filter(
      (card) => card.isCustom || this.selectedCategories.includes(card.category)
    );
    this.shuffle();
  }

  shuffle() {
    const array = [...this.deck];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    this.deck = array;
    this.currentIndex = 0;
  }

  getNextCard() {
    if (this.deck.length === 0) {
      this.rebuildDeck();
    }
    if (this.currentIndex >= this.deck.length) {
      this.shuffle();
    }
    const card = this.deck[this.currentIndex];
    this.currentIndex++;
    return card;
  }

  getDeckCount() {
    return this.deck.length;
  }

  getCategoryCount(category) {
    return DEFAULT_CARDS.filter((c) => c.category === category).length;
  }
}

export const cardManager = new CardManager();
