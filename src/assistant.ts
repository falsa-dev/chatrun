import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createAssistant = () =>
  openai.beta.assistants.create({
    instructions:
      "You will be provided a CLI to run, and natural language describing what to do with it. You can use the 'shell' tool to get information about the CLI or its commands by running them in a sandboxed shell. Remember that running a CLI command without any arguments, or with a --help flag, or using 'man', all of these usually help provide help text. If the help output is not enough, you can keep probing subcommands using the 'shell' tool. You can do this until you have enough information. Then, return the final CLI command that will help accomplish the natural language task.",
    model: "gpt-4-turbo-preview",
    tools: [
      {
        type: "function",
        function: {
          name: "shell",
          description: "Run a CLI in a sandboxed shell",
          parameters: {
            type: "object",
            properties: {
              commandToRun: {
                type: "string",
                description:
                  "The full command to run in the sandboxed shell to get more information about it.",
              },
            },
            required: ["commandToRun"],
          },
        },
      },
    ],
  });

const;
