import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'creation_time' })
  creationTime: Date;

  // Новые поля для идентификации отчета
  @Column({ name: 'report_type', type: 'varchar', length: 50 })
  reportType: string; // например, 'daily_summary', 'sector_summary'

  @Column({ name: 'sector_id', type: 'int', nullable: true })
  sectorId?: number | null; // для отчетов по конкретному сектору

  @Column({ name: 'time_range_start', type: 'timestamp', nullable: true })
  timeRangeStart?: Date; // начало временного диапазона для отчета

  @Column({ name: 'time_range_end', type: 'timestamp', nullable: true })
  timeRangeEnd?: Date; // конец временного диапазона для отчета

  @Column({ name: 'articles_hash', type: 'varchar', length: 255, nullable: true })
  articlesHash?: string; // хеш для идентификации уникального набора статей
}