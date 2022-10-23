import { DsDDB } from "./deps.ts";
import { Command, LogEntry } from "./log_entry.ts";

export type Log = {
  type: Command;
  time: string;
};

export class Store {
  #db: DsDDB<Log>;
  ready = false;
  constructor() {
    this.#db = new DsDDB();
    this.#db.load().then((v) => this.ready = v);
  }

  async write(action: LogEntry) {
    if (!this.ready) {
      console.log("not ready", this.ready)
      setTimeout(() => {
        console.log(this.ready)
      }, 500) 
    }
    this.#db.set(action.key, action.value);
    await this.#db.write();
  }

  get(key: string): Log {
    return this.#db.get(key);
  }
}
