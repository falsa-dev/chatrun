import { execaCommand } from "execa";
import { writeFile } from "node:fs/promises";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export let assistantId = "";

/**
 * @param ms - time in milliseconds
 * @returns a promise that resolves after the given time
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const createAssistant = () =>
  openai.beta.assistants.create({
    instructions:
      "You will be provided a CLI to run, and natural language describing what to do with it. You can use the 'shell' tool to get information about the CLI or its commands by running them in a sandboxed shell. Do not rely on your implicit knowledge because the provided CLI might be different from the ones you know. Remember that running a CLI command without any arguments, or with a --help flag, or using 'man', all of these usually help provide help text. If the help output is not enough, you can keep probing subcommands using the 'shell' tool. You can do this until you have enough information. Then, return the final CLI command (and ONLY the command, with no additional explanation) that will help accomplish the natural language task.",
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
  if (!assistantId) {
    const assistant = await createAssistant();
    await writeFile("assistant.json", JSON.stringify(assistant, null, 2));
    assistantId = assistant.id;
  }

  // run thread with assistant
  let threadRun = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  const time = Date.now();
  // not more than 5 minutes
  while (true && Date.now() - time < 1000 * 60 * 5) {
    console.log("🔄", threadRun.status);
    await sleep(5000);

    // retrieve thread
    threadRun = await openai.beta.threads.runs.retrieve(
      thread.id,
      threadRun.id
    );

    switch (threadRun.status) {
      case "in_progress":
      case "queued":
        continue;

      case "completed": {
        const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data.at(0);
        if (lastMessage?.content?.[0].type === "text") {
          return lastMessage.content[0].text.value;
        }
        return "";
      }

      case "requires_action": {
        if (threadRun.required_action?.type !== "submit_tool_outputs") {
          return "";
        }

        const { function: functionDef, id } =
          threadRun.required_action.submit_tool_outputs.tool_calls?.[0];

        if (functionDef.name !== "shell") {
          console.error("Unknown tool. Skipping.");
          return "";
        }

        let commandToRun = "";
        try {
          const parsed = JSON.parse(functionDef.arguments);
          commandToRun = parsed.commandToRun;
        } catch (e) {
          console.error("Error parsing shell tool arguments", e);
          return "";
        }
        if (!commandToRun) {
          console.error("No command to run in shell tool");
          return "";
        }

        // run the shell tool
        console.log("🐚", commandToRun);
        const { stdout } = await execaCommand(commandToRun);

        // submit the shell tool output
        threadRun = await openai.beta.threads.runs.submitToolOutputs(
          thread.id,
          threadRun.id,
          {
            tool_outputs: [
              {
                tool_call_id: id,
                output: stdout,
              },
            ],
          }
        );

        continue;
      }

      case "cancelled":
      case "expired":
      case "cancelling":
      case "failed":
      default:
        return "";
    }
  }

  return "";
};
