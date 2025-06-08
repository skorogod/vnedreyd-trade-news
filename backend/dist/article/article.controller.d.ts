import { ArticleService } from './article.service';
import { ArticleGateway } from './article.gateway';
import { Article } from './entities/article.entity';
export declare class ArticleController {
    private readonly articleService;
    private readonly articleGateway;
    constructor(articleService: ArticleService, articleGateway: ArticleGateway);
    name(id: number): Promise<Article>;
    create(articleData: Partial<Article>): Promise<Article>;
}
