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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("./report.entity");
const article_service_1 = require("../article/article.service");
const sector_service_1 = require("../sector/sector.service");
const openrouter_service_1 = require("./openrouter.service");
const crypto = require("crypto");
let ReportService = class ReportService {
    reportRepository;
    articleService;
    sectorService;
    openRouterService;
    constructor(reportRepository, articleService, sectorService, openRouterService) {
        this.reportRepository = reportRepository;
        this.articleService = articleService;
        this.sectorService = sectorService;
        this.openRouterService = openRouterService;
    }
    async onModuleInit() {
        try {
            console.log('Database connected successfully');
            await this.reportRepository.query('SELECT 1');
            console.log('Database connected successfully');
        }
        catch (error) {
            console.error('Database connection error:', error);
        }
    }
    async create(content) {
        const report = this.reportRepository.create({ content });
        return this.reportRepository.save(report);
    }
    async findAll() {
        return this.reportRepository.find();
    }
    async generateSummaryBySector(sectorId) {
        const sector = await this.sectorService.findById(sectorId);
        const sectorName = sector ? sector.name : `Сектор ${sectorId}`;
        const articles = await this.articleService.findAll();
        console.log(articles);
        const filteredArticles = articles.filter(article => article.sectors.includes(sectorId));
        if (filteredArticles.length === 0) {
            return `No articles found for sector "${sectorName}" (ID: ${sectorId})`;
        }
        const promptParts = filteredArticles.map(article => `Заголовок новости: ${article.title}\nТекст новости: ${article.content}`);
        const prompt = `Сделай короткую аннотацию по статьям сектора "${sectorName}" для трейдера. Форматируй текст строго по следующим правилам:

    1. Заголовки - жирным без символов # (просто **Заголовок**)
    2. Списки - через дефисы с отступами
    3. Важные моменты - жирным
    4. Эмодзи используй умеренно (1-3 на блок)
    5. Пустые строки между блоками
    6. Не используй markdown-символы типа *, ### и т.д.
    7. Для акцентов используй только жирный текст и эмодзи
    
    Вот структура, которой нужно придерживаться:
    
    **🔥 Сводка для трейдера | ${sectorName}**
    
    [Название новости/компании] [эмодзи]
    - Суть: кратко основное содержание
    - Влияние на рынок: 
      - 🟢 Позитив для: [компании/сектора]
      - 🔴 Негатив для: [компании/сектора]
    - Торговая идея: [рекомендация] [эмодзи]
    
    [Пустая строка между новостями]
    
    Вот статьи для анализа:
    ${promptParts.join('\n\n')}`;
        const summary = await this.openRouterService.generateResponse(prompt);
        return summary;
    }
    async generateDailySummaryReport() {
        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
        const recentArticles = await this.articleService.findRecentArticles(twelveHoursAgo);
        if (recentArticles.length === 0) {
            const emptyReport = await this.createReport('За последние 12 часов новых статей не найдено 📭', 'daily_summary', null, twelveHoursAgo, new Date(), 'empty');
            return emptyReport;
        }
        const articlesHash = this.createArticlesHash(recentArticles);
        const existingReport = await this.reportRepository.findOne({
            where: {
                reportType: 'daily_summary',
                articlesHash: articlesHash,
                timeRangeStart: (0, typeorm_2.MoreThan)(twelveHoursAgo),
            },
            order: { creationTime: 'DESC' }
        });
        if (existingReport) {
            console.log('Найден существующий отчет, возвращаем его');
            return existingReport;
        }
        const sectorNamesMap = await this.sectorService.getSectorNamesMap();
        const articlesBySector = this.groupArticlesBySectors(recentArticles);
        const megaPrompt = this.createMegaPrompt(articlesBySector, sectorNamesMap);
        const fullSummary = await this.openRouterService.generateResponse(megaPrompt);
        const reportContent = this.formatDailySummaryFromMegaResponse(fullSummary, articlesBySector, sectorNamesMap, recentArticles.length);
        const report = await this.createReport(reportContent, 'daily_summary', null, twelveHoursAgo, new Date(), articlesHash);
        return report;
    }
    async getDailySummaryReport() {
        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
        const existingReport = await this.reportRepository.findOne({
            where: {
                reportType: 'daily_summary',
                creationTime: (0, typeorm_2.MoreThan)(twelveHoursAgo),
            },
            order: { creationTime: 'DESC' }
        });
        if (existingReport) {
            return existingReport;
        }
        return await this.generateDailySummaryReport();
    }
    async createReport(content, reportType, sectorId, timeRangeStart, timeRangeEnd, articlesHash) {
        const report = this.reportRepository.create({
            content,
            reportType,
            sectorId: sectorId || undefined,
            timeRangeStart,
            timeRangeEnd,
            articlesHash
        });
        return await this.reportRepository.save(report);
    }
    createArticlesHash(articles) {
        const articleIds = articles.map(article => article.id).sort().join(',');
        return crypto.createHash('md5').update(articleIds).digest('hex');
    }
    groupArticlesBySectors(articles) {
        const articlesBySector = {};
        articles.forEach(article => {
            if (article.sectors && Array.isArray(article.sectors)) {
                article.sectors.forEach(sectorId => {
                    if (!articlesBySector[sectorId]) {
                        articlesBySector[sectorId] = [];
                    }
                    articlesBySector[sectorId].push(article);
                });
            }
        });
        return articlesBySector;
    }
    createMegaPrompt(articlesBySector, sectorNamesMap) {
        let megaPrompt = `Проанализируй новости по разным секторам экономики и создай краткие аналитические сводки для трейдеров. 
Пиши на русском языке, форматируй для телеграма с эмоджи, выдели ключевые моменты для принятия торговых решений.

Для каждого сектора начинай ответ с "СЕКТОР: [Название сектора]" и заканчивай "---КОНЕЦ СЕКТОРА---".

Вот новости по секторам:\n\n`;
        Object.entries(articlesBySector).forEach(([sectorId, articles]) => {
            const sectorName = sectorNamesMap.get(parseInt(sectorId)) || `Сектор ${sectorId}`;
            megaPrompt += `\n🏢 === СЕКТОР: ${sectorName.toUpperCase()} (${articles.length} статей) ===\n`;
            articles.forEach((article, index) => {
                megaPrompt += `\nСтатья ${index + 1}:\n`;
                megaPrompt += `Заголовок: ${article.title}\n`;
                megaPrompt += `Текст: ${article.content}\n`;
            });
            megaPrompt += `\n=== КОНЕЦ ДАННЫХ ПО СЕКТОРУ ${sectorName.toUpperCase()} ===\n\n`;
        });
        megaPrompt += `\nПожалуйста, создай для каждого сектора краткую аналитическую сводку, начиная с "СЕКТОР: [Название]" и заканчивая "---КОНЕЦ СЕКТОРА---".`;
        return megaPrompt;
    }
    formatDailySummaryFromMegaResponse(megaResponse, articlesBySector, sectorNamesMap, totalArticles) {
        const timestamp = new Date().toLocaleString('ru-RU');
        let report = `📊 *Дневная сводка новостей* 📊\n`;
        report += `🕐 Сформирован: ${timestamp}\n`;
        report += `📰 Всего проанализировано статей: ${totalArticles}\n`;
        report += `🏢 Охвачено секторов: ${Object.keys(articlesBySector).length}\n\n`;
        const sectorResponses = this.parseMegaResponse(megaResponse);
        Object.entries(articlesBySector).forEach(([sectorId, articles]) => {
            const sectorName = sectorNamesMap.get(parseInt(sectorId)) || `Сектор ${sectorId}`;
            const sectorSummary = sectorResponses[sectorName] ||
                sectorResponses[sectorName.toUpperCase()] ||
                `Анализ по сектору ${sectorName} временно недоступен 🔄`;
            report += `🏢 *${sectorName}* (${articles.length} статей)\n`;
            report += `${sectorSummary}\n\n`;
            report += `────────────────────\n\n`;
        });
        report += `💡 *Рекомендация*: Данный анализ носит информационный характер. Принимайте торговые решения осознанно!\n`;
        return report;
    }
    parseMegaResponse(megaResponse) {
        const sectorResponses = {};
        const sectorRegex = /СЕКТОР:\s*([^]+?)---КОНЕЦ СЕКТОРА---/gi;
        let match;
        while ((match = sectorRegex.exec(megaResponse)) !== null) {
            const fullMatch = match[1];
            const lines = fullMatch.split('\n');
            if (lines.length > 0) {
                const sectorName = lines[0].trim();
                const content = lines.slice(1).join('\n').trim();
                if (sectorName && content) {
                    sectorResponses[sectorName] = content;
                }
            }
        }
        return sectorResponses;
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        article_service_1.ArticleService,
        sector_service_1.SectorService,
        openrouter_service_1.OpenRouterService])
], ReportService);
//# sourceMappingURL=report.service.js.map