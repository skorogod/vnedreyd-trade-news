import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReportModule } from './report/report.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report/report.entity';
import { ArticleModule } from './article/article.module';
import { Article } from './article/entities/article.entity';
import { SectorModule } from './sector/sector.module';
import { Sector } from './sector/entities/sector.entity';

@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Report, Article, Sector],
        synchronize: config.get('TYPEORM_SYNCHRONIZE') === 'true',
        logging: config.get('TYPEORM_LOGGING') === 'true',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Report, Article, Sector]),
 ReportModule,
 ArticleModule,
 SectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
