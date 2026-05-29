# ZKCreditScore Protocol — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER LAYER                                    │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │  Plaid /     │  │  Client-Side │  │  snarkjs WASM                │   │
│  │  CIBIL /     │──►  Data Parser  │──►  ZK Prover                  │   │
│  │  Account     │  │ (Local only) │  │  (Groth16, BN128)            │   │
│  │  Aggregator  │  └──────────────┘  └───────────┬──────────────────┘   │
│  └──────────────┘                                 │                      │
│                                                   │ ZK Proof             │
│                                                   ▼                      │
│                                          ┌──────────────────┐           │
│                                          │  Phantom Wallet   │           │
│                                          │  (Solana Tx)      │           │
│                                          └────────┬─────────┘           │
└──────────────────────────────────────────┬────────┼─────────────────────┘
                                           │        │
                                           ▼        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BLOCKCHAIN LAYER (Solana)                       │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  zk-credit-verifier   │  │ zk-lending-pool  │  │  zkc-token       │  │
│  │  • Verify ZK proof    │  │ • Deposit        │  │  • Staking       │  │
│  │  • Issue/Revoke SBT   │◄─►│ • Borrow         │  │  • Rewards       │  │
│  │  • Nullifier mgmt     │  │ • Repay          │  │  • Fee discounts │  │
│  └──────────────────────┘  │ • Liquidate      │  └────────┬─────────┘  │
│                            └──────────────────┘           │              │
│  ┌──────────────────────┐                                 │              │
│  │  zk-governance       │◄────────────────────────────────┘              │
│  │  • Proposals         │                                               │
│  │  • Stake-weighted    │                                               │
│  │    voting            │                                               │
│  │  • Timelock exec     │                                               │
│  └──────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA CONNECTOR LAYER                             │
│                                                                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Plaid     │  │  CIBIL     │  │  Account     │  │  zkTLS         │  │
│  │  (US/EU)   │  │  (Global)  │  │  Aggregator  │  │  (Reclaim     │  │
│  │            │  │            │  │  (India)     │  │   Protocol)   │  │
│  └────────────┘  └────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Architecture

### 1. User Layer

The user layer runs entirely on the client device. It consists of:

- **Data Connectors** — Fetch financial data from Plaid (US/EU), CIBIL/Equifax (global), or Account Aggregators (India) via OAuth. Data stays local and is never uploaded to any server.
- **Data Parser** — Normalizes raw financial data (bank statements, credit reports, income proofs) into a standardized schema suitable for ZK circuit inputs.
- **ZK Prover** — Runs Circom-compiled circuits via snarkjs WASM. Generates Groth16 proofs on the BN128 curve. Targets <30 seconds on mid-range devices with optional WebGPU acceleration and TEE fallback.
- **Phantom Wallet** — Signs and submits the ZK proof transaction to Solana.

### 2. Blockchain Layer

Four Anchor Framework programs deployed on Solana:

| Program | Program ID | Purpose |
|---|---|---|
| `zk-credit-verifier` | `9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh` | ZK proof verification, SBT credential issuance/revocation, nullifier management |
| `zk-lending-pool` | `HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo` | Deposit, borrow, repay, liquidate with tier-based collateral ratios |
| `zkc-token` | `4A1AR7H5VHQzwM7QuucYDHKTrQWt9HQ1GyEB4gh4pump` | ZKCR token (SPL Token 2022), staking, rewards, fee discounts |
| `zk-governance` | `4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT` | DAO proposals, stake-weighted voting, timelock execution |

### 3. Data Connector Layer

- **Plaid (US/EU)** — Open banking API for transaction and income data
- **CIBIL / Equifax** — Credit bureau score fetch via OAuth
- **Account Aggregator (India)** — Sahamati AA framework for bank data (RBI-compliant)
- **zkTLS (Reclaim Protocol)** — Trusted attestation for real-time income verification

---

## Smart Contracts

### zk-credit-verifier

Core ZK proof verification and credential management.

**Accounts:**

| Account | Seeds | Description |
|---|---|---|
| `Credential` | `["credential", owner]` | Stores credit tier, claim type, threshold, expiry, issuer, revocation status |
| `Nullifier` | `["nullifier", nullifier_bytes]` | Prevents proof replay — marks used nullifiers |
| `VerifierConfig` | `["config"]` | Authority, min/max proof expiry, supported claim types, pause flag |

