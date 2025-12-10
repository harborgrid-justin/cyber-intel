
export interface ICommand {
  execute(): void;
  undo(): void;
}

export class CommandManager {
  private history: ICommand[] = [];
  private future: ICommand[] = [];

  execute(command: ICommand) {
    command.execute();
    this.history.push(command);
    this.future = []; // Clear redo stack
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.future.push(command);
    }
  }

  redo() {
    const command = this.future.pop();
    if (command) {
      command.execute();
      this.history.push(command);
    }
  }

  canUndo(): boolean { return this.history.length > 0; }
  canRedo(): boolean { return this.future.length > 0; }
}

export const commandManager = new CommandManager();
