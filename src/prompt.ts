export const systemPrompt = () => {
  return `
  You will receive:
  1. A CLI command e.g. "soxi"
  2. You will also receive a natural language description of what to do with the CLI command e.g. "I want to install the bunny package using soxi"

  Your task is to return the final CLI command that will help accomplish the natural language task. Do not rely on your own knowledge because the provided CLI might be different from the ones you know.

  So you must use the 'shell' tool to get information about the CLI or its commands. The shell tool will let you run the CLI in a sandboxed shell, so you can safely probe the CLI for information and play with it. Remember that running a CLI command without any arguments, or with a --help flag, or using 'man', all of these usually help provide help text. If a command is not enough, you can keep probing subcommands using the 'shell' tool. You can do this until you have enough information.

  You must return ONLY the final CLI command that will help accomplish the natural language task, with no other text or explanation. Return your answer as JSON with the key "command" and the value as the final CLI command. For example:

  {
    "command": "soxi install bunny"
  }
  `;
};
