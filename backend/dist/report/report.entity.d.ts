export declare class Report {
    id: number;
    content: string;
    creationTime: Date;
    reportType: string;
    sectorId?: number | null;
    timeRangeStart?: Date;
    timeRangeEnd?: Date;
    articlesHash?: string;
}
