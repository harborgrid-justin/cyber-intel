
export interface ICommand { type: string; payload: any; }
export interface IQuery { type: string; payload: any; }

type CommandHandler = (cmd: ICommand) => Promise<void>;
type QueryHandler = (query: IQuery) => Promise<any>;

export class CqrsBus {
  private cmdHandlers: Map<string, CommandHandler> = new Map();
  private queryHandlers: Map<string, QueryHandler> = new Map();

  registerCommand(type: string, handler: CommandHandler) {
    this.cmdHandlers.set(type, handler);
  }

  registerQuery(type: string, handler: QueryHandler) {
    this.queryHandlers.set(type, handler);
  }

  async execute(cmd: ICommand) {
    const handler = this.cmdHandlers.get(cmd.type);
    if (!handler) throw new Error(`No handler for command: ${cmd.type}`);
    console.debug(`[CQRS] Executing Command: ${cmd.type}`);
    await handler(cmd);
  }

  async query(q: IQuery) {
    const handler = this.queryHandlers.get(q.type);
    if (!handler) throw new Error(`No handler for query: ${q.type}`);
    console.debug(`[CQRS] Executing Query: ${q.type}`);
    return await handler(q);
  }
}

export const bus = new CqrsBus();
