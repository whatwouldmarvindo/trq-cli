import { DB } from "./db.ts";
import { bold, Command, Confirm, inverse, Toggle, yellow } from "./deps.ts";
import { Day, Log, LogType } from "./data_structure.ts";

const db = new DB();

const startCommand = await new Command()
  .name("start")
  .version("0.0.1")
  .description("start your time-tracker")
  .action(onStart);

const stopCommand = await new Command()
  .name("stop")
  .version("0.0.1")
  .description("stop your time-tracker")
  .action(onStop);

const statusCommand = await new Command()
  .name("status")
  .version("0.0.1")
  .description("status for your current day")
  .action(onStatus);

const resetCommand = await new Command()
  .name("reset")
  .version("0.0.1")
  .description("Resets the database by deleting all values")
  .action(onReset);

new Command()
  .command("start", startCommand)
  .command("stop", stopCommand)
  .command("status", statusCommand)
  .command("reset", resetCommand)
  .parse();

async function onStatus() {
  const { day } = await getDay();

  if (day.logs.length === 0) {
    const error = yellow("We can't find a log entry for today :(");
    return console.log(error);
  }
  getWorktime(day.logs);
}

function dateComparison(a: Date, b: Date) {
  const date1 = new Date(a).getTime();
  const date2 = new Date(b).getTime();

  return (date1 - date2);
}

async function onStop() {
  const logType = LogType.stop;
  const { day, key } = await getDay();
  const isSameLogAgain = day.lastLogType === logType;
  const isFirstLogOfTheDay = day.lastLogType === undefined;
  if (isFirstLogOfTheDay) {
    return handleFirstLogError();
  } else if (isSameLogAgain) {
    return await handleInvalidLogging(logType);
  }
  const log = createLog(logType);
  day.logs.push(log);
  day.lastLogType = logType;

  getWorktime(day.logs);

  db.write(key, day).then(() => console.log("saved Log", log));
}

async function handleInvalidLogging(logType: LogType): Promise<void> {
  const message = yellow(
    `The last log was also ${inverse(logType)}, something is not right`,
  );
  console.log(message);

  const invertedLog = logType === LogType.start ? LogType.stop : LogType.stop;

  const confirmed: boolean = await Toggle.prompt(
    `Do you want to add a ${inverse(invertedLog)} log?`,
  );
  if (confirmed) {
    if (logType === LogType.start) {
      onStop();
    } else {
      onStart();
    }
  }
}

export async function onStart(): Promise<void> {
  const logType = LogType.start;
  const { day, key } = await getDay();
  if (day.lastLogType === logType) {
    return await handleInvalidLogging(logType);
  }
  const log: Log = createLog(logType);

  day.logs.push(log);
  day.lastLogType = logType;

  db.write(key, day).then(() => console.log("Saved log", log));
}

function createLog(logType: LogType): Log {
  return { date: new Date(), logType };
}

async function getDay(): Promise<{ day: Day; key: string }> {
  const key = getKey();
  let day = await db.getDay(key);
  day = day ?? { logs: [] };
  return { day, key };
}

function getKey(date: Date = new Date()) {
  return date.toDateString();
}

function getWorktime(logs: Log[]) {
  sortLogs(logs);
  let worktime = 0;

  for (let i = 0; i < logs.length; i += 2) {
    const start = new Date(logs[i].date);
    let stop: Date;
    if (!logs[i + 1]) {
      stop = new Date();
    } else {
      stop = new Date(logs[i + 1].date);
    }

    const differenceInMilliSeconds = stop.getTime() - start.getTime();
    worktime += differenceInMilliSeconds;
  }
  const result = formatTime(worktime);
  console.log(`You worked ${bold(result)} today! Good job 👍🏻`);
}

function sortLogs(logs: Log[]) {
  logs.sort((a, b) => dateComparison(a.date, b.date));
}

/**
 * @param ms
 * @returns string in the in the format h:m
 */
function formatTime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms / 1000 / 60 / 60) % 24);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

async function onReset() {
  const message =
    "Do you really want to delete all logs? \n All data will be lost forever";
  const confirmed = await Confirm.prompt({ message: message });
  if (confirmed) {
    db.deleteEverything();
  }
}

async function handleFirstLogError() {
  const message = `You can't start the day with a ${inverse("stop")} log`;
  console.log(message);
  const toggleMessage = `Did you mean do ${inverse("start")} instead?`;
  const startInstead = await Toggle.prompt({ message: toggleMessage });
  if (startInstead) {
    onStart();
  }
}
