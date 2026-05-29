# ZKCreditScore Protocol — Features

---

## ZK Proof Generation

### How It Works

ZK proof generation is the core innovation of the protocol. Users prove their creditworthiness without revealing any underlying data.

**Process:**

1. **Connect Data Source** — User connects a financial data source: Plaid (US/EU), CIBIL/Equifax (global credit bureau), Account Aggregator (India), or upload bank statement PDFs. Data fetching happens locally on the user's device.

2. **Select Claims** — User chooses which claims to prove. Claims are boolean statements about their financial data, e.g., "My credit score is above 700" or "My monthly income is above $3,000."

3. **Proof Generation** — The Circom circuit processes the raw financial data (kept entirely on-device) and generates a Groth16 ZK proof using snarkjs WASM. Target: <30 seconds on mid-range devices.

4. **On-Chain Submission** — The proof (typically <5KB) is submitted to the zk-credit-verifier Solana program via the user's Phantom wallet. The program verifies the proof and mints a Soulbound Token (SBT) credential.

5. **Zero Data Exposure** — No financial data ever leaves the user's device. The protocol only sees the ZK proof and public inputs (address commitment, claim type, threshold, nullifier, expiry).

### Supported Claim Types

| Claim Type | What It Proves | Threshold Range | Circuit |
|---|---|---|---|
| `CREDIT_SCORE_ABOVE` | Credit score >= threshold | 300-900 | `credit_score_above.circom` |
| `MONTHLY_INCOME_ABOVE` | Monthly income >= threshold (3-month avg) | Any | `income_above.circom` |
| `DTI_BELOW` | Debt-to-income ratio below threshold | 0-100% | `dti_below.circom` |
| `NO_DEFAULT_LAST_N_YEARS` | No defaults in N years | 1-10 years | `no_default.circom` |
| `COMPOSITE_TIER` | Weighted composite score (all claims) | 0-4 tier | `composite_credit_score.circom` |

### Proof Properties

- **Proving system:** Groth16 (BN128 curve, Solana alt_bn128 compatible)
- **Proof size:** <5KB
- **Generation time:** <30 seconds (mid-range device)
- **Expiry:** 30 days default (configurable)
- **Anti-replay:** Nullifier mechanism prevents proof reuse

---

## Credit Tiers

### Tier Overview

Users are assigned a credit tier based on their verified ZK claims. Higher tiers unlock lower collateral ratios and better interest rates.

| Tier | Name | Collateral Ratio | Max Loan | Interest Discount | Required Claims |
|---|---|---|---|---|---|
| 0 | None | 150% | $50,000 | 0% | None (standard DeFi) |
| 1 | Basic | 110% | $100,000 | 2% | Credit score > 650 |
| 2 | Good | 80% | $250,000 | 4% | Score > 700 + income proof |
| 3 | Excellent | 60% | $500,000 | 6% | Score > 750 + income + DTI < 30% |
| 4 | Premium | 50% | $1,000,000 | 8% | All claims + multi-source verification |

### Tier Benefits

- **Capital Efficiency:** Tier 4 (Premium) users need only $500 collateral to borrow $1,000, compared to $1,500 for standard DeFi — a 66.7% reduction.
- **Interest Savings:** Premium users get 8% APR discount on borrowing rates.
- **Higher Loan Limits:** Each tier progressively increases maximum loan amounts.

### Tier Calculation

The composite circuit calculates tier using a weighted formula:
- Credit score: 40%
- Income verification: 30%
- DTI ratio: 20%
- Credit history (no defaults): 10%

---

## Lending Protocol

### Deposit

Users supply liquidity to lending pools to earn interest.

- Supported assets: USDC, USDT, SOL, mSOL, jitoSOL
- Supply APY determined by pool utilization (kink model)
- Deposits are always withdrawable (subject to pool liquidity)
- Depositors earn 80% of borrow interest (20% protocol fee)

### Borrow

Users borrow against collateral with tier-adjusted ratios.

**Flow:**

1. User connects wallet with valid SBT credential
2. Protocol reads credit tier and displays personalized rates
3. User selects collateral asset and borrow amount
4. User approves collateral (SPL Token approve)
5. Transaction deposits collateral to vault and disburses loan

**Borrow Parameters:**

| Parameter | Standard DeFi | ZKCreditScore (Tier 4) |
|---|---|---|
| Collateral required for $1,000 | $1,500 | $500 |
| Interest rate (base) | 10% APR | 2% APR (base - 8%) |
| Liquidation threshold | 150% collateral ratio | 55% collateral ratio |
| Liquidation bonus | 10% | 5% |

### Repay

- Repay any amount (partial or full) at any time
- Interest accrues continuously based on borrow rate
- No penalty for early repayment

### Liquidate

- Liquidation triggers when collateral ratio falls 5% below the required ratio
- Lower liquidation threshold than standard DeFi (because credit reduces risk)
- Liquidation bonus: 5% (lower than industry standard 10%)
- Anyone can trigger liquidation and earn the bonus

