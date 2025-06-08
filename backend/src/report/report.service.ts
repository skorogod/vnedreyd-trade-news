import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Report } from './report.entity';
import { ArticleService } from 'src/article/article.service';
import { SectorService } from 'src/sector/sector.service';
import { OpenRouterService } from './openrouter.service';
import * as crypto from 'crypto';

@Injectable()
export class ReportService implements OnModuleInit {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private readonly articleService: ArticleService,
    private readonly sectorService: SectorService,
    private readonly openRouterService: OpenRouterService,
  ) {}

  async onModuleInit() {
    try {
      console.log('Database connected successfully');
      await this.reportRepository.query('SELECT 1');
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection error:', error);
    }
  }

  async create(content: string): Promise<Report> {
    const report = this.reportRepository.create({ content });
    return this.reportRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find();
  }

  async generateSummaryBySector(sectorId: number): Promise<string> {
    // Получаем название сектора
    const sector = await this.sectorService.findById(sectorId);
    const sectorName = sector ? sector.name : `Сектор ${sectorId}`;

    // Получаем все статьи, относящиеся к сектору
    const articles = await this.articleService.findAll();
    console.log(articles);

    // Фильтруем статьи по sectorId
    const filteredArticles = articles.filter(article =>
      article.sectors.includes(sectorId),
    );

    if (filteredArticles.length === 0) {
      return `No articles found for sector "${sectorName}" (ID: ${sectorId})`;
    }

    // Формируем текст для промпта с названием сектора
    const promptParts = filteredArticles.map(
      article => `Заголовок новости: ${article.title}\nТекст новости: ${article.content}`,
    );

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
    
    // Вызываем OpenRouterService для генерации саммари
    const summary = await this.openRouterService.generateResponse(prompt);
    return summary;
  }

  /**
   * Генерирует отчет по всем секторам за последние 12 часов
   * ОПТИМИЗИРОВАНО: один запрос к OpenRouter вместо множества
   */
  async generateDailySummaryReport(): Promise<Report> {
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    // Получаем статьи за последние 12 часов
    const recentArticles = await this.articleService.findRecentArticles(twelveHoursAgo);

    if (recentArticles.length === 0) {
      const emptyReport = await this.createReport(
        'За последние 12 часов новых статей не найдено 📭',
        'daily_summary',
        null,
        twelveHoursAgo,
        new Date(),
        'empty'
      );
      return emptyReport;
    }

    // Создаем хеш для уникальной идентификации набора статей
    const articlesHash = this.createArticlesHash(recentArticles);

    // Проверяем, существует ли уже отчет для этого набора статей
    const existingReport = await this.reportRepository.findOne({
      where: {
        reportType: 'daily_summary',
        articlesHash: articlesHash,
        timeRangeStart: MoreThan(twelveHoursAgo),
      },
      order: { creationTime: 'DESC' }
    });

    if (existingReport) {
      console.log('Найден существующий отчет, возвращаем его');
      return existingReport;
    }

    // Получаем карту секторов для названий
    const sectorNamesMap = await this.sectorService.getSectorNamesMap();

    // Группируем статьи по секторам
    const articlesBySector = this.groupArticlesBySectors(recentArticles);

    // ОПТИМИЗАЦИЯ: Создаем один большой промпт для всех секторов
    const megaPrompt = this.createMegaPrompt(articlesBySector, sectorNamesMap);

    // Один запрос к OpenRouter для всех секторов
    const fullSummary = await this.openRouterService.generateResponse(megaPrompt);

    // Парсим ответ и формируем финальный отчет
    const reportContent = this.formatDailySummaryFromMegaResponse(
      fullSummary, 
      articlesBySector, 
      sectorNamesMap, 
      recentArticles.length
    );

    // Сохраняем отчет в базу данных
    const report = await this.createReport(
      reportContent,
      'daily_summary',
      null,
      twelveHoursAgo,
      new Date(),
      articlesHash
    );

    return report;
  }

  /**
   * Получает последний дневной отчет или генерирует новый
   */
  async getDailySummaryReport(): Promise<Report> {
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    // Ищем последний отчет за последние 12 часов
    const existingReport = await this.reportRepository.findOne({
      where: {
        reportType: 'daily_summary',
        creationTime: MoreThan(twelveHoursAgo),
      },
      order: { creationTime: 'DESC' }
    });

    if (existingReport) {
      return existingReport;
    }

    // Если отчета нет, генерируем новый
    return await this.generateDailySummaryReport();
  }

  /**
   * Создает отчет в базе данных
   */
  private async createReport(
    content: string,
    reportType: string,
    sectorId?: number | null,
    timeRangeStart?: Date,
    timeRangeEnd?: Date,
    articlesHash?: string
  ): Promise<Report> {
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

  /**
   * Создает хеш для набора статей
   */
  private createArticlesHash(articles: any[]): string {
    const articleIds = articles.map(article => article.id).sort().join(',');
    return crypto.createHash('md5').update(articleIds).digest('hex');
  }

  /**
   * Группирует статьи по секторам
   */
  private groupArticlesBySectors(articles: any[]): Record<string, any[]> {
    const articlesBySector: Record<string, any[]> = {};

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

  /**
   * ОПТИМИЗАЦИЯ: Создает один мега-промпт для всех секторов
   */
  private createMegaPrompt(
    articlesBySector: Record<string, any[]>, 
    sectorNamesMap: Map<number, string>
  ): string {
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

  /**
   * Парсит мега-ответ и форматирует финальный отчет
   */
  private formatDailySummaryFromMegaResponse(
    megaResponse: string,
    articlesBySector: Record<string, any[]>,
    sectorNamesMap: Map<number, string>,
    totalArticles: number
  ): string {
    const timestamp = new Date().toLocaleString('ru-RU');
    
    let report = `📊 *Дневная сводка новостей* 📊\n`;
    report += `🕐 Сформирован: ${timestamp}\n`;
    report += `📰 Всего проанализировано статей: ${totalArticles}\n`;
    report += `🏢 Охвачено секторов: ${Object.keys(articlesBySector).length}\n\n`;

    // Разбираем мега-ответ на части по секторам
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

  /**
   * Парсит мега-ответ на отдельные сводки по секторам
   */
  private parseMegaResponse(megaResponse: string): Record<string, string> {
    const sectorResponses: Record<string, string> = {};
    
    // Ищем паттерн "СЕКТОР: [название]" и "---КОНЕЦ СЕКТОРА---"
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
}