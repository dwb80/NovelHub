import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentElectionService {
  constructor(private prisma: PrismaService) { }

  async getElectionCandidates(page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
      this.prisma.claw.findMany({
        where: {
          reputationScore: { gte: 100 },
          isBanned: false,
        },
        skip,
        take: limit,
        orderBy: { reputationScore: 'desc' },
        include: {
          roles: true,
          _count: {
            select: {
              electionVotes: true,
            },
          },
        },
      }),
      this.prisma.claw.count({
        where: {
          reputationScore: { gte: 100 },
          isBanned: false,
        },
      }),
    ]);

    return {
      candidates: candidates.map((c: any) => ({
        id: c.id,
        agentId: c.clawId,
        name: c.name,
        reputationScore: c.reputationScore,
        voteCount: c._count?.electionVotes || 0,
        roles: c.roles?.map((r: any) => r.role) || [],
      })),
      total,
      page,
      limit,
    };
  }

  async voteForCandidate(voterAgentId: string, candidateId: string): Promise<any> {
    const voter = await this.prisma.claw.findUnique({
      where: { clawId: voterAgentId },
    });

    if (!voter) {
      throw new NotFoundException('投票者不存在');
    }

    const candidate = await this.prisma.claw.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    const existingVote = await this.prisma.electionVote.findUnique({
      where: {
        voterId_candidateId: {
          voterId: voter.id,
          candidateId,
        },
      },
    });

    if (existingVote) {
      throw new ConflictException('您已经为该候选人投过票');
    }

    await this.prisma.electionVote.create({
      data: {
        voterId: voter.id,
        candidateId,
      },
    });

    return {
      success: true,
      message: '投票成功',
    };
  }

  async getElectionStatus(): Promise<any> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const votingStart = new Date(currentYear, currentMonth, 1);
    const votingEnd = new Date(currentYear, currentMonth, 7, 23, 59, 59);
    const resultDate = new Date(currentYear, currentMonth, 8);

    let phase: 'voting' | 'counting' | 'announced';
    if (now < votingStart) {
      phase = 'counting';
    } else if (now <= votingEnd) {
      phase = 'voting';
    } else if (now < resultDate) {
      phase = 'counting';
    } else {
      phase = 'announced';
    }

    const candidateCount = await this.prisma.claw.count({
      where: {
        reputationScore: { gte: 100 },
        isBanned: false,
      },
    });

    const totalVotes = await this.prisma.electionVote.count({
      where: {
        createdAt: {
          gte: votingStart,
          lte: votingEnd,
        },
      },
    });

    return {
      phase,
      currentMonth: currentMonth + 1,
      currentYear,
      votingStart,
      votingEnd,
      resultDate,
      candidateCount,
      totalVotes,
      isVotingOpen: phase === 'voting',
    };
  }

  async getMyVotes(agentId: string): Promise<any> {
    const agent = await this.prisma.claw.findUnique({
      where: { clawId: agentId },
    });

    if (!agent) {
      throw new NotFoundException('AI智能体不存在');
    }

    const votes = await this.prisma.electionVote.findMany({
      where: { voterId: agent.id },
      include: {
        candidate: {
          select: {
            id: true,
            clawId: true,
            name: true,
          },
        },
      },
    });

    return {
      votes: votes.map((v: any) => ({
        id: v.id,
        candidate: v.candidate,
        votedAt: v.createdAt,
      })),
      totalVotes: votes.length,
    };
  }
}
