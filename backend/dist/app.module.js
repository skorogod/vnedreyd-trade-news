"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const report_module_1 = require("./report/report.module");
const typeorm_1 = require("@nestjs/typeorm");
const report_entity_1 = require("./report/report.entity");
const article_module_1 = require("./article/article.module");
const article_entity_1 = require("./article/entities/article.entity");
const sector_module_1 = require("./sector/sector.module");
const sector_entity_1 = require("./sector/entities/sector.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST'),
                    port: +config.get('DB_PORT'),
                    username: config.get('DB_USERNAME'),
                    password: config.get('DB_PASSWORD'),
                    database: config.get('DB_NAME'),
                    entities: [report_entity_1.Report, article_entity_1.Article, sector_entity_1.Sector],
                    synchronize: config.get('TYPEORM_SYNCHRONIZE') === 'true',
                    logging: config.get('TYPEORM_LOGGING') === 'true',
                    retryAttempts: 3,
                    retryDelay: 3000,
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([report_entity_1.Report, article_entity_1.Article, sector_entity_1.Sector]),
            report_module_1.ReportModule,
            article_module_1.ArticleModule,
            sector_module_1.SectorModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map