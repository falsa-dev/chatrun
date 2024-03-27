#!/bin/env node

import clipboard from "clipboardy";
import { command, option, run, string } from "cmd-ts";
import consola from "consola";
import { runLangchainAgentExecutor } from "./langchain";

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
    // make sure to EXPORT=OPENAI_API_KEY in your environment first
    const result = await runLangchainAgentExecutor(args.chat, args.run);

    let command = "";
    try {
      const parsed = JSON.parse(result);
      command = parsed?.command ?? "";
    } catch (e) {
      return;
    }

    consola.box(command);

    clipboard.writeSync(command);
    consola.success("Copied to clipboard");
  },
});

run(cmd, process.argv.slice(2));
