import http from 'http';

const DEFAULT_RESPONSE = 'Hello! I am a mock Claude response.';

export interface MockApiServer {
  url: string;
  server: http.Server;
  close: () => Promise<void>;
  setResponse: (text: string) => void;
}

export async function startMockApi(port = 0): Promise<MockApiServer> {
  let responseText = DEFAULT_RESPONSE;

  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/v1/messages') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      const messageStart = JSON.stringify({
        type: 'message_start',
        message: { id: 'msg_mock', type: 'message', role: 'assistant', content: [] },
      });
      res.write(`event: message_start\ndata: ${messageStart}\n\n`);

      const blockStart = JSON.stringify({
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'text', text: '' },
      });
      res.write(`event: content_block_start\ndata: ${blockStart}\n\n`);

      const words = responseText.split(' ');
      let i = 0;
      const interval = setInterval(() => {
        if (i >= words.length) {
          clearInterval(interval);
          const blockStop = JSON.stringify({ type: 'content_block_stop', index: 0 });
          res.write(`event: content_block_stop\ndata: ${blockStop}\n\n`);

          const msgStop = JSON.stringify({
            type: 'message_stop',
          });
          res.write(`event: message_stop\ndata: ${msgStop}\n\n`);
          res.end();
          return;
        }
        const delta = JSON.stringify({
          type: 'content_block_delta',
          index: 0,
          delta: { type: 'text_delta', text: (i > 0 ? ' ' : '') + words[i] },
        });
        res.write(`event: content_block_delta\ndata: ${delta}\n\n`);
        i++;
      }, 10);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      resolve({
        url: `http://127.0.0.1:${actualPort}`,
        server,
        close: () => new Promise<void>((r) => server.close(() => r())),
        setResponse: (text: string) => {
          responseText = text;
        },
      });
    });
  });
}
