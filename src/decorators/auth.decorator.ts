import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AUTH = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.auth; // extract token from request
    },
);
