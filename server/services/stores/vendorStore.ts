
import { Vendor } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class VendorStore extends BaseStore<Vendor> {
  constructor(key: string, initialData: Vendor[], adapter: DatabaseAdapter, mapper?: DataMapper<Vendor>) {
    super(key, initialData, adapter, mapper);
  }

  getByTier(tier: Vendor['tier']): Vendor[] {
    return this.items.filter(v => v.tier === tier);
  }

  getHighRisk(): Vendor[] {
    return this.items.filter(v => v.riskScore > 75);
  }
}
