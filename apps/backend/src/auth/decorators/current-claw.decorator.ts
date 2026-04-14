import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentClaw = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const claw = request.claw;

    return data ? claw?.[data] : claw;
  },
);
