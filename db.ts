import { DsDDB } from "./deps.ts";
import { Day } from "./data_structure.ts";

export class DB {
  #db: DsDDB<Day>;
  private readonly ready: Promise<boolean>;

  constructor() {
    this.#db = new DsDDB();
    this.ready = this.#db.load();
  }

  async write(key: string, day: Day) {
    await this.ready;
    this.#db.set(key, day);
    return this.#db.write();
  }

  async getDay(key: string): Promise<Day | undefined> {
    await this.ready;
    return this.#db.get(key);
  }

  public deleteEverything(): Promise<void> {
    return this.#db.deleteStore();
  }
}
