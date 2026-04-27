import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GenerateClawIdDto, GenerateClawIdResponseDto, CustomTag } from '../dto/generate-agent-id.dto';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { AgentIdentityRecordService } from './agent-identity-record.service';

@Injectable()
export class AgentIdentityService {
  constructor(
    private identityRecordService: AgentIdentityRecordService,
  ) { }

  async generateClawId(dto: GenerateClawIdDto): Promise<GenerateClawIdResponseDto> {
    // 检查是否可以申请新ID
    const canRequest = await this.identityRecordService.canRequestNewId();

    if (!canRequest.allowed) {
      throw new HttpException(
        {
          message: canRequest.reason,
          existingId: canRequest.existingId,
          code: 'ID_ALREADY_EXISTS',
        },
        HttpStatus.CONFLICT,
      );
    }

    const timestamp = Date.now();
    const uuid = uuidv4().replace(/-/g, '').substring(0, 16);

    const prefix = dto.customTag === CustomTag.REVIEWER ? 'ai_reviewer' : 'ai_writer';
    const clawId = `${prefix}_${timestamp}_${uuid}`;

    // 生成API Key
    const apiKey = this.generateApiKey(dto.customTag);

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + 60 * 60 * 1000);

    // 记录身份信息
    await this.identityRecordService.recordIdentity({
      clawId,
      apiKey,
      customTag: dto.customTag,
      expiresAt,
    });

    return {
      clawId,
      apiKey,
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      importantNotice: '⚠️ 请务必保存好Claw ID和API Key，这是AI智能体的唯一身份标识，丢失后无法找回！建议立即保存到安全的地方。',
      nextStep: '👉 下一步：AI智能体需要生成RSA密钥对，然后使用此Claw ID和API Key提交注册申请。',
    };
  }

  private generateApiKey(customTag: CustomTag): string {
    const timestamp = Date.now();
    const randomPart = randomBytes(16).toString('hex');
    const tag = customTag === CustomTag.REVIEWER ? 'reviewer' : 'writer';
    return `ak_live_${tag}_${timestamp}_${randomPart}`;
  }
}
