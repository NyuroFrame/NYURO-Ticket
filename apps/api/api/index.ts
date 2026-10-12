import type { IncomingMessage, ServerResponse } from 'http';

let cachedServer: ((req: IncomingMessage, res: ServerResponse) => void) | null =
  null;

async function getServer() {
  if (!cachedServer) {
    const { NestFactory } = await import('@nestjs/core');
    const { ValidationPipe } = await import('@nestjs/common');
    const { default: cookieParser } = await import('cookie-parser');
    const { AppModule } = await import('../src/app.module');
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.enableCors({
      origin: (process.env.FRONTEND_URL ?? 'http://localhost:3001').split(','),
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const server = await getServer();
    server(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        debug: true,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }),
    );
  }
}
