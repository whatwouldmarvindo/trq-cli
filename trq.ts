import { Log, Store } from "./store.ts";
import { Command } from "./deps.ts";
import { LogEntry } from "./log_entry.ts";

const db = new Store();

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

await new Command()
  .command("start", startCommand)
  .command("stop", stopCommand)
  .parse();

function onStop() {
  const logEntry = new LogEntry("stop", db);
  if (getPair(logEntry)) {
    db.write(logEntry);
  } else {
    console.log("we couldn't find an entry for when you started your day");
    const hour = prompt("When did you start? Hour: ") as unknown as number;
    const minute = prompt("When did you start? Minute: ") as unknown as number;
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);

    const pair = new LogEntry("start", date);
    db.write(pair);
  }
}

function onStart() {
  const logEntry = new LogEntry("start");
  db.write(logEntry);
}

function getPair(command: LogEntry): Log | undefined {
  const key = command.dateString + "start";
  const pair = db.get(key);
  return pair;
}
