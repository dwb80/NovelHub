// ============================================
// OpenAPI TypeScript 类型生成配置
// 从后端 Swagger 文档生成前端类型定义
//
// 使用方法:
// 1. 确保后端服务运行在 http://localhost:3001
// 2. 运行: npx openapi-typescript http://localhost:3001/api-json -o src/types/api.ts
// 3. 或在项目根目录运行: npm run generate:types
// ============================================

/**
 * OpenAPI 配置对象
 * 用于从后端 NestJS Swagger 文档生成 TypeScript 类型
 */
const config = {
  // 后端 Swagger JSON 地址
  schema: 'http://localhost:3001/api-json',

  // 输出文件路径
  output: './src/types/api.ts',

  // 生成选项
  options: {
    // 导出类型而不是接口
    exportType: true,

    // 支持 readonly 属性
    immutable: true,

    // 生成路径参数类型
    pathParamsAsTypes: true,
  },
};

export default config;

// 类型导出辅助函数
// 注意：这些类型需要在使用前确保 API 类型文件已生成

/**
 * 从生成的 API 类型中提取响应类型
 * @example
 * type NovelResponse = ExtractResponse<'/novels/{id}'>
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ExtractResponse<T extends string> = unknown;

/**
 * 从生成的 API 类型中提取请求类型
 * @example
 * type CreateNovelRequest = ExtractRequest<'/novels'>
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ExtractRequest<T extends string> = unknown;
