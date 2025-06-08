"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const article_service_1 = require("./article.service");
const socket_io_1 = require("socket.io");
let ArticleGateway = class ArticleGateway {
    articleService;
    server;
    constructor(articleService) {
        this.articleService = articleService;
    }
    afterInit(server) {
        console.log('WebSocket Gateway initialized');
    }
};
exports.ArticleGateway = ArticleGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ArticleGateway.prototype, "server", void 0);
exports.ArticleGateway = ArticleGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(3030, {
        transports: ['websocket', "polling"],
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    }),
    __metadata("design:paramtypes", [article_service_1.ArticleService])
], ArticleGateway);
//# sourceMappingURL=article.gateway.js.map