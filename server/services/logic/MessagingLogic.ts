
import { TeamMessage, Channel, SystemUser } from '../../types';

export class MessagingLogic {
  static formatMessageTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  static processMessageContent(content: string, users: SystemUser[]): { processed: string, mentions: string[] } {
    let processed = content;
    const mentions: string[] = [];
    
    // Simple @mention detection
    const regex = /@(\w+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const username = match[1];
        if (users.some(u => u.name.toLowerCase().includes(username.toLowerCase()))) {
            mentions.push(username);
        }
    }
    
    // Highlight keywords
    if (content.includes('BREACH') || content.includes('CRITICAL')) {
        processed = `[URGENT] ${processed}`;
    }

    return { processed, mentions };
  }

  static getChannelIcon(type: Channel['type']): string {
    switch (type) {
        case 'WAR_ROOM': return '🚨';
        case 'PRIVATE': return '🔒';
        case 'DM': return '👤';
        default: return '#';
    }
  }

  static sortChannels(channels: Channel[]): Channel[] {
    // War rooms first, then public, then private
    return channels.sort((a, b) => {
        const priority = { 'WAR_ROOM': 0, 'PUBLIC': 1, 'PRIVATE': 2, 'DM': 3 };
        return priority[a.type] - priority[b.type];
    });
  }
}
