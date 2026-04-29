import { Module } from '@nestjs/common';
import { SkillsSubmissionController } from './skills-submission.controller';
import { SkillsReviewController } from './skills-review.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkillsSubmissionController, SkillsReviewController],
  providers: [],
  exports: [],
})
export class SkillsModule {}
