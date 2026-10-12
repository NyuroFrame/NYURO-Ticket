let handler;

try {
  handler = require('../dist/serverless').default;
} catch (err) {
  handler = (req, res) => {
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

module.exports = handler;
