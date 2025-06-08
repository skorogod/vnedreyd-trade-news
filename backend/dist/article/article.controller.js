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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const common_1 = require("@nestjs/common");
const article_service_1 = require("./article.service");
const article_gateway_1 = require("./article.gateway");
let ArticleController = class ArticleController {
    articleService;
    articleGateway;
    constructor(articleService, articleGateway) {
        this.articleService = articleService;
        this.articleGateway = articleGateway;
    }
    async name(id) {
        const article = await this.articleService.findOne(id);
        this.articleGateway.server.emit('article', article);
        return article;
    }
    async create(articleData) {
        return this.articleService.create(articleData);
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "name", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "create", null);
exports.ArticleController = ArticleController = __decorate([
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [article_service_1.ArticleService,
        article_gateway_1.ArticleGateway])
], ArticleController);
//# sourceMappingURL=article.controller.js.map