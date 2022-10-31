import { DB } from "./db.ts";
import { bold, Command, Confirm, HOUR, inverse, MINUTE, yellow } from "./deps.ts";
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

new Command()
  .command("start", startCommand)
  .command("stop", stopCommand)
  .command("status", statusCommand)
  .parse();

async function onStatus() {
  const key = getKey();
  const day = await db.getDay(key);
  if (!day || day.logs.length < 2) {
    const error = yellow("We can't find a log entries for today :(");
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
  if (day.lastLogType === logType) {
    return await handleInvalidLog(logType);
  }
  const log = createLog(logType);
  day.logs.push(log);
  day.lastLogType = logType;

  getWorktime(day.logs);

  db.write(key, day).then(() => console.log("saved Log", log));
}

async function handleInvalidLog(logType: LogType) {
  const message = yellow(
    `The last logtype was also ${inverse(logType)}, something is not right`,
  );
  console.log(message);

  const confirmed: boolean = await Confirm.prompt(
    `Did you mean to add a ${inverse("start")} log?`,
  );
  if (confirmed) {
    onStart();
  }
  return;
}

export async function onStart() {
  const logType = LogType.start;
  const { day, key } = await getDay();
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
