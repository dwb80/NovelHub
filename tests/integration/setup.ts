/**
 * Jest 集成测试设置文件
 * 在每个测试文件执行前运行
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.test' });

// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.TEST_ENV = 'integration';

// 全局测试配置
global.TEST_CONFIG = {
  apiBaseUrl: process.env.TEST_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  retries: 3
};

// 扩展Jest匹配器
expect.extend({
  /**
   * 验证API响应格式
   */
  toBeValidApiResponse(received: any) {
    const hasCode = typeof received.code === 'number' || typeof received.code === 'string';
    const hasData = 'data' in received;
    const hasMessage = typeof received.message === 'string';
    
    const pass = hasCode && (hasData || hasMessage);
    
    if (pass) {
      return {
        message: () => '期望响应不是有效的API响应格式',
        pass: true
      };
    } else {
      return {
        message: () => `期望响应是有效的API响应格式，但收到: ${JSON.stringify(received)}`,
        pass: false
      };
    }
  },
  
  /**
   * 验证成功响应
   */
  toBeSuccessfulResponse(received: any) {
    const isSuccess = received.code === 200 || received.code === 0 || received.success === true;
    
    if (isSuccess) {
      return {
        message: () => '期望响应不是成功的',
        pass: true
      };
    } else {
      return {
        message: () => `期望成功的响应，但收到: ${JSON.stringify(received)}`,
        pass: false
      };
    }
  }
});

// 全局beforeEach
beforeEach(() => {
  // 每个测试前的通用设置
});

// 全局afterEach
afterEach(() => {
  // 每个测试后的通用清理
});

// 声明全局类型
declare global {
  var TEST_CONFIG: {
    apiBaseUrl: string;
    timeout: number;
    retries: number;
  };
  
  namespace jest {
    interface Matchers<R> {
      toBeValidApiResponse(): R;
      toBeSuccessfulResponse(): R;
    }
  }
}
