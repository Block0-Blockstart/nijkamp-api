import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ethJwk, ethJws } from 'eth-jws/lib';
import { NextFunction, Request, Response } from 'express';
import { Operations } from '../operations.enum';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentOperation: ICurrentOperation;
    }
  }
}

export interface ICurrentOperation {
  error: string | null;
  operation: IOperation<any> | null;
}

export interface IOperation<E> {
  opOrigin: {
    ethereumAddress: string;
    ethereumPublicKey: string;
  };
  opPayload: E;
  opToken: string;
}

@Injectable()
export class CurrentOperationMiddleware implements NestMiddleware {
  private readonly logger = new Logger('OperationsMiddleware');

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        req.currentOperation = {
          error: 'No Bearer token in authorization header',
          operation: null,
        };
        return next();
      }

      const token = authHeader.split(' ')[1]; // remove the leading 'Bearer '
      if (!token) {
        req.currentOperation = {
          error: 'No Bearer token in authorization header',
          operation: null,
        };
        return next();
      }

      let ethereumAddress: string;
      let ethereumPublicKey: string;
      let opPayload: any;

      try {
        const { header, payload, publicKey } = ethJws.verify({ jws: token });
        opPayload = payload;
        ethereumPublicKey = publicKey;
        ethereumAddress = ethJwk.publicKey.toEthereumAddress(header.jwk);
      } catch (e) {
        req.currentOperation = { error: 'Invalid token', operation: null };
        return next();
      }

      if (!opPayload.opName || typeof opPayload.opName !== 'string') {
        req.currentOperation = { error: 'Missing opName', operation: null };
        return next();
      }

      if (!Object.values(Operations).includes(opPayload.opName)) {
        req.currentOperation = { error: 'Unknown opName', operation: null };
        return next();
      }

      req.currentOperation = {
        error: null,
        operation: {
          opOrigin: { ethereumAddress, ethereumPublicKey },
          opPayload,
          opToken: token,
        },
      };
      return next();
    } catch (e) {
      this.logger.error('Internal error while retrieving operation from jws token:');
      this.logger.error(e);
      this.logger.error('Above error needs debug. It will be ignored this time!');
      req.currentOperation = { error: 'Internal error', operation: null };
      return next();
    }
  }
}
