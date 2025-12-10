
import { Channel, Message } from '../models/system';

export class MessagingService {
  static async getChannels(userId: string): Promise<Channel[]> {
    // In a real app, filter by membership. userId included for future RBAC logic.
    return await (Channel as any).findAll();
  }

  static async getMessages(channelId: string): Promise<Message[]> {
    const msgs = await (Message as any).findAll({
      where: { channel_id: channelId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    return msgs.reverse();
  }

  static async sendMessage(channelId: string, content: string, userId: string): Promise<Message> {
    return await (Message as any).create({
      id: `MSG-${Date.now()}`,
      channel_id: channelId,
      user_id: userId,
      content,
      type: 'TEXT'
    });
  }

  static async createChannel(name: string, type: string, userId: string): Promise<Channel> {
    return await (Channel as any).create({
      id: `CHAN-${Date.now()}`,
      name,
      type,
      created_by: userId,
      members: ['ALL'] // Default
    });
  }
}
