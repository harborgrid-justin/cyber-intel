
import { Artifact, ChainEvent } from '../models/operations';
import { AuditService } from './audit.service';

interface CreateEvidenceInput {
  name: string;
  type: string;
  hash?: string;
  size?: string;
  caseId: string;
}

export class EvidenceService {
  static async getAll(): Promise<Artifact[]> {
    return await (Artifact as any).findAll({ order: [['upload_date', 'DESC']] });
  }

  static async create(data: CreateEvidenceInput, userId: string): Promise<Artifact> {
    const id = `ART-${Date.now()}`;
    const artifact = await (Artifact as any).create({
      id,
      name: data.name,
      type: data.type,
      hash: data.hash || 'UNKNOWN',
      size: data.size || '0KB',
      uploaded_by: userId,
      upload_date: new Date(),
      status: 'SECURE',
      case_id: data.caseId
    });
    
    // Log Chain of Custody Start
    await (ChainEvent as any).create({
      id: `chain-${Date.now()}`,
      artifact_id: id,
      action: 'CHECK_IN',
      user_id: userId,
      timestamp: new Date(),
      notes: 'Initial Upload'
    });
    
    // Audit Log is separate from Chain of Custody
    await AuditService.log(userId, 'EVIDENCE_UPLOAD', `Uploaded ${data.name}`, id);
      
    return artifact;
  }

  static async getChainOfCustody(artifactId: string): Promise<ChainEvent[]> {
    return await (ChainEvent as any).findAll({
      where: { artifact_id: artifactId },
      order: [['timestamp', 'DESC']]
    });
  }
}
