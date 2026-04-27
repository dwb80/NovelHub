import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAgent = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const agent = request.agent;

    return data ? agent?.[data] : agent;
  },
);
