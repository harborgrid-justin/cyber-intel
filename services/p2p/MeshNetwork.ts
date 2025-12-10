
export class MeshNetwork {
  private peer: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  constructor() {
    // In a real app, STUN/TURN servers are required
    this.peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  }

  createChannel() {
    if (!this.peer) return;
    this.dataChannel = this.peer.createDataChannel('sentinel-mesh');
    this.dataChannel.onmessage = (e) => console.log('Mesh Message:', e.data);
    this.dataChannel.onopen = () => console.log('Mesh Connected');
  }

  async createOffer() {
    if (!this.peer) return null;
    this.createChannel();
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    // In prod, signal this offer to other peer via WebSocket
    return JSON.stringify(offer);
  }

  send(data: any) {
    if (this.dataChannel?.readyState === 'open') {
        this.dataChannel.send(JSON.stringify(data));
    }
  }
}
export const analystMesh = new MeshNetwork();
