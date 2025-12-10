
import { Asset } from '../models/infrastructure';
import { AuditService } from './audit.service';
import { ModelStatic } from 'sequelize';

const AssetModel = Asset as ModelStatic<Asset>;

interface CreateAssetInput {
  name: string;
  type: string;
  ip: string;
  criticality?: string;
  owner?: string;
  securityControls?: string[];
  dataSensitivity?: string;
  dataVolumeGB?: number;
}

export class AssetService {
  static async getAll(): Promise<Asset[]> {
    return await AssetModel.findAll({ order: [['criticality', 'DESC']] });
  }

  static async create(data: CreateAssetInput, userId: string): Promise<Asset> {
    const id = `NODE-${Date.now()}`;
    const asset = await AssetModel.create({
      id,
      name: data.name,
      type: data.type,
      ip_address: data.ip,
      status: 'ONLINE',
      criticality: data.criticality || 'MEDIUM',
      owner: data.owner || 'Unassigned',
      last_seen: new Date(),
      security_controls: data.securityControls || [],
      data_sensitivity: data.dataSensitivity || 'INTERNAL',
      data_volume_gb: data.dataVolumeGB || 0,
      load: 0,
      latency: 0
    } as Asset);

    await AuditService.log(userId, 'ASSET_REGISTERED', `Added new asset ${data.name}`, id);
    return asset;
  }

  static async updateStatus(id: string, status: string, userId: string): Promise<Asset | null> {
    const asset = await AssetModel.findByPk(id);
    if (asset) {
      asset.status = status;
      await asset.save();
      await AuditService.log(userId, 'ASSET_STATUS_CHANGE', `Asset ${id} is now ${status}`, id);
      return asset;
    }
    return null;
  }
}
