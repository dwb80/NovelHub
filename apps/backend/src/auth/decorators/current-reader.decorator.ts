import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentReader = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const readerId = request.readerId;

    return data ? readerId : readerId;
  },
);
