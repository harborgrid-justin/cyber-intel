import { Injectable } from '@nestjs/common';
import { EvidenceStore } from '../services/stores/evidenceStore';
import { ChainEvent, Malware, ForensicJob, Device, Pcap } from '@/types';
import { MOCK_CHAIN, MOCK_MALWARE, MOCK_LAB_JOBS, MOCK_DEVICES, MOCK_PCAPS } from '../constants';

@Injectable()
export class EvidenceService {
  private evidenceStore: EvidenceStore;

  constructor() {
    this.evidenceStore = new EvidenceStore(
      MOCK_CHAIN,
      MOCK_MALWARE,
      MOCK_LAB_JOBS,
      MOCK_DEVICES,
      MOCK_PCAPS
    );
  }

  // Chain of Custody
  getChainEvents(): ChainEvent[] {
    return this.evidenceStore.getChainEvents();
  }

  getChainEvent(id: string): ChainEvent | undefined {
    return this.evidenceStore.getChainEvent(id);
  }

  addChainEvent(event: Omit<ChainEvent, 'id'>): ChainEvent {
    const newEvent: ChainEvent = {
      id: `ce-${Date.now()}`,
      ...event
    };
    this.evidenceStore.addChainEvent(newEvent);
    return newEvent;
  }

  // Malware
  getMalware(): Malware[] {
    return this.evidenceStore.getMalware();
  }

  getMalwareById(id: string): Malware | undefined {
    return this.evidenceStore.getMalwareById(id);
  }

  addMalware(sample: Omit<Malware, 'id'>): Malware {
    const newSample: Malware = {
      id: `mw-${Date.now()}`,
      ...sample
    };
    this.evidenceStore.addMalware(newSample);
    return newSample;
  }

  // Forensic Jobs
  getForensicJobs(): ForensicJob[] {
    return this.evidenceStore.getForensicJobs();
  }

  getForensicJob(id: string): ForensicJob | undefined {
    return this.evidenceStore.getForensicJob(id);
  }

  createForensicJob(job: Omit<ForensicJob, 'id'>): ForensicJob {
    const newJob: ForensicJob = {
      id: `fj-${Date.now()}`,
      ...job
    };
    this.evidenceStore.addForensicJob(newJob);
    return newJob;
  }

  updateForensicJob(id: string, updates: Partial<ForensicJob>): ForensicJob | undefined {
    return this.evidenceStore.updateForensicJob(id, updates);
  }

  // Devices
  getDevices(): Device[] {
    return this.evidenceStore.getDevices();
  }

  getDevice(id: string): Device | undefined {
    return this.evidenceStore.getDevice(id);
  }

  addDevice(device: Omit<Device, 'id'>): Device {
    const newDevice: Device = {
      id: `dev-${Date.now()}`,
      ...device
    };
    this.evidenceStore.addDevice(newDevice);
    return newDevice;
  }

  updateDevice(id: string, updates: Partial<Device>): Device | undefined {
    return this.evidenceStore.updateDevice(id, updates);
  }

  quarantineDevice(id: string): Device | undefined {
    return this.evidenceStore.updateDevice(id, { status: 'QUARANTINED' });
  }

  releaseDevice(id: string): Device | undefined {
    return this.evidenceStore.updateDevice(id, { status: 'RELEASED' });
  }

  // PCAPs
  getPcaps(): Pcap[] {
    return this.evidenceStore.getPcaps();
  }

  getPcap(id: string): Pcap | undefined {
    return this.evidenceStore.getPcap(id);
  }

  addPcap(pcap: Omit<Pcap, 'id'>): Pcap {
    const newPcap: Pcap = {
      id: `pcap-${Date.now()}`,
      ...pcap
    };
    this.evidenceStore.addPcap(newPcap);
    return newPcap;
  }

  updatePcap(id: string, updates: Partial<Pcap>): Pcap | undefined {
    return this.evidenceStore.updatePcap(id, updates);
  }

  analyzePcap(id: string): Pcap | undefined {
    return this.evidenceStore.updatePcap(id, { analysisStatus: 'ANALYZED' });
  }

  // Analytics
  getEvidenceStats() {
    return this.evidenceStore.getEvidenceStats();
  }

  getMalwareByVerdict(verdict: string): Malware[] {
    return this.evidenceStore.getMalware().filter(m => m.verdict === verdict);
  }

  getDevicesByStatus(status: string): Device[] {
    return this.evidenceStore.getDevices().filter(d => d.status === status);
  }

  getForensicJobsByStatus(status: string): ForensicJob[] {
    return this.evidenceStore.getForensicJobs().filter(j => j.status === status);
  }

  getPcapsByStatus(status: string): Pcap[] {
    return this.evidenceStore.getPcaps().filter(p => p.analysisStatus === status);
  }
}