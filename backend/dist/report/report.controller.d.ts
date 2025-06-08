import { ReportService } from './report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    getSummary(sectorId: number): Promise<{
        summary: string;
    }>;
    generateDailySummary(): Promise<any>;
}
