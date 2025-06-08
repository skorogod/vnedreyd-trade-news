import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenRouterService {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly apiKey = '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';
  private readonly model = 'deepseek/deepseek-r1-0528:free';

  async generateResponse(prompt: string): Promise<string> {
    const payload = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    };

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
        const response = await axios.post(this.apiUrl, payload, { headers });
        console.log(response)
        // Согласно документации, ответ должен содержать choices[0].message.content
        const message = response.data.choices?.[0]?.message?.content;
        return message ?? 'No response from model';
  
    } catch (error: any) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw new Error('Failed to get response from OpenRouter');
    }
  }
}
