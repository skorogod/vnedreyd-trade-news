import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ArticleModule } from 'src/article/article.module';
import { OpenRouterService } from './openrouter.service';
import { SectorModule } from 'src/sector/sector.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),// Register the Report entity with TypeORM
    ArticleModule,
    SectorModule
  ],
  controllers: [ReportController],
  providers: [ReportService, OpenRouterService]
})
export class ReportModule {}