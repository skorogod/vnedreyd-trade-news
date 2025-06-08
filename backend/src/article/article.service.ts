import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Article } from './entities/article.entity';
@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async findAll(): Promise<Article[]> {
    return this.articleRepository.find();
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOneBy({ id });
    
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    
    return article;
  }

  async create(articleData: Partial<Article>): Promise<Article> {
    const article = this.articleRepository.create(articleData);
    return this.articleRepository.save(article);
  }

  async findRecentArticles(sinceDate: Date): Promise<Article[]> {
    return await this.articleRepository.find({
      where: {
        date: MoreThan(sinceDate) // или другое поле даты, которое у вас используется
      },
      order: {
        date: 'DESC'
      }
    });
  }

}
