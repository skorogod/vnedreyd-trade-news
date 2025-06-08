import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleGateway } from './article.gateway';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
  ],
  providers: [ArticleGateway, ArticleService],
  controllers: [ArticleController],
  exports: [ArticleService]
})
export class ArticleModule {}
