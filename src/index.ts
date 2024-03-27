#!/bin/env node

import { defineCommand, runMain } from "citty";
import clipboard from "clipboardy";
import consola from "consola";
import { runLangchainAgentExecutor } from "./langchain";

const main = defineCommand({
  meta: {
    name: "chatrun",
    version: "1.0.0",
    description: "Run any CLI with natural language",
  },
  args: {
    run: {
      type: "string",
      description: "The CLI to run",
      required: true,
      alias: "r",
    },
    chat: {
      type: "string",
      description: "What to do with the CLI in natural language",
      required: true,
      alias: "c",
    },
  },
  async run({ args }) {
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

runMain(main);
