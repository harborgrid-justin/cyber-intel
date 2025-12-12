
import { Channel, TeamMessage } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result, ok } from '../../types/result';

export class MessagingStore extends BaseStore<Channel> {
  // Store messages separately in memory for now, usually would be a separate table
  private messages: TeamMessage[] = [];

  constructor(key: string, initialChannels: Channel[], initialMessages: TeamMessage[], adapter: DatabaseAdapter, mapper?: DataMapper<Channel>) {
    super(key, initialChannels, adapter, mapper);
    this.messages = initialMessages;
  }

  getChannels(): Result<Channel[]> {
    return this.getAll();
  }

  getChannel(id: string): Result<Channel | undefined> {
    return this.getById(id);
  }

  getMessages(channelId: string): TeamMessage[] {
    return this.messages.filter(m => m.channelId === channelId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  sendMessage(msg: TeamMessage): Result<void> {
    this.messages.push(msg);
    this.notify();
    return ok(undefined);
  }

  createChannel(c: Channel): Result<void> {
    return this.add(c);
  }
}
