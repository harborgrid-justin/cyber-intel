
export enum LogLevel { DEBUG = 'DEBUG', INFO = 'INFO', WARN = 'WARN', ERROR = 'ERROR' }

export interface LogEntry {
  ts: string;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  meta?: any;
}

class LoggerService {
  private context: Record<string, any> = {};

  setContext(key: string, value: any) {
    this.context[key] = value;
  }

  private emit(level: LogLevel, message: string, meta?: any) {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, url: window.location.pathname },
      meta
    };

    // In production, this would dispatch to an HTTP endpoint (e.g. /api/logs)
    // using navigator.sendBeacon or a batched worker.
    if (level === LogLevel.ERROR) {
      console.error(JSON.stringify(entry));
    } else if (level === LogLevel.WARN) {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  debug(msg: string, meta?: any) { this.emit(LogLevel.DEBUG, msg, meta); }
  info(msg: string, meta?: any) { this.emit(LogLevel.INFO, msg, meta); }
  warn(msg: string, meta?: any) { this.emit(LogLevel.WARN, msg, meta); }
  error(msg: string, meta?: any) { this.emit(LogLevel.ERROR, msg, meta); }
}

export const Logger = new LoggerService();
