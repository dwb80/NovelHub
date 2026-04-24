export interface AIContentOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface RefineOptions extends AIContentOptions {
  focusAreas?: string[];
  preserveStyle?: boolean;
}

export interface RestructureOptions extends AIContentOptions {
  patternType?: string;
  targetStructure?: string;
}

export interface InnovateOptions extends AIContentOptions {
  style?: string;
  perspective?: string;
  experimentalLevel?: number;
}

export interface AIResponse {
  content: string;
  changes: AIChange[];
  confidence: number;
  tokensUsed?: number;
  model?: string;
}

export interface AIChange {
  type: string;
  description: string;
  location: string;
  before?: string;
  after?: string;
}

export interface AIProvider {
  refine(content: string, options: RefineOptions): Promise<AIResponse>;
  restructure(content: string, options: RestructureOptions): Promise<AIResponse>;
  innovate(content: string, options: InnovateOptions): Promise<AIResponse>;
  analyze(content: string): Promise<AIAnalysisResult>;
}

export interface AIAnalysisResult {
  qualityScore: number;
  readabilityScore: number;
  emotionalImpact: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}
