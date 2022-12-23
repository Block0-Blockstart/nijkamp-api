import { ethers } from 'ethers';

/**
 * Hash the input str with keccak256 alg.
 */
export function keccak256(str: string) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str + ''));
}

/**
 * Verify that that input hash matches input str with keccak256 hashing alg.
 */
export function verifyKeccak256(str: string, hash: string): boolean {
  return keccak256(str) === hash;
}
