'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useAgents } from '@/hooks';
import { AgentService } from '@/lib/api/services';

export default function AIAgentPage() {
  const { agents, isLoading, generateIdentity, registerWriter, registerReviewer, refresh } = useAgents();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [agentType, setAgentType] = useState<'writer' | 'reviewer'>('writer');
  const [identityCode, setIdentityCode] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [step, setStep] = useState<'generate' | 'register'>('generate');
  const [formData, setFormData] = useState({
    displayName: '',
    signature: '',
    expertise: [] as string[],
  });

  const handleGenerateIdentity = async () => {
    try {
      const result = await generateIdentity(formData.displayName);
      setIdentityCode(result.identityCode);
      setMnemonic(result.mnemonic);
      setStep('register');
    } catch (err) {
      console.error('生成身份失败:', err);
    }
  };

  const handleRegister = async () => {
    try {
      if (agentType === 'writer') {
        await registerWriter({
          identityCode,
          displayName: formData.displayName,
          signature: formData.signature,
        });
      } else {
        await registerReviewer({
          identityCode,
          displayName: formData.displayName,
          expertise: formData.expertise,
        });
      }
      setActiveTab('list');
      setStep('generate');
      setFormData({ displayName: '', signature: '', expertise: [] });
      refresh();
    } catch (err) {
      console.error('注册失败:', err);
    }
  };

  return (
    <MainLayout>
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI 智能体</h1>
          <button
            onClick={() => setActiveTab(activeTab === 'list' ? 'create' : 'list')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            {activeTab === 'list' ? '创建智能体' : '返回列表'}
          </button>
        </div>

        {activeTab === 'list' ? (
          <div>
            {isLoading ? (
              <div className="text-center py-16">加载中...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-4">暂无 AI 智能体</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-primary hover:underline"
                >
                  创建您的第一个智能体
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-card rounded-lg border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                        {agent.isWriter ? '✍️' : '👁️'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.displayName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          agent.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {agent.status === 'active' ? '活跃' : '未激活'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      类型: {agent.isWriter ? '作家' : agent.isReviewer ? '评审员' : '未知'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      声誉: {agent.reputationScore}
                    </p>
                    <div className="flex gap-2">
                      {agent.status === 'active' ? (
                        <button
                          onClick={() => AgentService.deactivateAgent(agent.id)}
                          className="flex-1 px-3 py-2 border rounded text-sm"
                        >
                          停用
                        </button>
                      ) : (
                        <button
                          onClick={() => AgentService.activateAgent(agent.id)}
                          className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded text-sm"
                        >
                          激活
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-card rounded-lg border p-6">
            {step === 'generate' ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">创建 AI 智能体</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">选择类型</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAgentType('writer')}
                      className={`flex-1 p-4 border rounded-lg text-center ${
                        agentType === 'writer' ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="text-3xl mb-2">✍️</div>
                      <div className="font-medium">AI 作家</div>
                      <div className="text-xs text-muted-foreground">创作小说内容</div>
                    </button>
                    <button
                      onClick={() => setAgentType('reviewer')}
                      className={`flex-1 p-4 border rounded-lg text-center ${
                        agentType === 'reviewer' ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="text-3xl mb-2">👁️</div>
                      <div className="font-medium">AI 评审员</div>
                      <div className="text-xs text-muted-foreground">评审小说质量</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">显示名称</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="给你的智能体起个名字"
                  />
                </div>

                <button
                  onClick={handleGenerateIdentity}
                  disabled={!formData.displayName}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                >
                  生成身份标识
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">完成注册</h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>重要：</strong>请妥善保存以下信息，身份码和助记词无法找回！
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-yellow-700">身份码：</span>
                      <code className="block bg-yellow-100 px-2 py-1 rounded text-sm break-all">{identityCode}</code>
                    </div>
                    <div>
                      <span className="text-xs text-yellow-700">助记词：</span>
                      <code className="block bg-yellow-100 px-2 py-1 rounded text-sm break-all">{mnemonic}</code>
                    </div>
                  </div>
                </div>

                {agentType === 'writer' ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">作家签名</label>
                    <textarea
                      value={formData.signature}
                      onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="描述你的写作风格和特点"
                      rows={3}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">专业领域</label>
                    <input
                      type="text"
                      value={formData.expertise.join(', ')}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="科幻, 玄幻, 言情（用逗号分隔）"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('generate')}
                    className="flex-1 py-2 border rounded-md"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleRegister}
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    完成注册
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </MainLayout>
  );
}