**Instructions:**

| Instruction | Description |
|---|---|
| `verify_and_issue_credential` | Verifies Groth16 proof, checks nullifier, calculates credit tier, mints/updates SBT credential |
| `has_valid_credential` | Read-only check: is credential valid and not revoked and not expired |
| `revoke_credential` | Owner revokes their own credential (sets `is_revoked = true`) |
| `update_config` | Authority-only: update protocol parameters |

**Events:** `CredentialIssued`, `CredentialRevoked`, `NullifierUsed`, `ConfigUpdated`

### zk-lending-pool

Lending/borrowing protocol with tier-based collateral ratios.

**Accounts:**

| Account | Seeds | Description |
|---|---|---|
| `LendingPool` | `["lending-pool", mint]` | Pool config: total deposits/borrows, kink rate parameters, pause state |
| `Loan` | `["loan", borrower, loan_id]` | Individual loan position: amounts, rates, collateral ratio, status |
| `Vault` | `["vault", mint]` | Token vault for pool deposits |

**Interest Rate Model (Kink):**

- Base rate: 2% APR
- Optimal utilization: 80%
- Slope 1 (below optimal): 8% APR
- Slope 2 (above optimal): 75% APR
- Credit tier modifier: Tier 0: +0%, Tier 1: -2%, Tier 2: -4%, Tier 3: -6%, Tier 4: -8%

**Collateral Ratios by Tier:**

| Tier | Collateral Ratio | Max Loan |
|---|---|---|
| 0 (None) | 150% | $50,000 |
| 1 (Basic) | 110% | $100,000 |
| 2 (Good) | 80% | $250,000 |
| 3 (Excellent) | 60% | $500,000 |
| 4 (Premium) | 50% | $1,000,000 |

**Instructions:**

| Instruction | Description |
|---|---|
| `initialize_pool` | Create a new lending pool for an SPL token |
| `deposit_and_borrow` | Lock collateral via SPL Token transfer, disburse loan |
| `repay` | Repay partial or full loan |
| `liquidate` | Liquidate underwater positions (5% below required collateral ratio) |
| `update_pool_config` | Admin: update kink model parameters |

### zkc-token

ZKCR governance and utility token (SPL Token 2022 standard).

**Tokenomics:**

- Total supply: 1,000,000,000 ZKCR
- Minimum stake: 1,000 ZKCR
- Reward rate: 500 bps annually
- Fee discounts: Up to 30% based on stake amount

**Instructions:**

| Instruction | Description |
|---|---|
| `initialize_token` | Initialize token mint, config, and treasury |
| `stake_tokens` | Stake ZKCR tokens to earn rewards and fee discounts |
| `unstake_tokens` | Unstake ZKCR tokens |
| `claim_rewards` | Claim accumulated staking rewards |
| `get_fee_discount` | View fee discount percentage based on stake |

**Allocation:**

| Category | Percentage | Amount |
|---|---|---|
| Protocol Treasury | 30% | 300,000,000 ZKCR |
| Team & Advisors (1yr cliff, 3yr linear) | 20% | 200,000,000 ZKCR |
| Ecosystem / Grants | 20% | 200,000,000 ZKCR |
| Community Sale / IDO | 15% | 150,000,000 ZKCR |
| Liquidity Provision | 10% | 100,000,000 ZKCR |
| Security Council | 5% | 50,000,000 ZKCR |

### zk-governance

On-chain DAO with stake-weighted voting.

**Parameters:**

- Min voting period: 1 day
- Max voting period: 7 days
- Timelock: 48 hours (6 hours for emergency)
- Quorum: 10% of staked supply
- Min stake to propose: 10,000 ZKCR

**Instructions:**

| Instruction | Description |
|---|---|
| `initialize` | Initialize governance state |
| `create_proposal` | Create a new proposal with executable instructions |
| `cast_vote` | Vote on an active proposal (stake-weighted) |
| `queue_proposal` | Queue passed proposal for timelock execution |
| `execute_proposal` | Execute queued proposal after timelock |

---

## ZK Circuits

