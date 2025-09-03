/**
 * Returns a configured Paddle SDK instance.
 *
 * Env:
 * - NEXT_PUBLIC_PADDLE_ENV: sandbox | production (defaults to sandbox)
 * - PADDLE_API_KEY: required; if missing we log an error
 */
import { Environment, LogLevel, Paddle, PaddleOptions } from '@paddle/paddle-node-sdk';

export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ?? Environment.sandbox,
    logLevel: LogLevel.error,
  };

  if (!process.env.PADDLE_API_KEY) {
    console.error('Paddle API key is missing');
  }

  return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions);
}
