
import { Channel, TeamMessage } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class MessagingStore extends BaseStore<Channel> {
  // Store messages separately in memory for now, usually would be a separate table
  private messages: TeamMessage[] = [];

  constructor(key: string, initialChannels: Channel[], initialMessages: TeamMessage[], adapter: DatabaseAdapter, mapper?: DataMapper<Channel>) {
    super(key, initialChannels, adapter, mapper);
    this.messages = initialMessages;
  }

  getChannels() {
    return this.getAll();
  }

  getChannel(id: string) {
    return this.getById(id);
  }

  getMessages(channelId: string) {
    return this.messages.filter(m => m.channelId === channelId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  sendMessage(msg: TeamMessage) {
    this.messages.push(msg);
    this.notify();
  }

  createChannel(c: Channel) {
    this.add(c);
  }
}
