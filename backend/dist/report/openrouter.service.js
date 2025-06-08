"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let OpenRouterService = class OpenRouterService {
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    apiKey = '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';
    model = 'deepseek/deepseek-r1-0528:free';
    async generateResponse(prompt) {
        const payload = {
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
        };
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
        try {
            const response = await axios_1.default.post(this.apiUrl, payload, { headers });
            console.log(response);
            const message = response.data.choices?.[0]?.message?.content;
            return message ?? 'No response from model';
        }
        catch (error) {
            console.error('OpenRouter API error:', error.response?.data || error.message);
            throw new Error('Failed to get response from OpenRouter');
        }
    }
};
exports.OpenRouterService = OpenRouterService;
exports.OpenRouterService = OpenRouterService = __decorate([
    (0, common_1.Injectable)()
], OpenRouterService);
//# sourceMappingURL=openrouter.service.js.map