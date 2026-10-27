import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'Request body must contain valid JSON.' });
    return;
  }

  console.error('[HealthGrid API] Unhandled request error:', error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
};

app.use(errorHandler);

export default app;
