import { command, run, string, number, positional, option } from "cmd-ts";
import { chatRun } from "./assistant";
import { execaCommand } from "execa";

const cmd = command({
  name: "chatrun",
  description: "Run any CLI with natural language",
  version: "1.0.0",
  args: {
    run: option({
      long: "run",
      short: "r",
      type: string,
      description: "The CLI to run",
    }),
    chat: option({
      long: "chat",
      short: "c",
      type: string,
      description: "What to do with the CLI in natural language",
    }),
  },
  handler: async (args) => {
    const command = await chatRun(args.chat, args.run);
    console.log(command);
  },
});

run(cmd, process.argv.slice(2));
