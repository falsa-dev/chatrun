import { SystemMessage } from "@langchain/core/messages";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import consola from "consola";
import { execaCommand } from "execa";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { systemPrompt } from "./prompt";

/**
 * The language model that the agent will use
 */
const llm = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0,
}).bind({
  response_format: {
    type: "json_object",
  },
});

/**
 * A tool that runs a CLI in a sandboxed shell
 */
const shellTool = new DynamicTool({
  name: "SHELL",
  description: "Run any CLI in a sandboxed shell",
  func: async (commandToRun: string) => {
    const allowed = await consola.prompt(`Allow running: "${commandToRun}"?`, {
      type: "confirm",
    });
    if (allowed) {
      const { all } = await execaCommand(commandToRun, {
        all: true,
      });
      return all ?? "";
    }
    return "";
  },
});

/**
 * The tools that the agent will use
 */
const tools = [shellTool];

/**
 * Pulls the prompt from the hub
 */
const prompt = await pull<ChatPromptTemplate>(
  "hwchase17/openai-functions-agent"
);

/**
 * Creates an agent with the given tools and prompt
 */
const agent = await createOpenAIToolsAgent({
  llm: llm as any,
  tools,
  prompt,
});

/**
 * Runs the agent in a loop
 */
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  // verbose: true,
});

/**
 * Runs the agent executor
 * @param input - the input to the agent
 * @returns - the output of the agent
 */
export const runLangchainAgentExecutor = async (chat: string, run: string) => {
  const result = await agentExecutor.invoke({
    input: `
    1. My CLI is: ${run}.
    2. The task: ${chat}
    `,
    chat_history: [new SystemMessage(systemPrompt())],
  });
  return result?.output ?? "";
};
