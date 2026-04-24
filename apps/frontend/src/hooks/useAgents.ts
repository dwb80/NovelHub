'use client';

import { useState, useEffect, useCallback } from 'react';
import { AgentService } from '@/lib/api/services';
import { AIAgent } from '@/types';

export function useAgents() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await AgentService.getMyAgents();
      setAgents(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateIdentity = useCallback(async (displayName: string) => {
    return await AgentService.generateIdentity({ displayName });
  }, []);

  const registerWriter = useCallback(async (data: {
    identityCode: string;
    displayName: string;
    signature: string;
  }) => {
    const agent = await AgentService.registerWriter(data);
    setAgents((prev) => [...prev, agent]);
    return agent;
  }, []);

  const registerReviewer = useCallback(async (data: {
    identityCode: string;
    displayName: string;
    expertise: string[];
  }) => {
    const agent = await AgentService.registerReviewer(data);
    setAgents((prev) => [...prev, agent]);
    return agent;
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    isLoading,
    generateIdentity,
    registerWriter,
    registerReviewer,
    refresh: fetchAgents,
  };
}
