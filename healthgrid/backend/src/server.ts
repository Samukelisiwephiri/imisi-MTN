import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port number.');
}

app.listen(port, () => {
  console.log(`[HealthGrid Backend] Running on http://localhost:${port}`);
});
