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

/**
 * @param chat - natural language describing what to do with the CLI
 * @param run - the CLI to run
 * @returns the final CLI command that will help accomplish the natural language task
 */
export const chatRun = async (chat: string, run: string): Promise<string> => {
  // create thread
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: `My CLI is ${run}. I want to: ${chat}`,
      },
    ],
  });

  // create assistant
  const assistant = await createAssistant();

  // run thread with assistant
  let threadRun = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  const time = Date.now();
  // not more than 5 minutes
  while (true && Date.now() - time < 1000 * 60 * 5) {
    // retrieve thread
    threadRun = await openai.beta.threads.runs.retrieve(
      thread.id,
      threadRun.id
    );

    // if run is errored, return an empty string
    if (
      threadRun.status === "expired" ||
      threadRun.status === "failed" ||
      threadRun.status === "cancelled" ||
      threadRun.status === "cancelling"
    ) {
      console.log("🛑");
      return "";
    }

    // if run is pending, wait and try again
    if (threadRun.status === "queued" || threadRun.status === "in_progress") {
      console.log("⌛");
      sleep(1500);
      continue;
    }

    // if a tool is required, use it
    if (threadRun.status === "requires_action") {
    }
  }
};

/**
 * @param ms - time in milliseconds
 * @returns a promise that resolves after the given time
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
