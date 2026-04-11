import { useSessionStore } from '../../session';

// Using fetch since we need ReadableStream for SSE
export const streamChat = async (message: string, onToken: (token: string) => void): Promise<void> => {
  const sessionId = useSessionStore.getState().sessionId;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  
  const response = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId
    },
    body: JSON.stringify({ message, sessionId })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No readable stream in response');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.trim() === 'data: [DONE]') {
          return;
        }
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              onToken(data.token);
            }
          } catch (e) {
            // ignore partial JSON parse errors until buffer is complete
          }
        }
      }
    }
  }
};
