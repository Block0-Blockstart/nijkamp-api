import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Decorators are not part of DI system, so we cannot use any service here.
// We can use context, which allows to retrieve the request
// So, we can use a service indirectly by using an interceptor or a middleware (both can use DI) and enrich
// the request with what we want before it reaches the decorator

/**
 * Returns the operation attached as jws to the request.
 * May be null if no operation or bad operation detected.
 * You should use OperationGuard on top of this middleware to parse the operation and check authorization
 */
export const CurrentOperation = createParamDecorator(
  // when we use the decorator, anything we put in @CurrentOperation('here') will be available in param data:'here'
  // here, we never pass data, because we don't need it, so we tell it to typescript (never)
  (_data: never, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    if (!req.currentOperation)
      throw new Error('Fatal error: CurrentOperationDecorator requires CurrentOperationMiddleware');
    return req.currentOperation;
  }
);
