/**
 * TabuPlus - Ana Uygulama Mantığı ve Durum Yöneticisi
 * %100 Mobil Uyumlu, P2P & Pass & Play Destekli, Vektörel Kart Motoru
 */

import { CardSVGTemplate } from './svg-templates.js';
import { sound } from './audio.js';
import { cardManager } from './cards.js';
import { QRCodeSVG } from './qrcode.js';
import { TabuNetwork } from './p2p.js';
import { GAME_MODES } from './game-modes.js';
import { CanvasBoard } from './canvas-board.js';

class TabuApp {
  constructor() {
    // Aktif Oyun Modu (Varsayılan: Klasik)
    this.activeMode = GAME_MODES.CLASSIC;
    this.canvasBoard = null;
    this.clientCanvasBoard = null;
    this.isWordHidden = false;

    // Oyun Ayarları ve Kurallar
    this.rules = {
      roundTime: 60,
      maxPasses: 3,
      winScore: 25,
      penaltyScore: -1
    };

    // Takımlar
    this.teams = [
      { id: 1, name: 'Kırmızı Takım', color: '#ef4444', score: 0 },
      { id: 2, name: 'Mavi Fırtına', color: '#3b82f6', score: 0 }
    ];

    this.availableColors = [
      '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
      '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
    ];

    // Aktif Durum
    this.currentTeamIndex = 0;
    this.currentCard = null;
    this.timer = null;
    this.timeLeft = 60;
    this.remainingPasses = 3;

    // Tur İstatistikleri
    this.roundStats = {
      correct: 0,
      taboo: 0,
      pass: 0
    };

    // Ağ & Çok Oyunculu Mod
    this.isMultiplayer = false;
    this.network = null;
    this.isHost = false;
    this.myRole = 'host'; // 'host', 'speaker', 'buzzer', 'spectator'

    this.init();
  }

  init() {
    this.renderHeaderIcons();
    this.bindEvents();
    this.bindGameModes();
    this.bindCanvasTools();
    this.renderTeamsList();
    this.renderCategoryChips();
    this.populateCustomCategorySelect();
    this.checkUrlForRoomCode();
  }

