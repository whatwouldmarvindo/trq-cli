import { DsDDB } from "./deps.ts";
import { Command, LogEntry } from "./log_entry.ts";

export type Log = {
  type: Command;
  time: string;
};

export class Store {
  #db: DsDDB<Log>;
  constructor() {
    this.#db = new DsDDB();
    this.#db.load();
  }

  async write(action: LogEntry) {
    this.#db.set(action.key, action.value);
    await this.#db.write();
  }

  get(key: string): Log {
    return this.#db.get(key);
  }
}
