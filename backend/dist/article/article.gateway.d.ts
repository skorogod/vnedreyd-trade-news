import { OnGatewayInit } from '@nestjs/websockets';
import { ArticleService } from './article.service';
import { Server } from 'socket.io';
export declare class ArticleGateway implements OnGatewayInit {
    private readonly articleService;
    server: Server;
    constructor(articleService: ArticleService);
    afterInit(server: any): void;
}
