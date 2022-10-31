// export type LogType = "start" | "stop" | "pause";

// export class Logs {
//   date: Date;
//   logType: LogType;
//   public id: string;

//   constructor(logType: LogType, date?: Date) {
//     this.logType = logType;
//     if (!date) {
//       date = new Date();
//     }
//     this.date = date;
//     this.id = this.generateId(date);
//   }

//   private generateId(date: Date) {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const day = date.getDay();
//     return `${year}:${month}:${day}`;
//   }

//   get value(): Log {
//     return {
//       time: this.date,
//       type: this.logType,
//     };
//   }
// }

// export class LogsDao implements Dao<Logs> {
//   store: Store;

//   constructor(store: Store) {
//     this.store = store;
//   }

//   get(id: string): Logs | null {
//     return this.store.getLogs(id);
//   }

//   getAll(): Logs[] {
//     return this.store
//   }

//   save(t: Logs): void {
//     throw new Error("Method not implemented.");
//   }
//   update(t: Logs): void {
//     throw new Error("Method not implemented.");
//   }
//   delete(t: Logs): void {
//     throw new Error("Method not implemented.");
//   }
// }
