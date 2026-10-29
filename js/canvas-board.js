/**
 * TabuPlus - Canlı Çizim Tahtası (Real-time Live Whiteboard)
 * Hem yerel dokunmatik çizim hem de P2P canlı senkronizasyon (Remote Streaming) destekler.
 * Ekran boyutlarından bağımsız (0..1 oranında normalize koordinatlar) çalışır.
 */

export class CanvasBoard {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.currentColor = options.initialColor || '#ffffff';
    this.currentLineWidth = options.initialWidth || 4;
    this.isEraser = false;
    this.isReadOnly = options.isReadOnly || false; // İzleyici modu
    this.onDrawAction = options.onDrawAction || null; // P2P yayını için callback

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    if (!this.isReadOnly) {
      // Çizim Olayları (Pointer Events - Dokunmatik & Mouse)
      this.canvas.addEventListener('pointerdown', (e) => this.startDrawing(e));
      this.canvas.addEventListener('pointermove', (e) => this.draw(e));
      this.canvas.addEventListener('pointerup', () => this.stopDrawing());
      this.canvas.addEventListener('pointerleave', () => this.stopDrawing());
      this.canvas.addEventListener('pointercancel', () => this.stopDrawing());
    }
  }

  setReadOnly(isReadOnly) {
    this.isReadOnly = isReadOnly;
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Canvas çözünürlüğünü ayarla
    this.displayW = rect.width || 320;
    this.displayH = rect.height || 260;

    this.canvas.width = this.displayW * dpr;
    this.canvas.height = this.displayH * dpr;
    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  getNormalizedPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };
  }

  startDrawing(e) {
    if (this.isReadOnly) return;
    this.isDrawing = true;
    const norm = this.getNormalizedPos(e);

    const actualX = norm.x * this.displayW;
    const actualY = norm.y * this.displayH;

    this.ctx.beginPath();
    this.ctx.moveTo(actualX, actualY);

    if (this.onDrawAction) {
      this.onDrawAction({
        action: 'START',
        x: norm.x,
        y: norm.y,
        color: this.isEraser ? '#161626' : this.currentColor,
        lineWidth: this.isEraser ? this.currentLineWidth * 3 : this.currentLineWidth
      });
    }
  }

  draw(e) {
    if (!this.isDrawing || this.isReadOnly) return;
    const norm = this.getNormalizedPos(e);

    const actualX = norm.x * this.displayW;
    const actualY = norm.y * this.displayH;

    this.ctx.strokeStyle = this.isEraser ? '#161626' : this.currentColor;
    this.ctx.lineWidth = this.isEraser ? this.currentLineWidth * 3 : this.currentLineWidth;

    this.ctx.lineTo(actualX, actualY);
    this.ctx.stroke();

    if (this.onDrawAction) {
      this.onDrawAction({
        action: 'MOVE',
        x: norm.x,
        y: norm.y
      });
    }
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.ctx.closePath();
      this.isDrawing = false;
      if (this.onDrawAction) {
        this.onDrawAction({ action: 'END' });
      }
    }
  }

  /**
   * P2P Ağdan gelen çizim verisini ekrana uygular (Remote Drawing)
   */
  applyRemoteAction(data) {
    if (!this.ctx || !this.displayW) this.resize();

    const actualX = data.x * this.displayW;
    const actualY = data.y * this.displayH;

    if (data.action === 'START') {
      this.ctx.beginPath();
      this.ctx.strokeStyle = data.color || '#ffffff';
      this.ctx.lineWidth = data.lineWidth || 4;
      this.ctx.moveTo(actualX, actualY);
    } else if (data.action === 'MOVE') {
      this.ctx.lineTo(actualX, actualY);
      this.ctx.stroke();
    } else if (data.action === 'END') {
      this.ctx.closePath();
    } else if (data.action === 'CLEAR') {
      this.clearLocal();
    }
  }

  setColor(color) {
    this.isEraser = false;
    this.currentColor = color;
  }

  setEraser() {
    this.isEraser = true;
  }

  clearLocal() {
    if (!this.ctx || !this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
  }

  clear() {
    this.clearLocal();
    if (this.onDrawAction) {
      this.onDrawAction({ action: 'CLEAR' });
    }
  }
}
