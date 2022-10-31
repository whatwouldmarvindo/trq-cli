export type Log = {
  logType: LogType;
  date: Date;
};

export type LogType = "start" | "stop";

export type Day = {
  logs: Log[];
  timeInMilliseconds?: number;
};
