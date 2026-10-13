import type { IncomingMessage, ServerResponse } from 'http';

type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

let handler: Handler;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  handler = require('../src/serverless').default;
} catch (err) {
  // Log the full error for Vercel runtime logs; only expose the message
  // to the client (never the stack trace).
  // eslint-disable-next-line no-console
  console.error('[api] failed to load serverless handler:', err);
  handler = async (_req, res) => {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Failed to initialize API',
        detail: err instanceof Error ? err.message : String(err),
      }),
    );
  };
}

export default handler;

// Deployed on Vercel as zero-config serverless functions (see vercel.json).
