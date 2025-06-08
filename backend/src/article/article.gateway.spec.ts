import { Test, TestingModule } from '@nestjs/testing';
import { ArticleGateway } from './article.gateway';
import { ArticleService } from './article.service';

describe('ArticleGateway', () => {
  let gateway: ArticleGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleGateway, ArticleService],
    }).compile();

    gateway = module.get<ArticleGateway>(ArticleGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
