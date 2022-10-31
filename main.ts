import { DB } from "./db.ts";
import { Command } from "./deps.ts";
import { LogType } from "./log_entry.ts";
import { Day, Log } from "./store_structure.ts";

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

export const c = await new Command()
  .command("start", startCommand)
  .command("stop", stopCommand)
  .parse();

async function onStop() {
  const key = getKey();
  let day = await db.getDay(key);
  const log: Log = { date: new Date(), logType: "stop" };
  if (day) {
    day.logs.push(log);
  } else {
    day = { logs: [log] };
  }

  db.write(key, day).then(() => console.log('saved Log', log));
}

export async function onStart() {
  const key = getKey();
  let day = await db.getDay(key);
  const log: Log = { date: new Date(), logType: "start" };
  if (day) {
    day.logs.push(log);
  } else {
    day = { logs: [log] };
  }

  db.write(key, day).then(() => console.log("Saved log", log));
}

function getKey(date: Date = new Date()) {
  return date.toDateString();
}