  /* --------------------------------------------------------------------------
     Oyun Modları Yönetimi (Klasik, Çizim, Pandomim, Tek Kelime, Blitz)
     -------------------------------------------------------------------------- */
  bindGameModes() {
    const cards = document.querySelectorAll('.mode-option-card');
    const label = document.getElementById('lbl-active-mode');

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        sound.playClick();
        cards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        const modeKey = card.dataset.mode;
        this.activeMode = GAME_MODES[modeKey] || GAME_MODES.CLASSIC;

        if (label) {
          label.textContent = this.activeMode.name;
        }

        // Mod bazlı kural optimizasyonları
        const timeSelect = document.getElementById('rule-time');
        const passSelect = document.getElementById('rule-pass');

        if (this.activeMode.id === 'blitz') {
          if (timeSelect) timeSelect.value = '30';
          if (passSelect) passSelect.value = '0';
        } else if (this.activeMode.id === 'drawing') {
          if (timeSelect) timeSelect.value = '90';
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Dahili Dokunmatik Çizim Tahtası Araçları & Kelime Gizleme
     -------------------------------------------------------------------------- */
  initHostCanvasBoard() {
    if (!this.canvasBoard) {
      this.canvasBoard = new CanvasBoard('drawing-canvas', {
        onDrawAction: (action) => {
          if (this.network && this.network.isHost) {
            this.network.send({
              type: 'DRAW_ACTION',
              drawData: action
            });
          }
        }
      });
    } else {
      this.canvasBoard.resize();
    }
  }

  toggleWordVisibility(forceState) {
    if (forceState !== undefined) {
      this.isWordHidden = forceState;
    } else {
      this.isWordHidden = !this.isWordHidden;
    }

    const stage = document.getElementById('card-stage-container');
    const overlay = document.getElementById('word-hidden-overlay');
    const btn = document.getElementById('btn-toggle-word-visibility');
    const icon = document.getElementById('hide-word-icon');
    const text = document.getElementById('hide-word-text');

    if (this.isWordHidden) {
      stage?.classList.add('word-hidden');
      if (overlay) overlay.style.display = 'block';
      btn?.classList.add('hidden-state');
      if (icon) icon.textContent = '👁️‍🗨️';
      if (text) text.textContent = 'Kelimeyi Göster';
    } else {
      stage?.classList.remove('word-hidden');
      if (overlay) overlay.style.display = 'none';
      btn?.classList.remove('hidden-state');
      if (icon) icon.textContent = '👁️';
      if (text) text.textContent = 'Kelimeyi Gizle (Çizmeye Başla)';
    }
  }

  bindCanvasTools() {
    // Çizim Tahtasını Aç / Kapat Butonu
    const toggleBtn = document.getElementById('btn-toggle-drawing');
    const container = document.getElementById('drawing-container');

    toggleBtn?.addEventListener('click', () => {
      sound.playClick();
      if (container) {
        container.classList.toggle('open');
        if (container.classList.contains('open')) {
          this.initHostCanvasBoard();
        }
      }
    });

    // Kelimeyi Gizle / Göster Butonu
    document.getElementById('btn-toggle-word-visibility')?.addEventListener('click', () => {
      sound.playClick();
      this.toggleWordVisibility();
    });

    // Renk Seçici Butonlar
    const colorPalette = document.getElementById('canvas-color-palette');
    colorPalette?.querySelectorAll('.color-dot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick();
        colorPalette.querySelectorAll('.color-dot-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.dataset.color;
        if (this.canvasBoard) {
          this.canvasBoard.setColor(color);
        }
      });
    });

    // Silgi
    document.getElementById('btn-draw-eraser')?.addEventListener('click', () => {
      sound.playClick();
      if (this.canvasBoard) {
        this.canvasBoard.setEraser();
      }
    });

    // Temizle
    document.getElementById('btn-draw-clear')?.addEventListener('click', () => {
      sound.playClick();
      if (this.canvasBoard) {
        this.canvasBoard.clear();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Arayüz İkonları ve Üst Bar
     -------------------------------------------------------------------------- */
  renderHeaderIcons() {
    const soundBtn = document.getElementById('btn-toggle-sound');
    const rulesBtn = document.getElementById('btn-open-rules');

    if (soundBtn) {
      soundBtn.innerHTML = CardSVGTemplate.icons.soundOn;
    }
    if (rulesBtn) {
      rulesBtn.innerHTML = CardSVGTemplate.icons.settings;
    }

    // Buton ikonları
    const passIcon = document.getElementById('icon-pass-container');
    const tabooIcon = document.getElementById('icon-taboo-container');
    const correctIcon = document.getElementById('icon-correct-container');

    if (passIcon) passIcon.innerHTML = CardSVGTemplate.icons.pass;
    if (tabooIcon) tabooIcon.innerHTML = CardSVGTemplate.icons.tabooBuzzer;
    if (correctIcon) correctIcon.innerHTML = CardSVGTemplate.icons.correct;
  }

  /* --------------------------------------------------------------------------
     Olay Dinleyicileri (Event Listeners)
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Üst Logo Tıklanınca Ana Ekrana Dönüş
    document.getElementById('btn-home-nav')?.addEventListener('click', () => {
      sound.playClick();
      if (confirm('Ana menüye dönmek istediğinize emin misiniz? Devam eden oyun sıfırlanır.')) {
        this.stopTimer();
        this.switchScreen('screen-home');
      }
    });

    // Ses Aç / Kapat
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      const isEnabled = sound.toggleSound();
      sound.playClick();
      const soundBtn = document.getElementById('btn-toggle-sound');
      if (soundBtn) {
        soundBtn.innerHTML = isEnabled ? CardSVGTemplate.icons.soundOn : CardSVGTemplate.icons.soundOff;
      }
    });

    // Kural Bilgilendirmesi Modalı
    document.getElementById('btn-open-rules')?.addEventListener('click', () => {
      sound.playClick();
      this.openModal('modal-rules');
    });
    document.getElementById('btn-close-rules-modal')?.addEventListener('click', () => {
      this.closeModal('modal-rules');
    });
    document.getElementById('btn-ok-rules')?.addEventListener('click', () => {
      this.closeModal('modal-rules');
    });

    // Mod Seçimleri
    document.getElementById('btn-mode-local')?.addEventListener('click', () => {
      sound.playClick();
      this.isMultiplayer = false;
      this.renderCategoryChips();
      this.switchScreen('screen-setup');
    });

    document.getElementById('btn-mode-host')?.addEventListener('click', () => {
      sound.playClick();
      this.isMultiplayer = true;
      this.startHostMode();
    });

    document.getElementById('btn-mode-join')?.addEventListener('click', () => {
      sound.playClick();
      this.openModal('modal-join');
    });

    // Özel Kart Ekleme
    document.getElementById('btn-open-custom-cards')?.addEventListener('click', () => {
      sound.playClick();
      this.openModal('modal-custom-cards');
    });
    document.getElementById('btn-close-custom-modal')?.addEventListener('click', () => {
      this.closeModal('modal-custom-cards');
    });
    document.getElementById('btn-save-custom-card')?.addEventListener('click', () => {
      this.saveCustomCard();
    });

    // Katılım Modalı
    document.getElementById('btn-close-join-modal')?.addEventListener('click', () => {
      this.closeModal('modal-join');
    });
    document.getElementById('btn-submit-join')?.addEventListener('click', () => {
      this.joinRoomFromInput();
    });

    // Kategori Hızlı İşlemler
    document.getElementById('btn-select-all-cats')?.addEventListener('click', () => {
      sound.playClick();
      cardManager.setSelectedCategories(cardManager.getAllCategories());
      this.renderCategoryChips();
    });

    document.getElementById('btn-clear-all-cats')?.addEventListener('click', () => {
      sound.playClick();
      // En az 1 kategori seçili kalması için ilk kategoriyi bırak
      cardManager.setSelectedCategories([cardManager.getAllCategories()[0]]);
      this.renderCategoryChips();
    });

    // Takım Ekle
    document.getElementById('btn-add-team')?.addEventListener('click', () => {
      this.addNewTeam();
    });

    // Setup'tan Başla
    document.getElementById('btn-start-game-from-setup')?.addEventListener('click', () => {
      sound.playClick();
      this.saveRulesFromSetup();
      this.startNewGame();
    });

    // Lobi Butonları
    document.getElementById('btn-copy-room-link')?.addEventListener('click', () => {
      this.copyRoomLink();
    });
    document.getElementById('btn-start-p2p-game')?.addEventListener('click', () => {
      sound.playClick();
      this.switchScreen('screen-setup');
    });
    document.getElementById('btn-cancel-lobby')?.addEventListener('click', () => {
      sound.playClick();
      if (this.network) this.network.disconnect();
      this.switchScreen('screen-home');
    });

    // Oyun Aksiyon Butonları (Doğru, Pas, Tabu)
    document.getElementById('btn-action-correct')?.addEventListener('click', () => {
      this.handleCorrect();
    });
    document.getElementById('btn-action-taboo')?.addEventListener('click', () => {
      this.handleTaboo();
    });
    document.getElementById('btn-action-pass')?.addEventListener('click', () => {
      this.handlePass();
    });

    // Karşı Takım Buzzer Butonu (P2P Client)
    document.getElementById('btn-client-taboo-buzzer')?.addEventListener('click', () => {
      this.triggerClientBuzzer();
    });

    // Tur Sonu Butonları
    document.getElementById('btn-next-round')?.addEventListener('click', () => {
      sound.playClick();
      this.startNextRound();
    });
    document.getElementById('btn-finish-game')?.addEventListener('click', () => {
      sound.playClick();
      this.switchScreen('screen-home');
    });
  }

  /* --------------------------------------------------------------------------
     Ekran ve Modal Yönetimi
     -------------------------------------------------------------------------- */
  switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  /* --------------------------------------------------------------------------
     Takım Yönetimi & Renk Özelleştirme
     -------------------------------------------------------------------------- */
  renderTeamsList() {
    const container = document.getElementById('teams-container');
    if (!container) return;

    container.innerHTML = this.teams
      .map(
        (team, index) => `
      <div class="team-card-row" style="border-left: 4px solid ${team.color};">
        <div class="team-color-indicator" 
             style="background: ${team.color};" 
             title="Rengi Değiştir"
             data-team-index="${index}">
        </div>
        <input type="text" 
               class="team-name-input" 
               value="${team.name}" 
               maxlength="20"
               data-team-index="${index}" />
        ${
          this.teams.length > 2
            ? `<button class="icon-btn btn-remove-team" data-team-index="${index}" style="width:28px; height:28px; font-size:14px;">✕</button>`
            : ''
        }
      </div>
    `
      )
      .join('');

    // Takım adı değişikliklerini dinle
    container.querySelectorAll('.team-name-input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.teamIndex, 10);
        this.teams[idx].name = e.target.value.trim() || `Takım ${idx + 1}`;
      });
    });

    // Takım rengi döngüsü
    container.querySelectorAll('.team-color-indicator').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const idx = parseInt(e.target.dataset.teamIndex, 10);
        const currentColorIdx = this.availableColors.indexOf(this.teams[idx].color);
        const nextColor = this.availableColors[(currentColorIdx + 1) % this.availableColors.length];
        this.teams[idx].color = nextColor;
        this.renderTeamsList();
      });
    });

    // Takım sil
    container.querySelectorAll('.btn-remove-team').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const idx = parseInt(e.target.dataset.teamIndex, 10);
        this.teams.splice(idx, 1);
        this.renderTeamsList();
      });
    });
  }

  addNewTeam() {
    if (this.teams.length >= 4) {
      alert('En fazla 4 takım ekleyebilirsiniz.');
      return;
    }
    sound.playClick();
    const newIdx = this.teams.length;
    const color = this.availableColors[newIdx % this.availableColors.length];
    this.teams.push({
      id: newIdx + 1,
      name: `Takım ${newIdx + 1}`,
      color,
      score: 0
    });
    this.renderTeamsList();
  }

  /* --------------------------------------------------------------------------
     Kategori Seçimi (Multi-Select)
     -------------------------------------------------------------------------- */
  renderCategoryChips() {
    const container = document.getElementById('category-chips-container');
    const countLbl = document.getElementById('lbl-category-count');
    if (!container) return;

    const allCategories = cardManager.getAllCategories();
    const selected = cardManager.getSelectedCategories();
    const deckCount = cardManager.getDeckCount();

    if (countLbl) {
      if (selected.length === allCategories.length) {
        countLbl.textContent = `Tümü Seçili (${selected.length} Kategori • ${deckCount} Kart)`;
      } else {
        countLbl.textContent = `${selected.length} Kategori Seçili (${deckCount} Kart)`;
      }
    }

    container.innerHTML = allCategories
      .map((cat) => {
        const isSelected = selected.includes(cat);
        return `
          <button type="button" 
                  class="category-chip ${isSelected ? 'selected' : ''}" 
                  data-category="${cat}">
            <span class="category-chip-check">✓</span>
            <span class="category-chip-name">${cat}</span>
          </button>
        `;
      })
      .join('');

    // Chip tıklama olayları
    container.querySelectorAll('.category-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const cat = chip.dataset.category;
        this.toggleCategorySelection(cat);
      });
    });
  }

  toggleCategorySelection(category) {
    sound.playClick();
    let currentSelected = [...cardManager.getSelectedCategories()];

    if (currentSelected.includes(category)) {
      if (currentSelected.length <= 1) {
        alert('En az 1 kategori seçili olmalıdır.');
        return;
      }
      currentSelected = currentSelected.filter((c) => c !== category);
    } else {
      currentSelected.push(category);
    }

    cardManager.setSelectedCategories(currentSelected);
    this.renderCategoryChips();
  }

  populateCustomCategorySelect() {
    const select = document.getElementById('custom-category-select');
    if (!select) return;

    const allCategories = cardManager.getAllCategories();
    select.innerHTML = `
      <option value="ÖZEL KART">ÖZEL KART</option>
      ${allCategories.map((c) => `<option value="${c}">${c}</option>`).join('')}
    `;
  }

  /* --------------------------------------------------------------------------
     Kural Ayarları
     -------------------------------------------------------------------------- */
  saveRulesFromSetup() {
    const timeVal = parseInt(document.getElementById('rule-time')?.value || '60', 10);
    const passVal = parseInt(document.getElementById('rule-pass')?.value || '3', 10);
    const scoreVal = parseInt(document.getElementById('rule-score')?.value || '25', 10);
    const penaltyVal = parseInt(document.getElementById('rule-penalty')?.value || '-1', 10);

    this.rules.roundTime = timeVal;
    this.rules.maxPasses = passVal;
    this.rules.winScore = scoreVal;
    this.rules.penaltyScore = penaltyVal;

    const penaltyLabel = document.getElementById('lbl-penalty-val');
    if (penaltyLabel) {
      penaltyLabel.textContent = `${this.rules.penaltyScore} Puan`;
    }
  }

  /* --------------------------------------------------------------------------
     Oyun Akışı (Gameplay Flow)
     -------------------------------------------------------------------------- */
  startNewGame() {
    // Skorları sıfırla
    this.teams.forEach((t) => (t.score = 0));
    this.currentTeamIndex = 0;
    this.startRound();
  }

  startRound() {
    const currentTeam = this.teams[this.currentTeamIndex];
    this.timeLeft = this.rules.roundTime;
    this.remainingPasses = this.rules.maxPasses;

    this.roundStats = { correct: 0, taboo: 0, pass: 0 };

    // HUD Güncelle
    this.updateHUD(currentTeam);
    this.updatePassButton();

    // İlk kartı çek
    this.drawNewCard();

    // Ekranı oyuna çevir
    this.switchScreen('screen-game');

    // Süreyi başlat
    this.startTimer();

    // P2P Senkronizasyon (Eğer Host ise)
    this.broadcastGameState('ROUND_START');
  }

  drawNewCard() {
    this.currentCard = cardManager.getNextCard();
    this.renderCurrentCard();

    // Çizim modunda yeni karta geçildiğinde kelime görünürlüğü sıfırlanır
    if (this.activeMode.id === 'drawing') {
      this.toggleWordVisibility(false);
    }

    // P2P üzerinden client'lara aktar
    this.broadcastGameState('NEW_CARD');
  }

  renderCurrentCard() {
    const container = document.getElementById('card-stage-container');
    if (!container || !this.currentCard) return;

    const currentTeam = this.teams[this.currentTeamIndex];
    container.innerHTML = CardSVGTemplate.renderCard(this.currentCard, currentTeam.color);
  }

  updateHUD(currentTeam) {
    const teamDot = document.getElementById('hud-team-dot');
    const teamName = document.getElementById('hud-team-name');
    const timerText = document.getElementById('hud-timer');
    const scorePill = document.getElementById('hud-round-score');
    const modeTag = document.getElementById('hud-mode-tag');
    const modeBanner = document.getElementById('game-mode-banner');
    const modeBannerText = document.getElementById('game-mode-banner-text');
    const toggleDrawingBtn = document.getElementById('btn-toggle-drawing');
    const drawingContainer = document.getElementById('drawing-container');
    const btnTaboo = document.getElementById('btn-action-taboo');
    const controlsBar = document.getElementById('game-controls-bar');
    const btnToggleWord = document.getElementById('btn-toggle-word-visibility');

    if (teamDot) {
      teamDot.style.backgroundColor = currentTeam.color;
      teamDot.style.boxShadow = `0 0 12px ${currentTeam.color}`;
    }
    if (teamName) {
      teamName.textContent = currentTeam.name.toLocaleUpperCase('tr-TR');
      teamName.style.color = currentTeam.color;
    }
    if (timerText) {
      timerText.textContent = this.timeLeft;
      timerText.classList.remove('urgent');
    }
    if (scorePill) {
      const netScore = this.roundStats.correct + (this.roundStats.taboo * this.rules.penaltyScore);
      scorePill.textContent = `${netScore > 0 ? '+' : ''}${netScore} Puan`;
    }
    if (modeTag) {
      modeTag.textContent = this.activeMode.badge;
    }

    // Oyun Modu Banner'ı
    if (modeBanner && modeBannerText) {
      modeBanner.style.display = 'flex';
      modeBannerText.textContent = this.activeMode.rulesText;
    }

    // Çizim Modu Kontrolleri ve Tabu Butonu Ayarı
    if (this.activeMode.id === 'drawing') {
      // Çizim modunda TABU YOKTUR! (2 butonlu kontrol: Pas & Doğru)
      if (btnTaboo) btnTaboo.style.display = 'none';
      if (controlsBar) controlsBar.classList.add('two-buttons');
      // Kelimeyi Gizle / Göster butonu
      if (btnToggleWord) btnToggleWord.style.display = 'flex';
      this.toggleWordVisibility(false);
    } else {
      // Diğer modlarda Tabu butonu aktiftir (3 butonlu kontrol)
      if (btnTaboo) btnTaboo.style.display = 'flex';
      if (controlsBar) controlsBar.classList.remove('two-buttons');
      if (btnToggleWord) btnToggleWord.style.display = 'none';
      this.toggleWordVisibility(false);
    }

    // Çizim Tahtası Görünürlüğü
    if (this.activeMode.hasDrawing) {
      if (toggleDrawingBtn) toggleDrawingBtn.style.display = 'block';
      if (drawingContainer) {
        drawingContainer.classList.add('open');
        setTimeout(() => {
          this.initHostCanvasBoard();
          if (this.canvasBoard) {
            this.canvasBoard.clear();
          }
        }, 50);
      }
    } else {
      if (toggleDrawingBtn) toggleDrawingBtn.style.display = 'none';
      if (drawingContainer) drawingContainer.classList.remove('open');
    }
  }

  updatePassButton() {
    const passCountLbl = document.getElementById('lbl-pass-count');
    const passBtn = document.getElementById('btn-action-pass');

    // Yıldırım Blitz modunda pas tamamen yasaktır
    if (this.activeMode.id === 'blitz') {
      if (passCountLbl) passCountLbl.textContent = 'Yasak';
      if (passBtn) {
        passBtn.style.opacity = '0.3';
        passBtn.style.pointerEvents = 'none';
      }
      return;
    }

    if (this.rules.maxPasses >= 999) {
      if (passCountLbl) passCountLbl.textContent = 'Sınırsız';
      if (passBtn) {
        passBtn.style.opacity = '1';
        passBtn.style.pointerEvents = 'auto';
      }
    } else {
      if (passCountLbl) passCountLbl.textContent = `Kalan: ${this.remainingPasses}`;
      if (passBtn) {
        passBtn.style.opacity = this.remainingPasses <= 0 ? '0.4' : '1';
        passBtn.style.pointerEvents = this.remainingPasses <= 0 ? 'none' : 'auto';
      }
    }
  }

  /* --------------------------------------------------------------------------
     Aksiyonlar: Doğru, Tabu, Pas
     -------------------------------------------------------------------------- */
  handleCorrect() {
    sound.playCorrect();
    this.roundStats.correct++;

    // Blitz (Yıldırım) modunda süre bonusu (+5 saniye)
    if (this.activeMode.bonusTimeOnCorrect > 0) {
      this.timeLeft += this.activeMode.bonusTimeOnCorrect;
      const timerText = document.getElementById('hud-timer');
      if (timerText) {
        timerText.textContent = this.timeLeft;
        timerText.style.color = '#10b981';
        setTimeout(() => (timerText.style.color = ''), 400);
      }
    }

    // Çizim modunda tahtayı temizle
    if (this.activeMode.hasDrawing && this.canvasBoard) {
      this.canvasBoard.clear();
    }

    this.updateHUDScore();
    this.broadcastGameState('SCORE_UPDATE');
    this.drawNewCard();
  }

  handleTaboo() {
    if (this.activeMode.id === 'drawing') return; // Çizim modunda tabu cezası yoktur!
    sound.playTaboo();
    this.roundStats.taboo++;

    // Çizim modunda tahtayı temizle
    if (this.activeMode.hasDrawing && this.canvasBoard) {
      this.canvasBoard.clear();
    }

    this.updateHUDScore();
    this.broadcastGameState('SCORE_UPDATE');
    this.drawNewCard();
  }

  handlePass() {
    if (this.activeMode.id === 'blitz') return;
    if (this.rules.maxPasses < 999 && this.remainingPasses <= 0) {
      return;
    }
    sound.playPass();
    if (this.rules.maxPasses < 999) {
      this.remainingPasses--;
    }
    this.roundStats.pass++;

    // Çizim modunda tahtayı temizle
    if (this.activeMode.hasDrawing && this.canvasBoard) {
      this.canvasBoard.clear();
    }

    this.updatePassButton();
    this.broadcastGameState('SCORE_UPDATE');
    this.drawNewCard();
  }

  updateHUDScore() {
    const scorePill = document.getElementById('hud-round-score');
    if (scorePill) {
      const netScore = this.roundStats.correct + (this.roundStats.taboo * this.rules.penaltyScore);
      scorePill.textContent = `${netScore > 0 ? '+' : ''}${netScore} Puan`;
    }
  }

  /* --------------------------------------------------------------------------
     Süre ve Zamanlayıcı (Timer)
     -------------------------------------------------------------------------- */
  startTimer() {
    this.stopTimer();
    const timerText = document.getElementById('hud-timer');

    this.timer = setInterval(() => {
      this.timeLeft--;

      if (timerText) {
        timerText.textContent = this.timeLeft;
        if (this.timeLeft <= 10) {
          timerText.classList.add('urgent');
          sound.playTick(this.timeLeft <= 3);
        }
      }

      this.broadcastGameState('TIMER_TICK');

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.onRoundFinished();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onRoundFinished() {
    sound.playTimeUp();

    // Takım puanını kaydet
    const currentTeam = this.teams[this.currentTeamIndex];
    const roundNet = this.roundStats.correct + (this.roundStats.taboo * this.rules.penaltyScore);
    currentTeam.score = Math.max(0, currentTeam.score + roundNet);

    this.broadcastGameState('ROUND_FINISHED');
    this.showRoundSummary();
  }

  /* --------------------------------------------------------------------------
     Tur Sonu ve Skor Tahtası
     -------------------------------------------------------------------------- */
  showRoundSummary() {
    const currentTeam = this.teams[this.currentTeamIndex];

    const title = document.getElementById('summary-round-title');
    const desc = document.getElementById('summary-team-desc');
    const statCorrect = document.getElementById('stat-round-correct');
    const statTaboo = document.getElementById('stat-round-taboo');
    const statPass = document.getElementById('stat-round-pass');

    if (title) title.textContent = `${currentTeam.name} Turu Bitti!`;
    if (desc) desc.textContent = `Toplam kazanılan puan: ${this.roundStats.correct + (this.roundStats.taboo * this.rules.penaltyScore)}`;

    if (statCorrect) statCorrect.textContent = this.roundStats.correct;
    if (statTaboo) statTaboo.textContent = this.roundStats.taboo;
    if (statPass) statPass.textContent = this.roundStats.pass;

    // Skor listesini doldur
    const scoreboardList = document.getElementById('scoreboard-list');
    if (scoreboardList) {
      scoreboardList.innerHTML = this.teams
        .map(
          (t, idx) => `
        <div class="scoreboard-row ${idx === this.currentTeamIndex ? 'active' : ''}">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:12px; height:12px; border-radius:50%; background:${t.color}; box-shadow:0 0 8px ${t.color};"></span>
            <span class="scoreboard-team-name">${t.name}</span>
          </div>
          <span class="scoreboard-score">${t.score} Puan</span>
        </div>
      `
        )
        .join('');
    }

    // Kazanma kontrolü
    const winner = this.teams.find((t) => t.score >= this.rules.winScore);
    const nextBtn = document.getElementById('btn-next-round');

    if (winner && nextBtn) {
      title.textContent = `🏆 ${winner.name} KAZANDI! 🏆`;
      nextBtn.textContent = 'Yeni Oyun Başlat';
    } else if (nextBtn) {
      const nextTeamIdx = (this.currentTeamIndex + 1) % this.teams.length;
      nextBtn.textContent = `Sıradaki: ${this.teams[nextTeamIdx].name}`;
    }

    this.switchScreen('screen-summary');
  }

  startNextRound() {
    const winner = this.teams.find((t) => t.score >= this.rules.winScore);
    if (winner) {
      this.startNewGame();
      return;
    }

    // Sıradaki takıma geç
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
    this.startRound();
  }

  /* --------------------------------------------------------------------------
     Özel Kart Kaydetme
     -------------------------------------------------------------------------- */
  saveCustomCard() {
    const wordInput = document.getElementById('custom-word');
    const forbiddenInputs = document.querySelectorAll('.custom-forbidden');

    const word = wordInput?.value.trim();
    if (!word) {
      alert('Lütfen anlatılacak ana kelimeyi yazın.');
      return;
    }

    const forbidden = [];
    forbiddenInputs.forEach((inp) => {
      if (inp.value.trim()) forbidden.push(inp.value.trim());
    });

    if (forbidden.length < 3) {
      alert('Lütfen en az 3 yasaklı kelime girin.');
      return;
    }

    const catSelect = document.getElementById('custom-category-select');
    const category = catSelect?.value || 'ÖZEL KART';

    cardManager.addCustomCard(word, forbidden, category);
    this.renderCategoryChips();
    sound.playCorrect();
    alert(`"${word}" kartı [${category}] kategorisine başarıyla eklendi!`);

    // Formu temizle
    if (wordInput) wordInput.value = '';
    forbiddenInputs.forEach((inp) => (inp.value = ''));
    this.closeModal('modal-custom-cards');
  }

  /* --------------------------------------------------------------------------
     P2P Ağ ve Çok Oyunculu Oda Yönetimi (PeerJS)
     -------------------------------------------------------------------------- */
  startHostMode() {
    this.network = new TabuNetwork(
      (data, conn) => this.handleHostIncomingMessage(data, conn),
      (status) => this.handleNetworkStatus(status)
    );

    this.network
      .createRoom()
      .then((roomCode) => {
        const roomCodeLbl = document.getElementById('lobby-room-code');
        const qrContainer = document.getElementById('lobby-qr-container');

        if (roomCodeLbl) roomCodeLbl.textContent = roomCode;

        // Katılım URL'si üret (Mevcut sayfanın URL'si + #join=KOD)
        const joinUrl = `${window.location.origin}${window.location.pathname}#join=${roomCode}`;
        if (qrContainer) {
          qrContainer.innerHTML = QRCodeSVG.generateSVG(joinUrl, 180);
        }

        this.switchScreen('screen-lobby');
      })
      .catch((err) => {
        alert('Oda oluşturulurken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.');
        this.switchScreen('screen-home');
      });
  }

  copyRoomLink() {
    const roomCode = document.getElementById('lobby-room-code')?.textContent || '';
    const joinUrl = `${window.location.origin}${window.location.pathname}#join=${roomCode}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl).then(() => {
        sound.playClick();
        alert('Oda katılım linki panoya kopyalandı!');
      });
    } else {
      prompt('Oda linki:', joinUrl);
    }
  }

  checkUrlForRoomCode() {
    const hash = window.location.hash;
    if (hash && hash.includes('#join=')) {
      const code = hash.split('#join=')[1];
      if (code) {
        const input = document.getElementById('input-room-code');
        if (input) input.value = decodeURIComponent(code).trim();
        this.openModal('modal-join');
      }
    }
  }

  joinRoomFromInput() {
    const code = document.getElementById('input-room-code')?.value.trim();
    const name = document.getElementById('input-player-name')?.value.trim() || 'Oyuncu';

    if (!code) {
      alert('Lütfen geçerli bir oda kodu girin.');
      return;
    }

    sound.playClick();
    this.closeModal('modal-join');

    this.network = new TabuNetwork(
      (data) => this.handleClientIncomingMessage(data),
      (status) => this.handleNetworkStatus(status)
    );

    this.network
      .joinRoom(code, name)
      .then(() => {
        alert(`Odaya başarıyla bağlandınız! Karşı takım buzzer modunuz hazır.`);
        this.switchScreen('screen-client-buzzer');
      })
      .catch((err) => {
        alert('Odaya bağlanılamadı. Kodun doğruluğunu veya Host cihazın açık olduğunu kontrol edin.');
      });
  }

  handleNetworkStatus(status) {
    if (status.status === 'client_connected' || status.status === 'client_disconnected') {
      const countLbl = document.getElementById('lobby-players-count');
      if (countLbl) {
        countLbl.innerHTML = `Bağlı Cihaz: <strong>${status.count} Oyuncu</strong>`;
      }
    }
  }

  broadcastGameState(eventType) {
    if (!this.network || !this.network.isHost) return;

    const isDrawingMode = this.activeMode.id === 'drawing';
    const roundScore = this.roundStats.correct + (this.roundStats.taboo * this.rules.penaltyScore);

    const payload = {
      type: 'STATE_SYNC',
      eventType,
      team: this.teams[this.currentTeamIndex],
      teams: this.teams,
      roundStats: this.roundStats,
      roundScore: roundScore,
      timeLeft: this.timeLeft,
      // Çizim modunda anlatıcı dışındaki oyuncular kelimeyi ASLA göremez (sadece canlı tahtayı izler)
      card: isDrawingMode ? null : this.currentCard,
      mode: this.activeMode
    };
    this.network.send(payload);
  }

  handleHostIncomingMessage(data, conn) {
    if (data.type === 'BUZZER_TRIGGERED') {
      // Çizim modunda tabu cezası yoktur
      if (this.activeMode.id === 'drawing') return;
      // Karşı takım oyuncusu telefonundan Tabu Buzzer'a bastı!
      this.handleTaboo();
    }
  }

  handleClientIncomingMessage(data) {
    if (data.type === 'DRAW_ACTION') {
      if (!this.clientCanvasBoard) {
        this.clientCanvasBoard = new CanvasBoard('client-live-canvas', { isReadOnly: true });
      }
      this.clientCanvasBoard.applyRemoteAction(data.drawData);
      return;
    }

    if (data.type === 'STATE_SYNC') {
      // Client tarafındaki ekranı canlı güncelle (Hakem veya Canlı Çizim İzleme)
      const clientTeam = document.getElementById('client-hud-team');
      const clientDot = document.getElementById('client-hud-dot');
      const clientTimer = document.getElementById('client-hud-timer');
      const clientScore = document.getElementById('client-hud-score');
      const clientModeTag = document.getElementById('client-hud-mode-tag');
      const clientStage = document.getElementById('client-card-stage');
      const clientBuzzer = document.getElementById('client-buzzer-container');
      const clientLiveDrawing = document.getElementById('client-live-drawing-container');
      const clientDrawingHint = document.getElementById('client-drawing-hint');

      if (clientTeam && data.team) {
        clientTeam.textContent = `${data.team.name} Anlatıyor`;
        clientTeam.style.color = data.team.color;
      }
      if (clientDot && data.team) {
        clientDot.style.backgroundColor = data.team.color;
        clientDot.style.boxShadow = `0 0 10px ${data.team.color}`;
      }
      if (clientTimer) {
        clientTimer.textContent = data.timeLeft;
        if (data.timeLeft <= 10) {
          clientTimer.classList.add('urgent');
        } else {
          clientTimer.classList.remove('urgent');
        }
      }
      if (clientScore && data.roundScore !== undefined) {
        clientScore.textContent = `${data.roundScore > 0 ? '+' : ''}${data.roundScore} Puan`;
      }
      if (clientModeTag && data.mode) {
        clientModeTag.textContent = data.mode.badge || 'CANLI';
      }

      const isDrawing = data.mode?.id === 'drawing';

      if (isDrawing) {
        // Çizim modunda: Kart ve Buzzer GİZLENİR, sadece canlı yazı tahtası GÖSTERİLİR
        if (clientStage) clientStage.style.display = 'none';
        if (clientBuzzer) clientBuzzer.style.display = 'none';
        if (clientLiveDrawing) clientLiveDrawing.style.display = 'block';
        if (clientDrawingHint) clientDrawingHint.style.display = 'flex';

        if (!this.clientCanvasBoard) {
          this.clientCanvasBoard = new CanvasBoard('client-live-canvas', { isReadOnly: true });
        }

        if (data.eventType === 'NEW_CARD' || data.eventType === 'ROUND_START') {
          this.clientCanvasBoard.clearLocal();
        }
      } else {
        // Klasik ve diğer modlarda: Kart sahnesi ve Tabu Buzzer gösterilir
        if (clientLiveDrawing) clientLiveDrawing.style.display = 'none';
        if (clientDrawingHint) clientDrawingHint.style.display = 'none';
        if (clientStage) {
          clientStage.style.display = 'block';
          if (data.card) {
            clientStage.innerHTML = CardSVGTemplate.renderCard(data.card, data.team?.color || '#ef4444');
          }
        }
        if (clientBuzzer) clientBuzzer.style.display = 'block';
      }

      if (data.eventType === 'ROUND_FINISHED') {
        sound.playTimeUp();
      }
    }
  }

  triggerClientBuzzer() {
    sound.playTaboo();
    if (this.network) {
      this.network.send({ type: 'BUZZER_TRIGGERED' });
    }
  }
}

// Uygulamayı Başlat
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.tabuApp = new TabuApp();
  });
}
