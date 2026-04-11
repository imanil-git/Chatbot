import { memoryService } from './memory.service';
import { Session } from '../models/Session.model';

export class ChatService {
  public static async *sendMessage(sessionId: string, message: string): AsyncGenerator<string, void, unknown> {
    const chain = memoryService.getOrCreate(sessionId);

    // Save user message
    await Session.appendMessage(sessionId, { role: 'user', content: message });

    // Assuming stream uses the 'response' key natively in ConversationChain
    const stream = await chain.stream({ input: message });

    let fullResponse = "";

    for await (const chunk of stream) {
      if (chunk.response) {
        fullResponse += chunk.response;
        yield chunk.response;
      }
    }

    // Save assistant message
    await Session.appendMessage(sessionId, { role: 'assistant', content: fullResponse });
  }
}
