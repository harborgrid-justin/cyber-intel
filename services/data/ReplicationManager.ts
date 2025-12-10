
interface IStore { update(id: string, data: any): Promise<void>; }

export class ReplicationManager {
  private replicas: IStore[] = [];

  registerReplica(store: IStore) {
    this.replicas.push(store);
  }

  async replicate(id: string, data: any) {
    const promises = this.replicas.map(r => r.update(id, data).catch(e => console.error('Replication failed', e)));
    await Promise.all(promises);
  }
}
