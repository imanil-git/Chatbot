import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

export const createChatPrompt = (): ChatPromptTemplate => {
  return ChatPromptTemplate.fromMessages([
    ["system", "You are Antigravity AI, a powerful, helpful, and highly intelligent AI assistant. Answer queries thoroughly and concisely."],
    new MessagesPlaceholder("history"),
    ["human", "{input}"]
  ]);
};
