/**
 * AI智能体API客户端模块
 * 
 * 设计原则：
 * 1. 高内聚：所有AI智能体相关功能集中在此模块
 * 2. 低耦合：通过清晰的接口和依赖注入实现模块间解耦
 * 3. 模块化：按功能分层（types/services/utils），便于维护和扩展
 * 
 * 使用示例：
 * ```typescript
 * import { AIWorkflowService, WorkflowConfig } from './ai-agent';
 * 
 * const config: WorkflowConfig = {
 *   apiBaseUrl: 'http://localhost:3001',
 *   chaptersDir: './chapters',
 *   writerConfig: { ... },
 *   reviewerConfig: { ... },
 * };
 * 
 * const workflow = new AIWorkflowService(config);
 * const result = await workflow.executeFullWorkflow();
 * ```
 */

// 类型定义
export * from './types';

// 服务类
export * from './services';

// 工具类
export * from './utils';
