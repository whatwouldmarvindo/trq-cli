import { Log, Store } from "./store.ts";

export type Command = "start" | "stop" | "pause";

export class LogEntry {
  isoDate: string;
  command: Command;
  dateString: string;
  #store: Store;

  constructor(command: Command, store: Store, date?: Date) {
    this.command = command;
    if (!date) {
      date = new Date();
    }
    this.isoDate = date.toISOString();
    this.dateString = date.toDateString();
    this.#store = store;
  }

  get key() {
    return this.dateString + this.command;
  }

  persist() {
    this.#store.write(this);
  }

  get value(): Log {
    return {
      time: this.isoDate,
      type: this.command,
    };
  }
}
