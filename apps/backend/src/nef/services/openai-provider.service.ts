import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIResponse,
  AIChange,
  RefineOptions,
  RestructureOptions,
  InnovateOptions,
  AIAnalysisResult,
} from './ai-provider.interface';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly apiKey: string | null;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || null;
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4';
    this.baseUrl = this.configService.get<string>('OPENAI_BASE_URL') || 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. OpenAI provider will not function.');
    }
  }

  async refine(content: string, options: RefineOptions): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `你是一位专业的小说编辑，擅长精修文字内容。你的任务是：
1. 优化用词表达，使语言更加精准优美
2. 修正标点符号使用
3. 改善句子流畅度
4. 保持原文风格和情感基调

请精修以下内容，并返回JSON格式的结果：
{
  "content": "精修后的内容",
  "changes": [
    {"type": "修改类型", "description": "修改描述", "location": "位置"}
  ],
  "confidence": 0.0-1.0
}`;

    const userPrompt = `请精修以下小说内容${options.focusAreas ? `，重点关注：${options.focusAreas.join('、')}` : ''}：

${content}`;

    return this.callOpenAI(systemPrompt, userPrompt, options);
  }

  async restructure(content: string, options: RestructureOptions): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `你是一位专业的小说结构师，擅长重构故事结构。你的任务是：
1. 应用${options.patternType || '标准'}情节结构
2. 优化叙事节奏
3. 调整张力曲线
4. 保持故事核心不变

请重构以下内容，并返回JSON格式的结果：
{
  "content": "重构后的内容",
  "changes": [
    {"type": "修改类型", "description": "修改描述", "location": "位置"}
  ],
  "confidence": 0.0-1.0
}`;

    const userPrompt = `请重构以下小说内容${options.targetStructure ? `，目标结构：${options.targetStructure}` : ''}：

${content}`;

    return this.callOpenAI(systemPrompt, userPrompt, options);
  }

  async innovate(content: string, options: InnovateOptions): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `你是一位富有创意的小说家，擅长创新写作。你的任务是：
1. 尝试新的叙事视角
2. 应用${options.style || '创新'}写作风格
3. 引入创新的写作技巧
4. 保持内容可读性

请创新改写以下内容，并返回JSON格式的结果：
{
  "content": "创新后的内容",
  "changes": [
    {"type": "修改类型", "description": "修改描述", "location": "位置"}
  ],
  "confidence": 0.0-1.0
}`;

    const userPrompt = `请创新改写以下小说内容${options.perspective ? `，尝试${options.perspective}视角` : ''}：

${content}`;

    return this.callOpenAI(systemPrompt, userPrompt, options);
  }

  async analyze(content: string): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `你是一位专业的文学评论家，请分析以下小说内容的质量。返回JSON格式：
{
  "qualityScore": 0-10,
  "readabilityScore": 0-10,
  "emotionalImpact": 0-10,
  "suggestions": ["建议1", "建议2"],
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"]
}`;

    const userPrompt = `请分析以下小说内容：

${content.substring(0, 4000)}`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await this.makeRequest(messages, { temperature: 0.3 });
      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        qualityScore: result.qualityScore || 5,
        readabilityScore: result.readabilityScore || 5,
        emotionalImpact: result.emotionalImpact || 5,
        suggestions: result.suggestions || [],
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
      };
    } catch (error: any) {
      this.logger.error(`Analysis failed: ${error.message}`);
      throw error;
    }
  }

  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    options: RefineOptions | RestructureOptions | InnovateOptions,
  ): Promise<AIResponse> {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await this.makeRequest(messages, {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 4000,
      });

      const result = JSON.parse(response.choices[0].message.content);

      return {
        content: result.content || '',
        changes: result.changes || [],
        confidence: result.confidence || 0.7,
        tokensUsed: response.usage?.total_tokens,
        model: this.model,
      };
    } catch (error: any) {
      this.logger.error(`OpenAI call failed: ${error.message}`);
      throw error;
    }
  }

  private async makeRequest(
    messages: OpenAIMessage[],
    options: { temperature?: number; maxTokens?: number },
  ): Promise<OpenAIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    return response.json();
  }
}
