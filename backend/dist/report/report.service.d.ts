import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { ArticleService } from 'src/article/article.service';
import { SectorService } from 'src/sector/sector.service';
import { OpenRouterService } from './openrouter.service';
export declare class ReportService implements OnModuleInit {
    private reportRepository;
    private readonly articleService;
    private readonly sectorService;
    private readonly openRouterService;
    constructor(reportRepository: Repository<Report>, articleService: ArticleService, sectorService: SectorService, openRouterService: OpenRouterService);
    onModuleInit(): Promise<void>;
    create(content: string): Promise<Report>;
    findAll(): Promise<Report[]>;
    generateSummaryBySector(sectorId: number): Promise<string>;
    generateDailySummaryReport(): Promise<Report>;
    getDailySummaryReport(): Promise<Report>;
    private createReport;
    private createArticlesHash;
    private groupArticlesBySectors;
    private createMegaPrompt;
    private formatDailySummaryFromMegaResponse;
    private parseMegaResponse;
}
