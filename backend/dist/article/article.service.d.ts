import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
export declare class ArticleService {
    private readonly articleRepository;
    constructor(articleRepository: Repository<Article>);
    findAll(): Promise<Article[]>;
    findOne(id: number): Promise<Article>;
    create(articleData: Partial<Article>): Promise<Article>;
    findRecentArticles(sinceDate: Date): Promise<Article[]>;
}
