export type Log = {
  logType: LogType;
  date: Date;
};

export enum LogType {
  start = "start",
  stop = "stop",
}

export type Day = {
  logs: Log[];
  timeInMilliseconds?: number;
  lastLogType?: LogType
};
