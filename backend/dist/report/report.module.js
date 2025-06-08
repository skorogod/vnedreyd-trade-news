"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModule = void 0;
const common_1 = require("@nestjs/common");
const report_controller_1 = require("./report.controller");
const report_service_1 = require("./report.service");
const typeorm_1 = require("@nestjs/typeorm");
const report_entity_1 = require("./report.entity");
const article_module_1 = require("../article/article.module");
const openrouter_service_1 = require("./openrouter.service");
const sector_module_1 = require("../sector/sector.module");
let ReportModule = class ReportModule {
};
exports.ReportModule = ReportModule;
exports.ReportModule = ReportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([report_entity_1.Report]),
            article_module_1.ArticleModule,
            sector_module_1.SectorModule
        ],
        controllers: [report_controller_1.ReportController],
        providers: [report_service_1.ReportService, openrouter_service_1.OpenRouterService]
    })
], ReportModule);
//# sourceMappingURL=report.module.js.map