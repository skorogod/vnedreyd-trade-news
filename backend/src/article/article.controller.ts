import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleGateway } from './article.gateway';
import { Article } from './entities/article.entity';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly articleGateway: ArticleGateway, // Inject your gateway to emit events
  ) {}

  @Get()
  async name(@Query('id') id: number) {
    const article = await this.articleService.findOne(id); // Fetch article from DB
    // Emit WebSocket event 'article' with article data
    this.articleGateway.server.emit('article', article);
    return article; // Optionally return article in HTTP response
  }

  @Post()
  async create(@Body() articleData: Partial<Article>): Promise<Article> {
    return this.articleService.create(articleData);
  }

}