All circuits use **Groth16 proving system** on the **BN128 curve** (compatible with Solana's alt_bn128 precompile). Client-side proof generation via snarkjs WASM.

| Circuit | File | What It Proves |
|---|---|---|
| **Credit Score** | `credit_score_above.circom` | Credit score >= threshold (range: 300-900, data freshness <90 days) |
| **Income** | `income_above.circom` | Monthly income >= threshold (3-month average stability check) |
| **Debt-to-Income** | `dti_below.circom` | DTI ratio below threshold |
| **No Default** | `no_default.circom` | No defaults in N years |
| **Composite** | `composite_credit_score.circom` | Weighted scoring -> Tier 0-4 (40% score + 30% income + 20% DTI + 10% history) |

### Circuit Constraints

Each circuit enforces:
1. **Range validation** — Input values are within valid bounds
2. **Freshness check** — Data source timestamp within 90 days
3. **User commitment** — Poseidon hash matches the user's Solana address
4. **Nullifier derivation** — Deterministic from private inputs to prevent replay

---

## Data Flow

### Proof Generation -> On-Chain Verification -> Lending

```
Step 1: Data Ingestion
  User consents -> Data connector API call -> Raw data fetched to local device
  (Bank statements, credit score, income data)

Step 2: Data Parsing & Normalization
  Raw data -> Standardized schema -> Numerical encoding
  (Text fields converted to field elements for ZK circuit)

Step 3: ZK Circuit Execution (Client-Side WASM)
  Normalized data + Claim parameters -> Circom circuit -> Witness generation
  Witness -> Groth16 prover (snarkjs) -> (pi_A, pi_B, pi_C, public_inputs)

Step 4: On-Chain Submission
  ZK Proof + Public Inputs -> zk-credit-verifier -> Proof verification
  Verification pass -> Nullifier marked used -> SBT credential minted/updated

Step 5: Lending Interaction
  User wallet + SBT -> zk-lending-pool -> Collateral ratio lookup
  -> Loan disbursement at reduced collateral ratio
```

---

## SDK Architecture

The `zkcreditscore-sdk` package is organized into independent modules:

```
packages/sdk/src/
├── index.ts              # Re-exports all public APIs
├── prover/
│   └── index.ts          # ZKProver — client-side proof generation
├── solana/
│   ├── index.ts          # SolanaSDK — Anchor provider and program clients
│   ├── utils.ts          # PDA derivation helpers, unit conversions
│   └── programs/
│       ├── verifier.ts   # ZKVerifierClient
│       ├── lendingPool.ts# LendingPoolClient
│       └── token.ts      # ZKCTokenClient
├── api/
│   └── index.ts          # ZKCreditAPI — REST API client
├── integration/
│   └── index.ts          # ZKCreditIntegrationSDK — DeFi protocol integration
├── connectors/
│   └── plaid.ts          # PlaidConnector — Plaid data source
├── types/
│   └── index.ts          # All TypeScript types and enums
└── constants/
    └── index.ts          # Program IDs, tier configs, network URLs
```

### Module Interaction Diagram

```
Frontend App
     │
     ├── ZKProver ——> Generates ZKProof
     │                     │
     │                     ▼
     ├── SolanaSDK  ──> ZKVerifierClient  ──> On-chain credential
     │       │         LendingPoolClient  ──> Loan operations
     │       │         ZKCTokenClient     ──> Staking operations
     │       │
     ├── ZKCreditAPI ──> REST API (protocol stats, analytics)
     │
     └── ZKCreditIntegrationSDK ──> Read-only checks for other DeFi protocols
```

---

## Security Considerations

### Nullifier Mechanism

Each ZK proof includes a deterministic nullifier derived from the user's private inputs (Poseidon hash of credit score, timestamp, and user commitment). On verification, the nullifier PDA is created and marked as `used = true`. Any attempt to reuse the same proof will fail because the nullifier PDA already exists. This prevents double-spending of credentials.

### Proof Expiry

Credential SBTs have a configurable expiry period (default: 30 days). Expired credentials cannot be used for loans. Users receive renewal notifications 7 days before expiry.

### Upgrade Authority

All Anchor programs use BPF upgradeable program architecture. The upgrade authority is a 3/5 multisig with a 48-hour timelock for non-emergency upgrades. Protocol parameter changes (collateral ratios, interest rates) go through governance.

### Emergency Controls

- **Pause flag** — Each lending pool has an emergency pause that halts borrowing/liquidations
- **Circuit breaker** — If oracle price drops >25% in 1 hour, automatic pause
- **Security council** — Multisig (5/9) can veto malicious governance proposals within 24 hours
