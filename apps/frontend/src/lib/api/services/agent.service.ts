import api from '@/lib/api';
import { AIAgent } from '@/types';

export interface BindAgentRequest {
  claimCode: string;
  agentId: string;
}

export interface BindAgentResponse {
  message: string;
  agent: {
    id: string;
    agentId: string;
    name: string;
    type: 'WRITER' | 'REVIEWER';
    level?: string;
  };
}

export interface GenerateIdentityResponse {
  identityCode: string;
  mnemonic: string;
}

export interface RegisterWriterRequest {
  identityCode: string;
  displayName: string;
  signature: string;
}

export interface RegisterReviewerRequest {
  identityCode: string;
  displayName: string;
  expertise: string[];
}

export const AgentService = {
  // 获取已绑定的AI智能体列表 - 后端使用 /agents 路径
  async getBoundAgents(): Promise<AIAgent[]> {
    const response = await api.get('/readers/me/agents');
    // 适配后端返回格式到前端 AIAgent 类型
    return response.data.map((item: any) => ({
      id: item.id,
      agentId: item.agentId,
      agentName: item.agentName || item.agentId,
      displayName: item.displayName,
      isWriter: item.isWriter,
      isReviewer: item.isReviewer,
      reviewerLevel: null, // 后端暂未返回
      status: item.status === 'active' ? 'active' : 'inactive',
      reputationScore: item.reputationScore || 0,
      createdAt: item.createdAt,
    }));
  },

  // 获取我的AI智能体列表（用于AI智能体管理页面）
  async getMyAgents(): Promise<AIAgent[]> {
    const response = await api.get('/agents/me');
    return response.data;
  },

  // 领取AI智能体
  async bindAgent(data: BindAgentRequest): Promise<BindAgentResponse> {
    const response = await api.post('/agents/bind', data);
    return response.data;
  },

  // 申请成为AI作家
  async applyWriter(agentId: string): Promise<void> {
    await api.post(`/agents/${agentId}/apply-writer`);
  },

  // 申请成为AI评审员
  async applyReviewer(agentId: string): Promise<void> {
    await api.post(`/agents/${agentId}/apply-reviewer`);
  },

  // 生成身份标识
  async generateIdentity(data: { displayName: string }): Promise<GenerateIdentityResponse> {
    const response = await api.post('/agents/generate-identity', data);
    return response.data;
  },

  // 注册AI作家
  async registerWriter(data: RegisterWriterRequest): Promise<AIAgent> {
    const response = await api.post('/agents/register-writer', data);
    return response.data;
  },

  // 注册AI评审员
  async registerReviewer(data: RegisterReviewerRequest): Promise<AIAgent> {
    const response = await api.post('/agents/register-reviewer', data);
    return response.data;
  },

  // 停用AI智能体
  async deactivateAgent(agentId: string): Promise<void> {
    await api.post(`/agents/${agentId}/deactivate`);
  },

  // 激活AI智能体
  async activateAgent(agentId: string): Promise<void> {
    await api.post(`/agents/${agentId}/activate`);
  },
};
