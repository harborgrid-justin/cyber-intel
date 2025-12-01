import { ChainEvent, Malware, ForensicJob, Device, Pcap } from '@/types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class EvidenceStore {
  private chainEvents: ChainEvent[] = [];
  private malware: Malware[] = [];
  private forensicJobs: ForensicJob[] = [];
  private devices: Device[] = [];
  private pcaps: Pcap[] = [];

  constructor(
    chainEvents: ChainEvent[],
    malware: Malware[],
    forensicJobs: ForensicJob[],
    devices: Device[],
    pcaps: Pcap[]
  ) {
    this.chainEvents = chainEvents;
    this.malware = malware;
    this.forensicJobs = forensicJobs;
    this.devices = devices;
    this.pcaps = pcaps;
  }

  // Chain of Custody
  getChainEvents(): ChainEvent[] {
    return [...this.chainEvents];
  }

  addChainEvent(event: ChainEvent): void {
    this.chainEvents.push(event);
  }

  getChainEvent(id: string): ChainEvent | undefined {
    return this.chainEvents.find(e => e.id === id);
  }

  // Malware
  getMalware(): Malware[] {
    return [...this.malware];
  }

  addMalware(sample: Malware): void {
    this.malware.push(sample);
  }

  getMalwareById(id: string): Malware | undefined {
    return this.malware.find(m => m.id === id);
  }

  // Forensic Jobs
  getForensicJobs(): ForensicJob[] {
    return [...this.forensicJobs];
  }

  addForensicJob(job: ForensicJob): void {
    this.forensicJobs.push(job);
  }

  getForensicJob(id: string): ForensicJob | undefined {
    return this.forensicJobs.find(j => j.id === id);
  }

  updateForensicJob(id: string, updates: Partial<ForensicJob>): ForensicJob | undefined {
    const index = this.forensicJobs.findIndex(j => j.id === id);
    if (index === -1) return undefined;
    this.forensicJobs[index] = { ...this.forensicJobs[index], ...updates };
    return this.forensicJobs[index];
  }

  // Devices
  getDevices(): Device[] {
    return [...this.devices];
  }

  addDevice(device: Device): void {
    this.devices.push(device);
  }

  getDevice(id: string): Device | undefined {
    return this.devices.find(d => d.id === id);
  }

  updateDevice(id: string, updates: Partial<Device>): Device | undefined {
    const index = this.devices.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    this.devices[index] = { ...this.devices[index], ...updates };
    return this.devices[index];
  }

  // PCAPs
  getPcaps(): Pcap[] {
    return [...this.pcaps];
  }

  addPcap(pcap: Pcap): void {
    this.pcaps.push(pcap);
  }

  getPcap(id: string): Pcap | undefined {
    return this.pcaps.find(p => p.id === id);
  }

  updatePcap(id: string, updates: Partial<Pcap>): Pcap | undefined {
    const index = this.pcaps.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.pcaps[index] = { ...this.pcaps[index], ...updates };
    return this.pcaps[index];
  }

  // Analytics
  getEvidenceStats() {
    return {
      chainEvents: this.chainEvents.length,
      malware: this.malware.length,
      forensicJobs: this.forensicJobs.length,
      devices: this.devices.length,
      pcaps: this.pcaps.length,
      maliciousSamples: this.malware.filter(m => m.verdict === 'MALICIOUS').length,
      activeJobs: this.forensicJobs.filter(j => j.status === 'PROCESSING').length,
      quarantinedDevices: this.devices.filter(d => d.status === 'QUARANTINED').length,
      analyzedPcaps: this.pcaps.filter(p => p.analysisStatus === 'ANALYZED').length
    };
  }
}