/**
 * AI智能体自动化工作流测试
 * 
 * 使用新的模块化架构：
 * - 高内聚：测试逻辑集中在工作流服务中
 * - 低耦合：通过配置注入，不依赖具体实现
 * - 可复用：工作流服务可被其他测试复用
 */

import { AIWorkflowService, WorkflowConfig, TestExecutionResult } from '../index';

// 测试配置
const WORKFLOW_CONFIG: WorkflowConfig = {
  apiBaseUrl: 'http://localhost:3001',
  chaptersDir: 'd:\\trae\\novelhub\\case\\chapters',
  
  writerConfig: {
    apiKey: 'claw_api_key_001',
    clawId: 'ai_writer_test_001',
    name: 'AI作家测试账号',
    publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwriter_test_001_public_key\n-----END PUBLIC KEY-----',
    version: '1.0.0',
    capabilities: ['writing', 'editing'],
  },
  
  reviewerConfig: {
    apiKey: 'claw_api_key_001',
    clawId: 'ai_reviewer_test_001',
    name: 'AI评审员测试账号',
    publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAreviewer_test_001_public_key\n-----END PUBLIC KEY-----',
    version: '1.0.0',
    capabilities: ['reviewing', 'analysis'],
  },
  
  timeout: 30000,
  retries: 3,
};

/**
 * 生成测试报告
 */
function generateReport(result: TestExecutionResult): void {
  console.log('\n============================================================');
  console.log('                    自动化测试报告                          ');
  console.log('============================================================');
  console.log(`测试时间: ${result.startTime.toISOString()}`);
  console.log(`测试小说: AI觉醒之路`);
  console.log(`小说ID: ${result.novelId || 'N/A'}`);
  console.log(`章节数量: ${result.chapterIds.length}`);
  console.log(`评审任务: ${result.reviewTaskIds.length}`);
  console.log('============================================================');
  
  if (result.success) {
    console.log('✓ 所有测试步骤执行完成！');
  } else {
    console.log('✗ 测试执行失败');
    console.log('错误信息:');
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  if (result.endTime) {
    const duration = result.endTime.getTime() - result.startTime.getTime();
    console.log(`\n执行时长: ${duration}ms`);
  }
  
  console.log('============================================================\n');
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('============================================================');
  console.log('      AI智能体自动化工作流测试（模块化版本）              ');
  console.log('============================================================');
  console.log(`API地址: ${WORKFLOW_CONFIG.apiBaseUrl}`);
  console.log(`章节目录: ${WORKFLOW_CONFIG.chaptersDir}`);
  console.log('============================================================\n');

  const workflow = new AIWorkflowService(WORKFLOW_CONFIG);
  const result = await workflow.executeFullWorkflow();

  generateReport(result);

  if (result.success) {
    console.log('✓ 自动化测试执行成功！');
    process.exit(0);
  } else {
    console.error('✗ 自动化测试执行失败');
    process.exit(1);
  }
}

// 执行测试
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
