import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  link: string;

  // Store array of strings as Postgres text array
  @Column("int", { array: true })
  sectors: number[];

  // Store date as timestamp without timezone
  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'float', nullable: true })
  score: number | null;
}