### Interest Rate Model (Kink)

```
Borrow Rate = Base Rate + (Utilization / Optimal) * Slope1   (if utilization <= optimal)
Borrow Rate = Base Rate + Slope1 + Excess * Slope2           (if utilization > optimal)

Where:
  Base Rate = 2%
  Optimal Utilization = 80%
  Slope1 = 8%
  Slope2 = 75%
  Tier Discount applied after kink calculation
```

---

## Token Staking

### ZKCR Token

- **Token:** ZKCR (ZKCredit)
- **Standard:** SPL Token 2022
- **Total Supply:** 1,000,000,000 ZKCR
- **Decimals:** 9

### Staking

Users stake ZKCR tokens to earn rewards and unlock fee discounts.

**Staking Parameters:**

| Parameter | Value |
|---|---|
| Minimum stake | 1,000 ZKCR |
| Reward rate | 500 bps annually |
| Reward source | 40% of protocol revenue |

### Fee Discount Tiers

| Min Stake (ZKCR) | Fee Discount |
|---|---|
| 0 | 0% |
| 10,000 | 10% |
| 100,000 | 20% |
| 500,000 | 25% |
| 1,000,000 | 30% |

### Staking Operations

- **Stake:** Lock ZKCR tokens to staking vault — rewards begin accruing immediately
- **Unstake:** Unlock tokens — rewards stop accruing
- **Claim Rewards:** Claim accumulated rewards at any time — rewards come from protocol revenue share

### Utility

- **Fee Discounts:** Up to 30% discount on protocol fees based on stake amount
- **Governance:** Staked ZKCR confers voting power (1 ZKCR = 1 vote)
- **Proof Subsidies:** Staked users may qualify for gas fee subsidies on proof submission
- **Credential Boost:** Using ZKCR as collateral can provide a credit tier boost

---

## Governance

### Overview

The zk-governance program enables decentralized decision-making for protocol parameters. Governance is stake-weighted: voting power is proportional to ZKCR staked.

### Parameters

| Parameter | Value |
|---|---|
| Min voting period | 1 day |
| Max voting period | 7 days |
| Timelock | 48 hours |
| Emergency timelock | 6 hours |
| Quorum | 10% of staked supply |
| Min stake to propose | 10,000 ZKCR |

### Proposals

Anyone holding at least 10,000 staked ZKCR can create a proposal. Proposals contain executable instructions that will run on-chain if passed.

**Governable Parameters:**

- Collateral ratios per tier
- Supported lending assets
- Interest rate model parameters (base rate, slopes, optimal utilization)
- Data connector configurations
- Credential expiry duration
- Fee structure

### Voting

- Vote weight = staked ZKCR amount at proposal creation time
- Voting options: For, Against, Abstain
- Vote can be changed during voting period
- Quorum: at least 10% of total staked supply must vote

### Timelock

After a proposal passes:
1. **Queue period** — Proposal enters queue
2. **Timelock** — 48 hour waiting period (6 hours for emergency proposals flagged by security council)
3. **Execution** — Anyone can execute the queued proposal to run its instructions

### Security Council

A 5/9 multisig can veto malicious proposals within 24 hours of passage. Council members are elected through governance.

---

## Integration SDK

### For DeFi Protocols

The `ZKCreditIntegrationSDK` allows other DeFi protocols to read ZK credit credentials without any data handling or privacy exposure.

**How Integrators Use It:**

```typescript
import { SolanaSDK, ZKCreditIntegrationSDK } from 'zkcreditscore-sdk';

const solana = SolanaSDK.connect({ network: 'devnet', wallet });
const integration = new ZKCreditIntegrationSDK(solana);

// Check if a user has a valid credential
const hasCred = await integration.hasCredential(
  userAddress,
  ClaimType.CREDIT_SCORE_ABOVE,
  700
);

// Get credit tier and expiry
const tierInfo = await integration.getCreditTier(userAddress);

// Get recommended LTV for lending decisions
const ltv = await integration.getRecommendedLTV(
  userAddress,
  loanMint,
  loanAmount
);
```

### Integration Use Cases

- **Lending Protocols** — Offer better rates to users with verified credit
- **Yield Protocols** — Adjust yields based on user creditworthiness
- **Insurance Protocols** — Adjust premiums for users with proven credit history
- **Stablecoin Protocols** — Adjust minting ratios for creditworthy users

### PlaidConnector

For applications needing direct data source integration:

```typescript
import { PlaidConnector } from 'zkcreditscore-sdk';

const plaid = new PlaidConnector();
await plaid.connect({
  clientId: 'your-plaid-client-id',
  secret: 'your-plaid-secret',
  environment: 'sandbox',
});

const income = await plaid.getIncome();
const score = await plaid.getCreditScore();
const transactions = await plaid.getTransactions(90);
```
