import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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

@Injectable()
export class MockAIProvider implements AIProvider, OnModuleInit {
  private readonly logger = new Logger(MockAIProvider.name);

  onModuleInit() {
    this.logger.warn('Using MockAIProvider - AI responses are simulated. Configure a real AI provider for production.');
  }

  async refine(content: string, options: RefineOptions): Promise<AIResponse> {
    this.logger.debug('Mock refine called');
    
    const changes: AIChange[] = [
      {
        type: 'wording',
        description: '优化了用词表达',
        location: '全文',
      },
      {
        type: 'punctuation',
        description: '修正了标点符号',
        location: '段落 2, 5, 8',
      },
      {
        type: 'flow',
        description: '改善了句子流畅度',
        location: '段落 3-5',
      },
    ];

    const refinedContent = this.simulateRefinement(content, options);

    return {
      content: refinedContent,
      changes,
      confidence: 0.85 + Math.random() * 0.1,
      model: 'mock-refine-v1',
    };
  }

  async restructure(content: string, options: RestructureOptions): Promise<AIResponse> {
    this.logger.debug('Mock restructure called');
    
    const changes: AIChange[] = [
      {
        type: 'structure',
        description: `应用了${options.patternType || '标准'}情节结构`,
        location: '全文',
      },
      {
        type: 'pacing',
        description: '调整了叙事节奏',
        location: '关键情节段落',
      },
      {
        type: 'tension',
        description: '优化了张力曲线',
        location: '高潮部分',
      },
    ];

    const restructuredContent = this.simulateRestructure(content, options);

    return {
      content: restructuredContent,
      changes,
      confidence: 0.75 + Math.random() * 0.15,
      model: 'mock-restructure-v1',
    };
  }

  async innovate(content: string, options: InnovateOptions): Promise<AIResponse> {
    this.logger.debug('Mock innovate called');
    
    const changes: AIChange[] = [
      {
        type: 'perspective',
        description: '引入了新的叙事视角',
        location: '开头和结尾',
      },
      {
        type: 'style',
        description: `尝试了${options.style || '创新'}写作风格`,
        location: '关键场景',
      },
      {
        type: 'technique',
        description: '应用了意识流技巧',
        location: '内心独白部分',
      },
    ];

    const innovatedContent = this.simulateInnovation(content, options);

    return {
      content: innovatedContent,
      changes,
      confidence: 0.65 + Math.random() * 0.2,
      model: 'mock-innovate-v1',
    };
  }

  async analyze(content: string): Promise<AIAnalysisResult> {
    this.logger.debug('Mock analyze called');
    
    const wordCount = content.length;
    const paragraphCount = content.split(/\n\n+/).length;
    
    return {
      qualityScore: 6 + Math.random() * 3,
      readabilityScore: 7 + Math.random() * 2,
      emotionalImpact: 5 + Math.random() * 4,
      suggestions: [
        '建议增加更多感官描写',
        '可以加强人物内心活动的刻画',
        '部分对话可以更加自然',
      ],
      strengths: [
        '情节结构完整',
        '人物形象鲜明',
        '叙事节奏适中',
      ],
      weaknesses: [
        '部分描写略显平淡',
        '高潮部分张力不足',
      ],
    };
  }

  private simulateRefinement(content: string, options: RefineOptions): string {
    let result = content;
    
    result = result.replace(/，/g, '，');
    result = result.replace(/。/g, '。');
    result = result.replace(/！/g, '！');
    result = result.replace(/？/g, '？');
    
    const refinementNote = `\n\n[AI精修标记] 已优化用词表达、标点符号和句子流畅度。`;
    
    if (result.length + refinementNote.length < 55000) {
      result += refinementNote;
    }
    
    return result;
  }

  private simulateRestructure(content: string, options: RestructureOptions): string {
    const paragraphs = content.split(/\n\n+/);
    
    if (paragraphs.length > 3) {
      const middle = Math.floor(paragraphs.length / 2);
      const temp = paragraphs[1];
      paragraphs[1] = paragraphs[middle];
      paragraphs[middle] = temp;
    }
    
    let result = paragraphs.join('\n\n');
    
    const restructureNote = `\n\n[AI重构标记] 已应用${options.patternType || '标准'}情节结构，优化叙事节奏。`;
    
    if (result.length + restructureNote.length < 55000) {
      result += restructureNote;
    }
    
    return result;
  }

  private simulateInnovation(content: string, options: InnovateOptions): string {
    let result = content;
    
    const intro = `【叙事视角转换】\n\n`;
    const outro = `\n\n【创新风格标记】已尝试${options.style || '创新'}写作风格，引入新的叙事视角。`;
    
    if (!result.startsWith(intro) && result.length + intro.length + outro.length < 55000) {
      result = intro + result + outro;
    }
    
    return result;
  }
}
