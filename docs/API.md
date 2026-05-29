# ZKCreditScore Protocol — API Reference

---

## REST API

Base URL: `https://api.zkscore.credit/v1` (production) or `http://localhost:3000/api` (local dev)

### GET /api

Health check endpoint.

**Response:**

```json
{
  "message": "Hello, world!"
}
```

**Example:**

```bash
curl http://localhost:3000/api
```

---

### GET /api/stats

Protocol-level statistics. Falls back to mock data if upstream API is unavailable.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalTVL": 100000000,
    "totalCredentials": 100432,
    "activeLoans": 20187,
    "totalBorrowed": 75000000,
    "avgCreditTier": 2.5,
    "defaultRate": 0.028,
    "capitalEfficiency": 0.55,
    "protocolIntegrations": 23,
    "zkcMarketCap": 50000000,
    "insuranceFundSize": 5000000,
    "protocolRevenueARR": 2000000,
    "supportedAssets": ["USDC", "USDT", "SOL", "mSOL", "jitoSOL"],
    "chains": ["Solana Mainnet", "Eclipse (Solana L2)"],
    "lastUpdated": "2026-05-29T09:00:00.000Z"
  }
}
```

**Example:**

```bash
curl http://localhost:3000/api/stats
```

---

### GET /api/analytics

Historical analytics data including TVL history, tier distribution, top assets, and interest rate model.

**Response:**

```json
{
  "success": true,
  "data": {
    "tvlHistory": [
      { "month": "2025-07", "tvl": 5000000, "loans": 2000000 },
      { "month": "2025-08", "tvl": 12000000, "loans": 5000000 }
    ],
    "tierDistribution": [
      { "tier": 0, "name": "None", "percentage": 25, "count": 25108 },
      { "tier": 1, "name": "Basic", "percentage": 20, "count": 20086 },
      { "tier": 2, "name": "Good", "percentage": 30, "count": 30130 },
      { "tier": 3, "name": "Excellent", "percentage": 18, "count": 18078 },
      { "tier": 4, "name": "Premium", "percentage": 7, "count": 7030 }
    ],
    "topAssets": [
      { "asset": "USDC", "tvl": 45000000, "borrowVolume": 35000000, "utilization": 77.8 },
      { "asset": "SOL", "tvl": 25000000, "borrowVolume": 15000000, "utilization": 60.0 },
      { "asset": "USDT", "tvl": 15000000, "borrowVolume": 12000000, "utilization": 80.0 },
      { "asset": "mSOL", "tvl": 10000000, "borrowVolume": 8000000, "utilization": 80.0 },
      { "asset": "jitoSOL", "tvl": 5000000, "borrowVolume": 5000000, "utilization": 100.0 }
    ],
    "interestRateModel": {
      "baseRate": 0.02,
      "optimalUtilization": 0.8,
      "slope1": 0.08,
      "slope2": 0.75,
      "tierDiscounts": [0, 0.02, 0.04, 0.06, 0.08]
    }
  }
}
```

**Example:**

```bash
curl http://localhost:3000/api/analytics
```

---

### POST /api/calculate

Calculate loan terms based on amount, credit tier, and duration.

**Request Body:**

```json
{
  "loanAmount": 10000,
  "creditTier": 2,
  "duration": 12
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `loanAmount` | number | Yes | — | Amount to borrow in USD |
| `creditTier` | number (0-4) | No | 2 | Credit tier (0=None, 1=Basic, 2=Good, 3=Excellent, 4=Premium) |
| `duration` | number | No | 12 | Loan duration in months |

**Response:**

```json
{
  "success": true,
  "data": {
    "loanAmount": 10000,
    "creditTier": 2,
    "tierName": "Good",
    "collateralRatio": 0.8,
    "collateralRequired": 8000,
    "standardCollateral": 15000,
    "collateralSavings": 7000,
    "savingsPercent": 46.7,
    "interestRate": 6,
    "monthlyPayment": 860.66,
    "totalPayment": 10327.92,
    "totalInterest": 327.92,
    "duration": 12
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"loanAmount": 10000, "creditTier": 3, "duration": 24}'
```

---

## SDK API

### Installation

```bash
npm install zkcreditscore-sdk
# or
yarn add zkcreditscore-sdk
```

**Peer dependencies:** `@coral-xyz/anchor ^0.30.0`, `@solana/web3.js ^1.98.0`, `@solana/spl-token ^0.4.0`  
**Optional:** `snarkjs ^0.7.0`, `circomlibjs ^0.1.0`

---

### ZKProver

Client-side ZK proof generation class.

```typescript
import { ZKProver } from 'zkcreditscore-sdk';

const prover = new ZKProver();
await prover.init({ circuitsUrl: 'https://ipfs.io/ipfs/Qm...' });
```

**Methods:**

| Method | Signature | Description |
|---|---|---|
| `init` | `(config: ProverConfig) => Promise<void>` | Initialize with circuit configs |
| `connectDataSource` | `(source, config) => Promise<DataConnectionResult>` | Connect a data source (Plaid, AA, PDF upload) |
| `generateProof` | `(claim, options?) => Promise<ZKProof>` | Generate ZK proof for a single claim |
| `generateCompositeProof` | `(claims) => Promise<ZKProof>` | Generate composite proof for multiple claims |
| `estimateProofTime` | `(claim) => Promise<number>` | Estimate proof generation time in ms |
| `dispose` | `() => void` | Clean up resources |

---

### SolanaSDK

Main entry point for Solana program interactions.

```typescript
import { SolanaSDK } from 'zkcreditscore-sdk';

const sdk = SolanaSDK.connect({
  network: 'devnet',
  wallet: phantomWalletAdapter,
});

// Or with a custom provider
const sdk = new SolanaSDK({ provider });
```

**Properties:**

| Property | Type | Description |
|---|---|---|
| `verifier` | `ZKVerifierClient` | zk-credit-verifier program client |
| `lendingPool` | `LendingPoolClient` | zk-lending-pool program client |
| `zkcToken` | `ZKCTokenClient` | zkc-token program client |
| `provider` | `AnchorProvider` | Anchor provider instance |

**Static Methods:**

| Method | Signature | Description |
|---|---|---|
| `connect` | `(config) => SolanaSDK` | Create SDK from wallet + network config |

---

### ZKVerifierClient

Interacts with the `zk-credit-verifier` on-chain program.

```typescript
import { ZKVerifierClient } from 'zkcreditscore-sdk';
```

**Methods:**

| Method | Signature | Description |
|---|---|---|
| `verifyAndIssueCredential` | `(proof, owner?) => Promise<TransactionSignature>` | Verify proof and issue/update SBT credential |
| `hasValidCredential` | `(user, claimType, requiredThreshold?) => Promise<boolean>` | Check if user has valid credential |
| `getCreditTier` | `(user) => Promise<CredentialInfo>` | Get user's credit tier info |
| `revokeCredential` | `(user) => Promise<TransactionSignature>` | Revoke own credential |

---

### LendingPoolClient

Interacts with the `zk-lending-pool` on-chain program.

```typescript
import { LendingPoolClient } from 'zkcreditscore-sdk';
```

**Methods:**

| Method | Signature | Description |
|---|---|---|
| `getCollateralRatio` | `(user, borrowMint) => Promise<{ ratio, maxBorrow }>` | Get user's effective collateral ratio |
| `depositAndBorrow` | `(collateralMint, collateralAmount, borrowMint, borrowAmount) => Promise<TransactionSignature>` | Deposit collateral and borrow |
| `repay` | `(loanId, amount, borrowMint) => Promise<TransactionSignature>` | Repay a loan |
| `liquidate` | `(borrower, collateralMint, borrowMint, loanId, debtToCover) => Promise<TransactionSignature>` | Liquidate an underwater position |
| `getUtilizationRate` | `(asset) => Promise<number>` | Get pool utilization rate |
| `getBorrowRate` | `(asset) => Promise<number>` | Get current borrow APY |

---

### ZKCTokenClient

Interacts with the `zkc-token` on-chain program (ZKCR token + staking).

```typescript
import { ZKCTokenClient } from 'zkcreditscore-sdk';
```

**Methods:**

| Method | Signature | Description |
|---|---|---|
| `initializeToken` | `(authority?) => Promise<TransactionSignature>` | Initialize token mint and config |
| `stakeTokens` | `(amount, user?) => Promise<TransactionSignature>` | Stake ZKCR tokens |
| `unstakeTokens` | `(amount, user?) => Promise<TransactionSignature>` | Unstake ZKCR tokens |
| `claimRewards` | `(user?) => Promise<TransactionSignature>` | Claim staking rewards |
| `getFeeDiscount` | `(user?) => Promise<number>` | Get fee discount percentage (bps) |
| `getStakeInfo` | `(user?) => Promise<StakeAccount | null>` | Get stake account info |

**Properties (PDA helpers):**

| Property | Returns | Description |
|---|---|---|
| `mintPda` | `PublicKey` | ZKCR token mint PDA |
| `configPda` | `PublicKey` | Token config PDA |
| `stakingVaultPda` | `PublicKey` | Staking vault PDA |
| `treasuryAuthorityPda` | `PublicKey` | Treasury authority PDA |

**Methods (PDA helpers):**

| Method | Returns | Description |
|---|---|---|
| `stakeAccountPda(user)` | `PublicKey` | User's stake account PDA |
| `userTokenAccount(user)` | `PublicKey` | User's token account ATA |
| `treasuryAta()` | `PublicKey` | Treasury token account ATA |

---

### ZKCreditAPI

REST API client for protocol data.

```typescript
import { ZKCreditAPI } from 'zkcreditscore-sdk';

const api = new ZKCreditAPI({ baseUrl: 'https://api.zkscore.credit/v1' });
```

**Methods:**

| Method | Signature | Description |
|---|---|---|
| `getStats` | `() => Promise<ProtocolStats>` | Get protocol statistics |
| `getCredential` | `(address) => Promise<CredentialInfo>` | Get credential info for address |
| `getPools` | `() => Promise<LendingPoolInfo[]>` | Get all lending pools |
| `getCircuitInfo` | `(circuitId) => Promise<{...}>` | Get circuit verification key info |
| `getLeaderboard` | `() => Promise<{...}>` | Get aggregated leaderboard data |

---

### ZKCreditIntegrationSDK

Read-only SDK for DeFi protocol integrators.

```typescript
import { ZKCreditIntegrationSDK } from 'zkcreditscore-sdk';

const integration = new ZKCreditIntegrationSDK(solanaSDK);
```

**Methods:**

| Method | Signature | Description |
|---|---|---|
| `hasCredential` | `(userAddress, claimType, threshold?) => Promise<boolean>` | Check if user has valid credential for claim |
| `getCreditTier` | `(userAddress) => Promise<CredentialInfo>` | Get user's credit tier |
| `getRecommendedLTV` | `(userAddress, loanMint, loanAmount) => Promise<RecommendedLTV>` | Get recommended LTV ratio |
| `getVerifierInterface` | `() => string` | Get JSON ABI of verifier interface |
| `getVerifierAddress` | `() => string` | Get verifier program ID |

---

### Utility Functions

```typescript
import {
  deriveCredentialPda,
  deriveLoanPda,
  deriveNullifierPda,
  deriveLendingPoolPda,
  deriveVaultPda,
  deriveConfigPda,
  toBasisPoints,
  fromBasisPoints,
  lamportsToSol,
  solToLamports,
} from 'zkcreditscore-sdk';
```

| Function | Signature | Description |
|---|---|---|
| `deriveCredentialPda` | `(owner) => [PublicKey, number]` | Derive credential account PDA |
| `deriveLoanPda` | `(borrower, loanId) => [PublicKey, number]` | Derive loan account PDA |
| `deriveNullifierPda` | `(nullifier) => [PublicKey, number]` | Derive nullifier account PDA |
| `deriveLendingPoolPda` | `(mint) => [PublicKey, number]` | Derive lending pool PDA |
| `deriveVaultPda` | `(mint) => [PublicKey, number]` | Derive vault PDA |
| `deriveConfigPda` | `() => [PublicKey, number]` | Derive config PDA |
| `toBasisPoints` | `(percentage) => number` | Convert percentage to basis points |
| `fromBasisPoints` | `(basisPoints) => number` | Convert basis points to percentage |
| `lamportsToSol` | `(lamports) => number` | Convert lamports to SOL |
| `solToLamports` | `(sol) => number` | Convert SOL to lamports |

---

## Types

### Enums

```typescript
enum ClaimType {
  CREDIT_SCORE_ABOVE = 0,
  MONTHLY_INCOME_ABOVE = 1,
  DTI_BELOW = 2,
  NO_DEFAULT_LAST_N_YEARS = 3,
  EMPLOYMENT_STATUS = 4,
  COMPOSITE_TIER = 5,
}

enum CreditTier {
  None = 0,
  Basic = 1,
  Good = 2,
  Excellent = 3,
  Premium = 4,
}

enum EmploymentStatus {
  Employed = 0,
  SelfEmployed = 1,
  BusinessOwner = 2,
}
```

### Core Interfaces

```typescript
interface ZKProof {
  proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
    protocol: 'groth16';
    curve: 'bn128';
  };
  publicSignals: {
    addressCommitment: string;
    claimType: number;
    threshold: string;
    nullifier: string;
    expiryTimestamp: string;
    circuitVersion: string;
  };
  metadata: {
    generatedAt: number;
    circuitId: string;
    proverVersion: string;
  };
}

interface ClaimRequest {
  type: ClaimType;
  threshold: number;
  dataSourceId: string;
}

interface CreditCredential {
  tokenId: string;
  owner: string;
  credentialHash: string;
  creditTier: CreditTier;
  claimsBitmap: number;
  issuedAt: number;
  expiresAt: number;
  issuer: string;
}

interface LoanRecord {
  loanId: string;
  borrower: string;
  collateral: { mint: string; amount: string; valueUsd: string };
  borrowed: { mint: string; amount: string; interestRate: number };
  terms: {
    collateralRatio: number;
    liquidationThreshold: number;
    creditTierAtIssuance: CreditTier;
    maturityTimestamp: number;
  };
  status: 'active' | 'repaid' | 'liquidated';
  repaidAmount: string;
  createdAt: number;
  lastUpdateAt: number;
}

interface ProtocolStats {
  totalCredentials: number;
  activeLoans: number;
  totalTvlUsd: string;
  averageCreditTier: number;
  loanOriginationVolume: string;
  defaultRate: number;
}

interface CredentialInfo {
  tier: CreditTier;
  expiresAt: Date;
  claims: ClaimType[];
  isValid: boolean;
}

interface RecommendedLTV {
  ltvRatio: number;
  maxLoanAmount: string;
  interestRateModifier: number;
}

interface LendingPoolInfo {
  mint: string;
  symbol: string;
  totalDeposits: string;
  totalBorrows: string;
  utilizationRate: number;
  borrowApy: number;
  supplyApy: number;
  baseRate: number;
}

interface StakeAccount {
  owner: string;
  amount: string;
  stakedAt: number;
  pendingRewards: string;
}
```

---

## Constants

```typescript
import {
  SOLANA_PROGRAM_ID,
  CREDIT_TIERS,
  TIER_DISCOUNTS,
  CLAIM_TYPE_LABELS,
  DEFAULT_LENDING_POOLS,
  KINK_MODEL,
  CREDENTIAL_EXPIRY_DEFAULT,
  CREDENTIAL_RENEWAL_NOTICE,
  LIQUIDATION_THRESHOLD_OFFSET,
  LIQUIDATION_BONUS,
  ZKC_DECIMALS,
  ZKC_MIN_STAKE,
  STAKING_REWARD_RATE_BPS,
  FEE_DISCOUNT_TIERS,
  NETWORK_URLS,
  ACCOUNT_SEEDS,
} from 'zkcreditscore-sdk';
```

| Constant | Type | Description |
|---|---|---|
| `SOLANA_PROGRAM_ID` | `{ verifier, lendingPool, zkcToken, governance }` | All 4 program IDs |
| `CREDIT_TIERS` | `Record<CreditTier, TierConfig>` | Full tier configurations |
| `TIER_DISCOUNTS` | `Record<CreditTier, number>` | Interest rate discounts per tier (bps) |
| `CLAIM_TYPE_LABELS` | `Record<ClaimType, string>` | Human-readable claim names |
| `DEFAULT_LENDING_POOLS` | `LendingPoolInfo[]` | USDC, USDT, SOL pools |
| `KINK_MODEL` | `{ baseRate, optimalUtilization, slope1, slope2, minRate }` | Kink interest rate model params (bps) |
| `CREDENTIAL_EXPIRY_DEFAULT` | `number` | 30 days in seconds |
| `CREDENTIAL_RENEWAL_NOTICE` | `number` | 7 days in seconds |
| `LIQUIDATION_THRESHOLD_OFFSET` | `number` | 500 bps below collateral ratio |
| `LIQUIDATION_BONUS` | `number` | 500 bps bonus for liquidators |
| `ZKC_DECIMALS` | `number` | 9 |
| `ZKC_MIN_STAKE` | `number` | 1,000 ZKCR (in lamports) |
| `STAKING_REWARD_RATE_BPS` | `number` | 500 bps annually |
| `FEE_DISCOUNT_TIERS` | `{ minStake, discount }[]` | 5 tiers up to 30% discount |
| `NETWORK_URLS` | `Record<string, string>` | mainnet-beta, devnet, localnet RPC URLs |
| `ACCOUNT_SEEDS` | `Record<string, string>` | PDA seed strings |
