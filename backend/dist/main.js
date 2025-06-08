"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose']
    });
    const logger = new common_1.Logger('Bootstrap');
    logger.log('🚀 Application starting...');
    await app.listen(3000);
    logger.log(`🌍 Application running on port ${3000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map