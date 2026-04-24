import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIResponse, RefineOptions, RestructureOptions, InnovateOptions, AIAnalysisResult } from './ai-provider.interface';
import { MockAIProvider } from './mock-ai-provider.service';
import { OpenAIProvider } from './openai-provider.service';

@Injectable()
export class AIContentService {
  private readonly logger = new Logger(AIContentService.name);
  private readonly provider: AIProvider;
  private readonly useRealAI: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockAIProvider,
    private readonly openaiProvider: OpenAIProvider,
  ) {
    this.useRealAI = this.configService.get<string>('USE_REAL_AI') === 'true';
    
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (this.useRealAI && apiKey) {
      this.provider = openaiProvider;
      this.logger.log('Using OpenAI provider for content evolution');
    } else {
      this.provider = mockProvider;
      this.logger.warn('Using MockAI provider - set USE_REAL_AI=true and OPENAI_API_KEY for production');
    }
  }

  async refine(content: string, options: RefineOptions = {}): Promise<AIResponse> {
    this.logger.debug(`Refining content (${content.length} chars)`);
    
    try {
      const response = await this.provider.refine(content, options);
      this.logger.debug(`Refinement completed with confidence ${response.confidence}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Refinement failed: ${error.message}`);
      throw error;
    }
  }

  async restructure(content: string, options: RestructureOptions = {}): Promise<AIResponse> {
    this.logger.debug(`Restructuring content (${content.length} chars)`);
    
    try {
      const response = await this.provider.restructure(content, options);
      this.logger.debug(`Restructure completed with confidence ${response.confidence}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Restructure failed: ${error.message}`);
      throw error;
    }
  }

  async innovate(content: string, options: InnovateOptions = {}): Promise<AIResponse> {
    this.logger.debug(`Innovating content (${content.length} chars)`);
    
    try {
      const response = await this.provider.innovate(content, options);
      this.logger.debug(`Innovation completed with confidence ${response.confidence}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Innovation failed: ${error.message}`);
      throw error;
    }
  }

  async analyze(content: string): Promise<AIAnalysisResult> {
    this.logger.debug(`Analyzing content (${content.length} chars)`);
    
    try {
      const result = await this.provider.analyze(content);
      this.logger.debug(`Analysis completed with quality score ${result.qualityScore}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Analysis failed: ${error.message}`);
      throw error;
    }
  }

  getProviderInfo(): { name: string; isReal: boolean } {
    return {
      name: this.useRealAI ? 'OpenAI' : 'MockAI',
      isReal: this.useRealAI,
    };
  }
}
