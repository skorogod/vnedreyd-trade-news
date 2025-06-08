import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { ArticleService } from './article.service';
import { Server } from 'socket.io';

@WebSocketGateway(3030, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ArticleGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly articleService: ArticleService) {}
  afterInit(server: any) {
    console.log('WebSocket Gateway initialized');
  }
}
