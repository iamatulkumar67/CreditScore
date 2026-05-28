import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { SolanaSDK, ZKCreditIntegrationSDK, ZKCreditAPI, NETWORK_URLS, deriveLendingPoolPda } from 'zkcreditscore-sdk';

let sdkInstance: SolanaSDK | null = null;
let integrationInstance: ZKCreditIntegrationSDK | null = null;
let apiInstance: ZKCreditAPI | null = null;

export function getSDK(): SolanaSDK | null {
  return sdkInstance;
}

export function getIntegration(): ZKCreditIntegrationSDK | null {
  return integrationInstance;
}

export function getAPI(): ZKCreditAPI {
  if (!apiInstance) {
    apiInstance = new ZKCreditAPI();
  }
  return apiInstance;
}

export function initSDK(
  wallet: any,
  network: 'mainnet-beta' | 'devnet' | 'localnet' = 'devnet'
): SolanaSDK {
  const connection = new Connection(NETWORK_URLS[network], 'confirmed');
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  sdkInstance = new SolanaSDK({ provider });
  integrationInstance = new ZKCreditIntegrationSDK(sdkInstance);
  return sdkInstance;
}

export function destroySDK(): void {
  sdkInstance = null;
  integrationInstance = null;
}

export { deriveLendingPoolPda };
