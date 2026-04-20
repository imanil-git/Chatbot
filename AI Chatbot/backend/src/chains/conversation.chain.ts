import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationTokenBufferMemory } from "langchain/memory";
import { createChatPrompt } from "./prompt.template";

export const createConversationChain = (
  sessionId: string,
): ConversationChain => {
  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    streaming: true,
    temperature: 0.7,
  });

  const memory = new ConversationTokenBufferMemory({
    llm,
    memoryKey: "history",
    maxTokenLimit: 1000,
  });

  const prompt = createChatPrompt();

  return new ConversationChain({
    llm,
    memory,
    prompt,
  });
};