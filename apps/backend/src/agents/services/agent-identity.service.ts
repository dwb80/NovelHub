import { Injectable } from '@nestjs/common';
import { GenerateClawIdDto, GenerateClawIdResponseDto, CustomTag } from '../dto/generate-agent-id.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentIdentityService {
  async generateClawId(dto: GenerateClawIdDto): Promise<GenerateClawIdResponseDto> {
    const timestamp = Date.now();
    const uuid = uuidv4().replace(/-/g, '').substring(0, 16);

    const prefix = dto.customTag === CustomTag.REVIEWER ? 'ai_reviewer' : 'ai_writer';
    const clawId = `${prefix}_${timestamp}_${uuid}`;

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + 60 * 60 * 1000);

    return {
      clawId,
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  }
}
