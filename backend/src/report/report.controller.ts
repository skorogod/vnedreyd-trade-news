import { Controller, Get, ParseIntPipe, Query, Post } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('summary')
  async getSummary(@Query('sectorId', ParseIntPipe) sectorId: number): Promise<{ summary: string }> {
    const summary = await this.reportService.generateSummaryBySector(sectorId);
    return { summary };
  }

  @Get('daily-summary')
  async generateDailySummary(): Promise<any> {
    const report = await this.reportService.generateDailySummaryReport();
    return  report ;
  }

  // @Get('daily-summary')
  // async getDailySummary(): Promise<{ report: any }> {
  //   const report = await this.reportService.getDailySummaryReport();
  //   return { report };
  // }
}