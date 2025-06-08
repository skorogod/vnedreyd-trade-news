import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  // Enable all logging levels
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });
  
  const logger = new Logger('Bootstrap');
  logger.log('🚀 Application starting...');
  // app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3000);
  logger.log(`🌍 Application running on port ${3000}`);
}
bootstrap();