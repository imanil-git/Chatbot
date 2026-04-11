import { ConversationChain } from "langchain/chains";
import { createConversationChain } from "../chains/conversation.chain";

class MemoryService {
  private memoryMap: Map<string, ConversationChain> = new Map();

  // TODO: Replace with RedisChatMessageHistory in production
  public getOrCreate(sessionId: string): ConversationChain {
    if (!this.memoryMap.has(sessionId)) {
      const newChain = createConversationChain(sessionId);
      this.memoryMap.set(sessionId, newChain);
    }
    return this.memoryMap.get(sessionId)!;
  }

  public clear(sessionId: string): void {
    this.memoryMap.delete(sessionId);
  }
}

export const memoryService = new MemoryService();
