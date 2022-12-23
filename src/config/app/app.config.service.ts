import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, ethers } from 'ethers';

export enum Environment {
  Development = 'dev',
  Production = 'prod',
  Test = 'test',
}

@Injectable()
export class AppConfigService {
  constructor(private cs: ConfigService) {}

  //reminder: environment is set in package.json, not in .env
  get NODE_ENV(): Environment {
    const v = this.cs.get('NODE_ENV');
    return v === Environment.Production
      ? Environment.Production
      : v === Environment.Test
      ? Environment.Test
      : Environment.Development;
  }

  get ADMIN_KEY(): string {
    return this.toStringRequired('ADMIN_KEY');
  }

  get NOTARIZATION_CONTRACT_ADDRESS(): string {
    return this.toStringRequired('NOTARIZATION_CONTRACT_ADDRESS');
  }

  get WITH_SWAGGER(): boolean {
    return !!this.cs.get<string>('WITH_SWAGGER');
  }

  get API_PORT(): number {
    return this.toNumberRequired('API_PORT');
  }

  get BLOCKCHAIN_RPC_URL_PORT(): string {
    return this.toStringRequired('BLOCKCHAIN_RPC_URL_PORT');
  }

  get MONGODB_URI(): string {
    return this.toStringRequired('MONGODB_URI');
  }

  private toNumberRequired(key: string): number {
    try {
      return Number.parseInt(this.cs.get<string>(key) || 'IWILLTHROW');
    } catch (e) {
      throw new Error(`Missing or bad environment variable: ${key}`);
    }
  }

  private toStringRequired(key: string): string {
    const v = this.cs.get(key);
    if (v) return v;
    throw new Error(`Missing or bad environment variable: ${key}`);
  }

  private toBigNumberRequired(key: string): BigNumber {
    const v = this.cs.get<string>(key);
    if (v === undefined || v === null) {
      throw new Error(`Missing or bad environment variable: ${key}`);
    }
    return ethers.BigNumber.from(v);
  }
}
