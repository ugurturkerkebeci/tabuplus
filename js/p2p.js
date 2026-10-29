/**
 * TabuPlus - P2P Network Engine (PeerJS WebRTC DataChannel)
 * Sıfır sunucu yükü. Sunucuda Python/Node.js çalıştırmaz.
 * Host tarayıcısı mini-sunucu gibi davranır, istemciler P2P bağlanır.
 */

export class TabuNetwork {
  constructor(onMessageCallback, onStatusChangeCallback) {
    this.peer = null;
    this.isHost = false;
    this.roomCode = null;
    this.connections = []; // Host için bağlı peer'lar
    this.hostConnection = null; // Client için host bağlantısı
    this.onMessage = onMessageCallback || (() => {});
    this.onStatusChange = onStatusChangeCallback || (() => {});
    this.peerId = null;
  }

  /**
   * Rastgele 4 haneli akılda kalıcı oda kodu üretir (Örn: TP-4821)
   */
  generateRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TP-${code}`;
  }

  /**
   * Host Olarak Oda Başlat
   */
  createRoom(customCode = null) {
    return new Promise((resolve, reject) => {
      if (!window.Peer) {
        return reject(new Error('PeerJS kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.'));
      }
      this.isHost = true;
      this.roomCode = customCode || this.generateRoomCode();
      const peerId = `tabuplus-${this.roomCode.toLowerCase()}`;

      try {
        // PeerJS bulut sunucusu (Tamamen ücretsiz, 0 backend gereksinimi)
        this.peer = new window.Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });
      } catch (e) {
        return reject(e);
      }

      this.peer.on('open', (id) => {
        this.peerId = id;
        this.onStatusChange({ status: 'ready', isHost: true, roomCode: this.roomCode });
        resolve(this.roomCode);
      });

      this.peer.on('connection', (conn) => {
        this.setupHostConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Hatası:', err);
        // Eğer ID çakışması olursa yeni kod dene
        if (err.type === 'unavailable-id') {
          this.peer.destroy();
          this.createRoom().then(resolve).catch(reject);
        } else {
          this.onStatusChange({ status: 'error', error: err });
          reject(err);
        }
      });
    });
  }

  /**
   * Host: Gelen bağlantıyı yönet
   */
  setupHostConnection(conn) {
    this.connections.push(conn);

    conn.on('open', () => {
      this.onStatusChange({
        status: 'client_connected',
        count: this.connections.length,
        peerId: conn.peer
      });
    });

    conn.on('data', (data) => {
      this.onMessage(data, conn);
    });

    conn.on('close', () => {
      this.connections = this.connections.filter((c) => c !== conn);
      this.onStatusChange({
        status: 'client_disconnected',
        count: this.connections.length
      });
    });
  }

  /**
   * Client: Odaya Katıl
   */
  joinRoom(roomCode, playerName = 'Oyuncu') {
    return new Promise((resolve, reject) => {
      if (!window.Peer) {
        return reject(new Error('PeerJS kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.'));
      }
      this.isHost = false;
      this.roomCode = roomCode.toUpperCase().trim();
      const targetPeerId = `tabuplus-${this.roomCode.toLowerCase()}`;

      try {
        this.peer = new window.Peer(null, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });
      } catch (e) {
        return reject(e);
      }

      this.peer.on('open', (myId) => {
        this.peerId = myId;
        const conn = this.peer.connect(targetPeerId, {
          reliable: true,
          metadata: { name: playerName }
        });

        conn.on('open', () => {
          this.hostConnection = conn;
          this.onStatusChange({ status: 'connected_to_host', roomCode: this.roomCode });
          resolve();
        });

        conn.on('data', (data) => {
          this.onMessage(data, conn);
        });

        conn.on('close', () => {
          this.onStatusChange({ status: 'host_disconnected' });
        });

        conn.on('error', (err) => {
          this.onStatusChange({ status: 'error', error: err });
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        this.onStatusChange({ status: 'error', error: err });
        reject(err);
      });
    });
  }

  /**
   * Mesaj Gönder (Host ise herkese veya belirli kişiye, Client ise Host'a)
   */
  send(data) {
    if (this.isHost) {
      // Herkese yayınla (Broadcast)
      this.connections.forEach((conn) => {
        if (conn.open) {
          conn.send(data);
        }
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      // Host'a ilet
      this.hostConnection.send(data);
    }
  }

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
    }
    this.connections = [];
    this.hostConnection = null;
  }
}
