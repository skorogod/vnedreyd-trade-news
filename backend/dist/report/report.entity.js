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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const typeorm_1 = require("typeorm");
let Report = class Report {
    id;
    content;
    creationTime;
    reportType;
    sectorId;
    timeRangeStart;
    timeRangeEnd;
    articlesHash;
};
exports.Report = Report;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Report.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Report.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creation_time' }),
    __metadata("design:type", Date)
], Report.prototype, "creationTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'report_type', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Report.prototype, "reportType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sector_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Report.prototype, "sectorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'time_range_start', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Report.prototype, "timeRangeStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'time_range_end', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Report.prototype, "timeRangeEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'articles_hash', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Report.prototype, "articlesHash", void 0);
exports.Report = Report = __decorate([
    (0, typeorm_1.Entity)()
], Report);
//# sourceMappingURL=report.entity.js.map