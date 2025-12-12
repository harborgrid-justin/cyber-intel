
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

interface UpdateAssetInput extends Partial<CreateAssetInput> {
  status?: string;
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

  static async getById(id: string): Promise<Asset | null> {
    return await AssetModel.findByPk(id);
  }

  static async update(id: string, data: UpdateAssetInput, userId: string): Promise<Asset | null> {
    const asset = await AssetModel.findByPk(id);
    if (asset) {
      if (data.name) asset.name = data.name;
      if (data.type) asset.type = data.type;
      if (data.ip) asset.ip_address = data.ip;
      if (data.status) asset.status = data.status;
      if (data.criticality) asset.criticality = data.criticality;
      if (data.owner) asset.owner = data.owner;
      if (data.securityControls) asset.security_controls = data.securityControls;
      if (data.dataSensitivity) asset.data_sensitivity = data.dataSensitivity;
      if (data.dataVolumeGB !== undefined) asset.data_volume_gb = data.dataVolumeGB;

      await asset.save();
      await AuditService.log(userId, 'ASSET_UPDATED', `Updated asset ${id}`, id);
      return asset;
    }
    return null;
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

  static async delete(id: string, userId: string): Promise<boolean> {
    const asset = await AssetModel.findByPk(id);
    if (asset) {
      await asset.destroy();
      await AuditService.log(userId, 'ASSET_DELETED', `Deleted asset ${id}`, id);
      return true;
    }
    return false;
  }
}
