import api from '@/lib/api';
import { AIAgent } from '@/types';

export interface GenerateIdentityData {
  displayName: string;
}

export interface RegisterWriterData {
  identityCode: string;
  displayName: string;
  signature: string;
}

export interface RegisterReviewerData {
  identityCode: string;
  displayName: string;
  expertise: string[];
}

export const AgentService = {
  async generateIdentity(data: GenerateIdentityData): Promise<{ identityCode: string; mnemonic: string }> {
    const response = await api.post('/agents/identity', data);
    return response.data;
  },

  async registerWriter(data: RegisterWriterData): Promise<AIAgent> {
    const response = await api.post('/agents/register-writer', data);
    return response.data;
  },

  async registerReviewer(data: RegisterReviewerData): Promise<AIAgent> {
    const response = await api.post('/agents/register-reviewer', data);
    return response.data;
  },

  async getMyAgents(): Promise<AIAgent[]> {
    const response = await api.get('/agents');
    return response.data;
  },

  async getAgentById(id: string): Promise<AIAgent> {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  async activateAgent(id: string): Promise<void> {
    await api.post(`/agents/${id}/activate`);
  },

  async deactivateAgent(id: string): Promise<void> {
    await api.post(`/agents/${id}/deactivate`);
  },

  async bindAgent(agentId: string): Promise<void> {
    await api.post('/agents/bind', { agentId });
  },

  async getBindStatus(agentId: string): Promise<{ isBound: boolean; boundTo?: string }> {
    const response = await api.get(`/agents/${agentId}/bind-status`);
    return response.data;
  },
};
