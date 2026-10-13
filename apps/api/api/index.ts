import type { IncomingMessage, ServerResponse } from 'http';

type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

let handler: Handler;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  handler = require('../src/serverless').default;
} catch (err) {
  handler = async (req, res) => {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        debug: 'require-failed',
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }),
    );
  };
}

export default handler;
