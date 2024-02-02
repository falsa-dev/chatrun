import { command, run, string, number, positional, option } from "cmd-ts";

const cmd = command({
  name: "my-command",
  description: "print something to the screen",
  version: "1.0.0",
  args: {
    number: positional({ type: number, displayName: "num" }),
    message: option({
      long: "greeting",
      type: string,
    }),
  },
  handler: (args) => {
    args.message; // string
    args.number; // number
    console.log(args);
  },
});

run(cmd, process.argv.slice(2));
