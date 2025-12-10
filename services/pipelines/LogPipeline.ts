
import { AuditLog } from '../../types';

abstract class LogHandler {
  protected next: LogHandler | null = null;

  setNext(handler: LogHandler): LogHandler {
    this.next = handler;
    return handler;
  }

  abstract handle(log: AuditLog): AuditLog | null;
}

// 1. Sanitizer
export class PiiSanitizer extends LogHandler {
  handle(log: AuditLog): AuditLog | null {
    const sanitized = { ...log };
    // Simple regex for scrubbing emails
    sanitized.details = sanitized.details.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[REDACTED_EMAIL]');
    return this.next ? this.next.handle(sanitized) : sanitized;
  }
}

// 2. Normalizer
export class TypeNormalizer extends LogHandler {
  handle(log: AuditLog): AuditLog | null {
    const normalized = { ...log, action: log.action.toUpperCase().trim() };
    return this.next ? this.next.handle(normalized) : normalized;
  }
}

// 3. Filter
export class NoiseFilter extends LogHandler {
  handle(log: AuditLog): AuditLog | null {
    if (log.action === 'PING' || log.action === 'HEARTBEAT') return null; // Drop log
    return this.next ? this.next.handle(log) : log;
  }
}

export const logPipeline = new PiiSanitizer();
logPipeline.setNext(new TypeNormalizer()).setNext(new NoiseFilter());
