# ZKCreditScore Protocol
## Product Requirements Document (PRD) v1.0

**Document Status:** Draft  
**Version:** 1.0  
**Date:** May 2026  
**Author:** Product Team  
**Classification:** Internal — Confidential

---

## Table of Contents

1. Executive Summary
2. Problem Statement
3. Market Opportunity
4. Product Vision & Goals
5. User Personas
6. Core Features & Requirements
7. Technical Architecture
8. ZK Circuit Design
9. Smart Contract Specifications
10. Data Models
11. User Flows
12. API Specifications
13. Tokenomics
14. Risk Framework
15. Compliance & Legal
16. Roadmap & Milestones
17. Success Metrics
18. Open Questions

---

## 1. Executive Summary

**ZKCreditScore** ek privacy-preserving, decentralized lending protocol hai jo Zero-Knowledge Proofs (ZKP) ka use karta hai taaki borrowers apni real-world creditworthiness prove kar sakein — bina koi sensitive financial data on-chain ya protocol ke paas share kiye.

Aaj ke DeFi lending protocols (Aave, Compound, MakerDAO) sirf overcollateralized loans dete hain — borrower ko 125–200% collateral deposit karna padta hai. Yeh model speculative use cases ke liye kaam karta hai, lekin productive credit (business loans, salary advances, consumer credit) ke liye bilkul kaam nahi karta. Real-world credit system ka $10.3 trillion underserved market DeFi se bahar hai sirf iss ek problem ki wajah se.

ZKCreditScore is gap ko bharta hai by allowing users to:
- Off-chain financial data (bank statements, credit bureau scores, income proof) se ZK proof generate karna
- Protocol ko sirf boolean claims prove karna: "Mera credit score 700+ hai", "Meri monthly income $3000+ hai"
- Under-collateralized loans lena (50–80% collateral ratio) competitive interest rates pe

---

## 2. Problem Statement

### 2.1 The Overcollateralization Trap

DeFi lending ka fundamental limitation yeh hai ki blockchain addresses pseudonymous hain. Koi bhi credit history track nahi hoti. Ek borrower loan le ke default kar sakta hai aur naya wallet bana ke wapas aa sakta hai — koi consequence nahi. Isi wajah se sabhi DeFi protocols overcollateralization pe depend karte hain.

**Consequence:**
- Borrower ko $1000 loan ke liye $1500–$2000 collateral lock karna padta hai
- Capital highly inefficient hai — locked collateral productive use mein nahi aa sakta
- Retail users aur small businesses DeFi lending access nahi kar sakte
- DeFi lending purely speculative/leveraged trading use case tak limited hai

### 2.2 Existing Solutions aur Unke Limitations

| Protocol | Approach | Problem |
|---|---|---|
| Aave/Compound | Pure overcollateralization | 125–200% collateral, no credit scoring |
| Maple Finance | Institutional whitelist | KYC required, not permissionless, centralized risk assessment |
| TrueFi | Reputation-based | Small pool, whale-dominated governance, opaque scoring |
| Goldfinch | Real-world underwriters | Centralized auditors, slow, not scalable |
| Spectral Finance | On-chain credit score | Wallet activity only, no off-chain data, gameable |

**Core gap:** Koi bhi protocol off-chain financial data ko privacy-preservingly DeFi mein integrate nahi kar paya. Ya toh privacy sacrifice hoti hai (KYC data share karo), ya effectiveness sacrifice hoti hai (sirf on-chain data use karo).

### 2.3 The ZK Opportunity

Zero-Knowledge Proofs pehli baar iss problem ko technically solve karne ka zariya dete hain:

- User apna bank data, credit report, ya income proof locally process karta hai
- ZK circuit ek cryptographic proof generate karta hai jo specific claims verify karta hai
- Protocol sirf proof verify karta hai — actual data kabhi on-chain ya protocol server pe nahi jaata
- Privacy-preserving + verifiable dono simultaneously possible ho jaata hai

---

## 3. Market Opportunity

### 3.1 DeFi Lending Market (2025–2026 Data)

- DeFi Total TVL: ~$89 billion (2025)
- DeFi Lending TVL: ~$38 billion (43% of total TVL)
- Aave alone: ~$17 billion TVL (April 2026)
- Global DeFi lending users: 7.8 million+ (26% YoY growth)
- Borrowers requiring 125–200% collateral: ~100% of current DeFi loan book

### 3.2 Addressable Market

**TAM (Total Addressable Market):**  
Global consumer + SME credit market: ~$10.3 trillion annually. Even 0.1% capture = $10.3 billion loan volume.

**SAM (Serviceable Addressable Market):**  
Crypto-native users with verifiable off-chain income/credit history willing to use DeFi: estimated 15–20 million users globally by 2027.

**SOM (Serviceable Obtainable Market — Year 1–2):**  
$500M–$1B in loan origination if successful protocol launch, based on comparable protocols (Maple Finance hit $1.7B cumulative in first 18 months).

### 3.3 ZK-KYC Market Growth

ZK-KYC market specifically: $83.6M (2025) → $903.5M (2032) at 40.5% CAGR (Stratistics MRC). Credit scoring is a key vertical within this.

### 3.4 Competitive Positioning

ZKCreditScore first-mover advantage:
- No existing protocol combines off-chain credit data + ZK privacy + permissionless DeFi lending
- Closest competitor (Stormbit Finance via zkTLS) is early-stage, B2B focused
- Academic research validates approach (arxiv.org/pdf/2510.09715 — DeFi credit scoring via ZKPs)

---

## 4. Product Vision & Goals

### 4.1 Vision Statement

> "DeFi mein pehli baar real credit milega — bina privacy sacrifice kiye, bina permission maange."

### 4.2 Product Goals

**Goal 1 — Capital Efficiency:**  
Borrowers ko under-collateralized loans dena (50–80% LTV) based on verifiable off-chain creditworthiness.

**Goal 2 — Privacy First:**  
Koi bhi actual financial document, score, ya data on-chain ya protocol servers pe store na ho kabhi.

**Goal 3 — Permissionless Access:**  
Koi central whitelist nahi. Koi human reviewer nahi. Pure smart contract + ZK proof se loan approval.

**Goal 4 — Composability:**  
ZK credit credential doosre DeFi protocols (Aave, Uniswap, etc.) ke saath integrate ho sake — ek baar prove, sabh jagah use.

**Goal 5 — Regulatory Compatibility:**  
FATF, GDPR, India DPDP Act ke saath compliant design. Regulators bhi satisfy, users bhi.

### 4.3 Non-Goals (v1.0)

- Cross-chain credit aggregation (v2 feature)
- AI-based dynamic credit modeling (v3 feature)
- Fiat on/off ramp integration (partner dependency)
- NFT collateral support (separate module)

---

## 5. User Personas

### Persona 1: Alex — The Crypto-Native Professional
- **Background:** 28 years old, software engineer, New York. Monthly income $5,000. Has crypto portfolio worth $8,000. Has credit score 750.
- **Problem:** Needs $3,000 short-term loan for laptop + equipment. DeFi pe $4,500 collateral lock karna padega. TradFi bank mein process slow hai.
- **Goal:** Under-collateralized DeFi loan using income proof.
- **ZKCreditScore Use:** Income ZK proof generate karta hai DigiLocker se. 60% LTV pe $3,000 USDC borrow karta hai sirf $1,800 collateral pe.

### Persona 2: Maria — The Small Business Owner
- **Background:** 34 years old, boutique owner, London. Business generating $15,000 monthly revenue. Tax returns available. Needs working capital.
- **Problem:** Banks se collateral-heavy loan milta hai, process slow. DeFi protocols overcollateralized hain.
- **Goal:** Working capital loan against business revenue proof.
- **ZKCreditScore Use:** Business revenue ZK proof generate karti hai. Credit line milti hai monthly revenue ke 2x.

### Persona 3: Carlos — The DeFi Power User  
- **Background:** 26 years old, crypto trader, São Paulo. Strong on-chain history. No traditional credit history (never took bank loan).
- **Problem:** On-chain credit score protocols sirf wallet activity dekhte hain. Gameable hai.
- **Goal:** Composite score from on-chain + off-chain data combined.
- **ZKCreditScore Use:** On-chain activity + Coinbase verification + exchange KYC data combine karke ZK proof banata hai.

### Persona 4: Protocol Integrator — The DeFi Builder
- **Background:** Team building a new DeFi yield protocol. Want to offer better rates to creditworthy users.
- **Goal:** Plug-and-play ZK credit verification into existing smart contracts.
- **ZKCreditScore Use:** ZK Verifier SDK integrate karta hai. Users ka ZKCreditScore verified credential check karta hai bina any data handling ke.

---

## 6. Core Features & Requirements

### 6.1 Feature: ZK Proof Generation Module

**Priority:** P0 (Must have — v1.0)

**Description:** Client-side application jisme user apna financial data import karta hai aur ZK proof generate karta hai.

**Requirements:**
- FR-001: User bank statement upload kare (PDF format) ya API se connect kare (Account Aggregator — India)
- FR-002: Credit bureau score fetch kare (CIBIL, Equifax API via OAuth)
- FR-003: Supported claim types v1.0:
  - `CREDIT_SCORE_ABOVE_X` (e.g., score > 650, > 700, > 750)
  - `MONTHLY_INCOME_ABOVE_X` (e.g., income > $1000, > $2000, > $5000)
  - `DEBT_TO_INCOME_BELOW_X` (e.g., DTI < 40%, < 30%)
  - `NO_DEFAULT_LAST_N_YEARS` (e.g., no default in last 3 years)
  - `EMPLOYMENT_STATUS` (employed / self-employed / business owner)
- FR-004: Proof generation user ke local device pe ho — koi data server pe upload na ho
- FR-005: Proof generation time < 30 seconds on mid-range device
- FR-006: Proof size < 5KB for on-chain submission
- FR-007: Proof expiry: 30 days default (configurable by lending pool)

**Non-Functional:**
- NFR-001: Client app works offline after initial setup
- NFR-002: Supports iOS, Android, Chrome extension, desktop app
- NFR-003: Data connectors: Account Aggregator (India), Plaid (US/EU), Salt Edge (global)

### 6.2 Feature: ZK Verifier Smart Contract

**Priority:** P0

**Description:** On-chain contract jo ZK proof verify karta hai aur credit credential issue karta hai.

**Requirements:**
- FR-010: Accept Groth16 proofs (Circom-generated) — v1.0
- FR-011: Verify proof against trusted setup parameters (trusted setup ceremony documented)
- FR-012: Issue non-transferable SBT (Soulbound Token) as ZK Credit Credential
- FR-013: SBT stores only: user address, claim hash, expiry timestamp, issuer address — NO actual score/data
- FR-014: Nullifier mechanism to prevent double-spending same proof
- FR-015: Emergency pause mechanism (multisig 3/5)
- FR-016: Upgrade via Anchor program upgrade authority (BPF upgradeable)

### 6.3 Feature: Lending Pool Engine

**Priority:** P0

**Description:** Core lending/borrowing smart contracts with ZK-gated collateral ratios.

**Requirements:**
- FR-020: Standard assets v1.0: USDC, USDT, SOL, mSOL, jitoSOL
- FR-021: Tiered collateral ratios based on ZK credit level:

| Credit Tier | Collateral Ratio | Max Loan | Interest Rate Modifier |
|---|---|---|---|
| No credential | 150% (standard) | $50,000 | Base rate |
| Basic (score > 650) | 110% | $100,000 | Base - 2% |
| Good (score > 700 + income proof) | 80% | $250,000 | Base - 4% |
| Excellent (score > 750 + DTI < 30%) | 60% | $500,000 | Base - 6% |
| Premium (score > 800 + all claims) | 50% | $1,000,000 | Base - 8% |

- FR-022: Interest rate model: Kink model (low utilization: base rate; high utilization: kink rate)
- FR-023: Liquidation at 5% below required collateral ratio (not at 150% standard)
- FR-024: Liquidation bonus: 5% (lower than industry standard 10% because credit reduces risk)
- FR-025: Repayment: anytime, partial or full
- FR-026: Flash loan support with ZK credit check
- FR-027: Multi-asset collateral basket support

### 6.4 Feature: Credit Credential Registry

**Priority:** P1

**Description:** On-chain registry of issued ZK credit credentials, queryable by other protocols.

**Requirements:**
- FR-030: Public read function: `hasValidCredential(address, claimType)` → bool
- FR-031: No personal data stored — only cryptographic commitments
- FR-032: Cross-protocol compatibility: SPL Token interface
- FR-033: Credential delegation: user can delegate credential read to another address
- FR-034: Revocation: user can burn their own SBT anytime
- FR-035: Multi-chain registry via cross-chain message passing (Wormhole)

### 6.5 Feature: Oracle Integration Layer

**Priority:** P0

**Description:** Secure data feeds for asset prices aur off-chain data attestation.

**Requirements:**
- FR-040: Pyth + Switchboard price feeds for all supported assets
- FR-041: zkTLS attestation for real-time income verification (Stormbit/Reclaim Protocol)
- FR-042: Account Aggregator (India) webhook for real-time bank data updates
- FR-043: Heartbeat: price feed update within 10 minutes, else pause borrowing
- FR-044: Circuit breaker: if price drops >25% in 1 hour, automatic pause

### 6.6 Feature: Governance Module

**Priority:** P2

**Description:** Decentralized governance for protocol parameters.

**Requirements:**
- FR-050: Governance token: ZKC (ZKCredit)
- FR-051: Proposals: collateral ratios, supported assets, interest rate parameters, data connectors
- FR-052: Timelock: 48 hours minimum between proposal pass and execution
- FR-053: Quorum: 10% of circulating supply
- FR-054: Veto: security council (multisig 5/9) can veto malicious proposals within 24 hours

---

## 7. Technical Architecture

### 7.1 System Components Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │  ZKCreditScore  │    │   DeFi Frontend  │                   │
│  │  Client App     │    │   (Web/Mobile)   │                   │
│  │  (Local Device) │    │                  │                   │
│  └────────┬────────┘    └────────┬─────────┘                   │
└───────────┼─────────────────────┼───────────────────────────── ┘
            │ ZK Proof            │ Signed Tx
            ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER (L2)                        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │ ZK Verifier  │   │  Lending     │   │  Credential      │   │
│  │ Contract     │──▶│  Pool Engine │   │  Registry (SBT)  │   │
│  └──────────────┘   └──────────────┘   └──────────────────┘   │
│         │                   │                    │              │
│         └───────────────────┴────────────────────┘             │
│                             │                                   │
│  ┌──────────────┐   ┌───────┴──────┐   ┌──────────────────┐   │
│  │  Pyth /      │   │  Governance  │   │   Treasury /     │   │
│  │  Switchboard │   │  Module      │   │   Insurance Fund │   │
│  └──────────────┘   └──────────────┘   └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            ▲
            │ Proof Request
┌─────────────────────────────────────────────────────────────────┐
│                    DATA CONNECTOR LAYER                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │  Account     │   │   CIBIL /    │   │   Plaid API      │   │
│  │  Aggregator  │   │   Equifax    │   │   (US/EU)        │   │
│  │  (India)     │   │   (Bureau)   │   │                  │   │
│  └──────────────┘   └──────────────┘   └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 ZK Proof Pipeline

```
Step 1: Data Ingestion (Local Device)
  User consents → Data connector API call → Raw data fetched locally
  (Bank statements, credit score, income data)

Step 2: Data Parsing & Normalization
  Raw data → Standardized schema → Numerical encoding
  (Text fields converted to field elements for ZK circuit)

Step 3: ZK Circuit Execution (Client-Side WASM)
  Normalized data + Claim parameters → Circom circuit → Witness generation
  Witness → Groth16 prover (snarkjs) → (π_A, π_B, π_C, public_inputs)

Step 4: On-Chain Submission
  ZK Proof + Public Inputs → ZK Verifier Contract → Proof verification
  Verification pass → SBT mint → Credit Credential issued

Step 5: Lending Interaction
  User wallet + SBT → Lending Pool → Collateral ratio lookup
  → Loan disbursement at reduced collateral
```

### 7.3 Deployment Architecture

**Blockchain:** Solana Mainnet (primary) + Eclipse (Solana L2 — secondary)  
**Rationale:**
- Solana: ~$0.0002 per tx, 400ms block time, 2,000+ TPS, $6B+ DeFi TVL. Best L1 for low-cost ZK proof verification
- Eclipse: Solana L2 with zkEVM compatibility for EVM developers to consume credentials
- Solana Mainnet: Credential Registry anchor (for composability and finality)

**Client App:**
- React Native (iOS + Android)
- Chrome Extension (desktop)
- Solana wallet integration (Phantom, Backpack, Solflare)

**ZK Prover:**
- SnarkJS (WASM) — runs in browser/mobile (BN254 Groth16, Solana-compatible)
- Hardware acceleration via WebGPU (where available)
- Fallback: trusted prover service with TEE (Phala Network) for underpowered devices

---

## 8. ZK Circuit Design

### 8.1 Circuit Overview

Circuits Circom 2.0 mein likhe jaayenge. Ek main circuit hoga jisme multiple sub-circuits modularly integrate honge.

### 8.2 Credit Score Circuit

```
// Circom pseudocode — CreditScoreAbove.circom
pragma circom 2.0.0;

template CreditScoreAbove(threshold) {
    // Private inputs (never revealed on-chain)
    signal private input creditScore;        // e.g., 720
    signal private input bureauTimestamp;    // timestamp of score fetch
    signal private input userCommitment;     // Poseidon(address, salt)
    signal private input dataSource;         // bureau identifier

    // Public inputs (go on-chain)
    signal input addressCommitment;          // Poseidon(user_address)
    signal input thresholdPublic;            // e.g., 700
    signal input nullifier;                  // prevents proof reuse
    signal input expiryTimestamp;            // proof expiry

    // Outputs
    signal output isValid;                   // 1 if score >= threshold

    // Constraints
    // 1. Credit score must be >= threshold
    component gte = GreaterEqThan(10);       // 10-bit comparison
    gte.in[0] <== creditScore;
    gte.in[1] <== threshold;

    // 2. Score must be in valid range (300-900)
    component rangeCheck = RangeCheck(300, 900);
    rangeCheck.value <== creditScore;

    // 3. Data not older than 90 days
    component freshCheck = TimestampFresh(90 * 86400);
    freshCheck.timestamp <== bureauTimestamp;

    // 4. User commitment matches address
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== userCommitment;
    poseidon.inputs[1] <== addressCommitment;
    // must equal zero for valid commitment
    poseidon.out === 0;

    // 5. Nullifier correctly derived
    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== creditScore;
    nullifierCheck.inputs[1] <== bureauTimestamp;
    nullifierCheck.inputs[2] <== userCommitment;
    nullifierCheck.out === nullifier;

    isValid <== gte.out * rangeCheck.out * freshCheck.out;
}

component main = CreditScoreAbove(700);
```

### 8.3 Income Verification Circuit

```
// IncomeAbove.circom — monthly income verification
template IncomeAbove() {
    // Private inputs
    signal private input monthlyIncome;          // in USD cents
    signal private input incomeSource;           // employer/business/freelance
    signal private input verificationTimestamp;

    // Public inputs  
    signal input incomeThreshold;                // e.g., 300000 (= $3000)
    signal input addressCommitment;
    signal input nullifier;

    // Constraints
    component gte = GreaterEqThan(20);           // 20-bit for income values
    gte.in[0] <== monthlyIncome;
    gte.in[1] <== incomeThreshold;

    // 3-month average check (stability requirement)
    signal private input month1Income;
    signal private input month2Income;
    signal private input month3Income;
    
    // Average of last 3 months must meet threshold
    signal avgIncome;
    avgIncome <== (month1Income + month2Income + month3Income) / 3;
    
    component avgGte = GreaterEqThan(20);
    avgGte.in[0] <== avgIncome;
    avgGte.in[1] <== incomeThreshold;
}
```

### 8.4 Composite Credit Score Circuit

```
// CompositeCreditScore.circom — combined scoring
// Weights: Credit Score 40% + Income 30% + DTI 20% + History 10%

template CompositeCreditScore() {
    // Runs all sub-circuits, outputs composite tier (0–4)
    component creditCircuit = CreditScoreAbove(650);
    component incomeCircuit = IncomeAbove();
    component dtiCircuit = DebtToIncomeBelow();
    component historyCircuit = NoDefaultsHistory(3); // 3 years

    signal output creditTier;   // 0=none, 1=basic, 2=good, 3=excellent, 4=premium
}
```

### 8.5 Trusted Setup

- Powers of Tau ceremony: use Hermez Network's existing ceremony (2^28 constraints)
- Per-circuit Phase 2 ceremony: public, verifiable, documented
- Verification keys: stored on IPFS + on-chain registry
- Audit: Trail of Bits + Consensys Diligence

---

## 9. Smart Contract Specifications (Anchor / Rust)

Smart contracts Solana Anchor framework mein Rust mein likhe gaye hain. Source code available at `anchor/programs/`.

### 9.1 Program: zk-credit-verifier

**Account:** `Credential`
```rust
pub struct Credential {
    pub owner: Pubkey,
    pub credit_tier: u8,
    pub claim_type: u8,
    pub threshold: u64,
    pub claims_bitmap: u8,
    pub issued_at: u64,
    pub expires_at: u64,
    pub issuer: Pubkey,
    pub is_revoked: bool,
    pub bump: u8,
}
```

**Instructions:**
- `verify_and_issue_credential(proof, claim)` → Creates/updates Credential PDA
- `has_valid_credential()` → Read-only check of credential validity
- `revoke_credential()` → Marks credential as revoked
- `update_config()` → Admin: protocol parameters

**Account:** `Nullifier` — Prevents proof replay  
**Account:** `VerifierConfig` — Protocol parameters

### 9.2 Program: zk-lending-pool

**Account:** `LendingPool`
```rust
pub struct LendingPool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_deposits: u64,
    pub total_borrows: u64,
    pub utilization_rate: u64,
    pub base_rate: u64,
    pub optimal_utilization: u64,
    pub slope1: u64,
    pub slope2: u64,
    pub paused: bool,
    pub bump: u8,
}
```

**Account:** `Loan`
```rust
pub struct Loan {
    pub borrower: Pubkey,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub borrow_mint: Pubkey,
    pub borrow_amount: u64,
    pub interest_rate: u64,
    pub collateral_ratio: u64,
    pub credit_tier_at_issuance: u8,
    pub start_timestamp: u64,
    pub status: u8,
    pub repaid_amount: u64,
    pub bump: u8,
}
```

**Instructions:**
- `initialize_pool(config)` → Creates a new lending pool for an SPL token
- `deposit_and_borrow(collateral, borrow)` → Locks collateral via SPL Token transfer, disburses loan
- `repay(amount)` → Repays partial or full loan
- `liquidate(debt_to_cover)` → Liquidates underwater positions (5% below collateral ratio)
- `update_pool_config(config)` → Admin: kink model parameters

### 9.3 Interest Rate Model (Kink)

```rust
// Kink model with credit tier modifier
// Base Rate: 2% APR
// Optimal Utilization: 80%
// Slope 1 (below optimal): 8% APR
// Slope 2 (above optimal): 75% APR

// Credit tier modifier:
// Tier 0: +0%   | Tier 1: -2%   | Tier 2: -4%
// Tier 3: -6%   | Tier 4: -8%

fn get_borrow_rate(utilization, credit_tier, pool) -> u64 {
    let base = kink_rate(utilization, pool);
    let discount = TIER_DISCOUNTS[credit_tier];
    max(base - discount, MIN_RATE)
}
```

---

## 10. Data Models

### 10.1 ZK Proof Schema

```typescript
interface ZKProof {
  proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
    protocol: "groth16";
    curve: "bn128";
  };
  publicSignals: {
    addressCommitment: string;   // Poseidon hash of user address
    claimType: number;           // enum value
    threshold: string;           // public threshold value
    nullifier: string;           // prevents replay
    expiryTimestamp: string;
    circuitVersion: string;      // for upgrade compatibility
  };
  metadata: {
    generatedAt: number;         // client timestamp (not trusted)
    circuitId: string;           // which circuit generated this
    proverVersion: string;
  };
}
```

### 10.2 Credit Credential (On-Chain SBT)

```typescript
interface CreditCredential {
  tokenId: string;
  owner: string;                  // wallet address
  // Data stored on-chain (minimal):
  credentialHash: string;         // Poseidon(claims, tier, expiry)
  creditTier: 0 | 1 | 2 | 3 | 4;
  claimsBitmap: number;           // bitmask of which claims are proven
  issuedAt: number;               // block timestamp
  expiresAt: number;              // expiry block timestamp
  issuer: string;                 // ZKCreditVerifier contract address
  // NOT stored: actual scores, income values, name, PAN, etc.
}
```

### 10.3 Loan Record

```typescript
interface LoanRecord {
  loanId: string;
  borrower: string;
  collateral: {
    asset: string;               // SPL Token mint address
    amount: BigNumber;
    valueUSD: BigNumber;         // at time of loan creation
  };
  borrowed: {
    asset: string;
    amount: BigNumber;
    interestRate: number;        // APR in basis points
  };
  terms: {
    collateralRatio: number;     // in basis points
    liquidationThreshold: number;
    creditTierAtIssuance: number;
    maturityTimestamp: number;   // 0 for revolving
  };
  status: "active" | "repaid" | "liquidated";
  repaidAmount: BigNumber;
  createdAt: number;
  lastUpdateAt: number;
}
```

---

## 11. User Flows

### 11.1 First-Time User Flow: Get ZK Credit Credential

```
1. User downloads ZKCreditScore app
2. Connects wallet (Phantom / Backpack / Solflare)
3. Selects data source:
   a. India: Account Aggregator (AA) consent flow
   b. US/EU: Plaid Link
   c. Manual: PDF upload (bank statement / bureau report)
4. Consents to local processing (data never leaves device)
5. App fetches data from source (or parses PDF locally)
6. User selects which claims to prove:
   - "Prove credit score > 700"
   - "Prove monthly income > $2000"
   - (Can prove multiple claims in one proof batch)
7. App runs ZK circuit (shows progress: "Generating proof... 15s")
8. ZK proof generated locally (takes ~20-30s)
9. App submits proof to ZKCreditVerifier on-chain (tx fee paid by user OR gas subsidized via ZKC staking)
10. Smart contract verifies proof (on-chain, ~2s)
11. SBT minted to user wallet
12. User sees: "ZK Credit Credential: Good (Tier 2) — Valid until [date]"
```

### 11.2 Borrowing Flow

```
1. User goes to ZKCreditScore Lending dApp
2. Connects wallet
3. Protocol reads SBT → determines credit tier → shows personalized rates
   "Your credit tier: Good (Tier 2)"
   "You qualify for up to $50,000 USDC at 80% LTV at 7.5% APR"
4. User selects:
   - Collateral asset: SOL (35 SOL = $3,000 at $85/SOL)
   - Borrow amount: $2,400 USDC (80% LTV)
5. User approves collateral (SPL Token approve tx)
6. User calls depositAndBorrow()
   - Protocol checks: SBT valid? collateral sufficient at 80% LTV? → yes
   - Collateral locked in vault
   - USDC transferred to user wallet
7. User receives $2,400 USDC
   (Without ZK credential: would need $3,600 collateral for same loan)
```

### 11.3 Credential Renewal Flow

```
1. User notified 7 days before credential expiry
2. User opens app → "Renew Credential"
3. App re-fetches fresh data from connected source
4. New proof generated with updated data
5. New proof submitted on-chain
6. Old SBT updated (or new SBT minted, old burned)
7. Loan positions automatically reflect updated tier
```

---

## 12. API Specifications

### 12.1 ZK Prover SDK (Client-Side)

```typescript
// @zkcreditscore/prover-sdk

interface ZKProverSDK {
  
  // Initialize with circuit configs
  init(config: {
    circuitsUrl: string;    // IPFS CID of circuits
    backendUrl?: string;    // Optional TEE prover for underpowered devices
  }): Promise<void>;
  
  // Connect data source
  connectDataSource(
    source: 'account-aggregator' | 'plaid' | 'pdf-upload',
    config: DataSourceConfig
  ): Promise<DataConnectionResult>;
  
  // Generate ZK proof for a claim
  generateProof(
    claim: ClaimRequest,
    options?: {
      useHardwareAcceleration: boolean;  // WebGPU
      useTEEFallback: boolean;           // For slow devices
    }
  ): Promise<ZKProof>;
  
  // Generate composite proof (multiple claims)
  generateCompositeProof(
    claims: ClaimRequest[]
  ): Promise<ZKProof>;
  
  // Submit proof on-chain
  submitProof(
    proof: ZKProof,
    signer: anchor.Wallet
  ): Promise<TransactionSignature>;
  
  // Estimate proof generation time
  estimateProofTime(claim: ClaimRequest): Promise<number>;  // seconds
}

interface ClaimRequest {
  type: ClaimType;
  threshold: number;
  dataSourceId: string;  // which connected source to use
}
```

### 12.2 Protocol Integration SDK (For DeFi Builders)

```typescript
// @zkcreditscore/integration-sdk

interface ZKCreditIntegrationSDK {
  
  // Check if user has valid credential
  hasCredential(
    userAddress: string,
    claimType: ClaimType,
    threshold?: number,
    chainId?: number
  ): Promise<boolean>;
  
  // Get user's credit tier
  getCreditTier(userAddress: string): Promise<{
    tier: 0 | 1 | 2 | 3 | 4;
    expiresAt: Date;
    claims: ClaimType[];
  }>;
  
  // Get recommended collateral ratio for user
  getRecommendedLTV(
    userAddress: string,
    loanAsset: string,
    loanAmount: BigNumber
  ): Promise<{
    ltvRatio: number;     // e.g., 80 (= 80%)
    maxLoanAmount: BigNumber;
    interestRateModifier: number;   // basis points discount
  }>;
  
  // Get Anchor interface for on-chain integration
  getVerifierInterface(): string;  // IDL
  getVerifierAddress(): string;
}
```

### 12.3 REST API (Backend — for indexing, analytics only)

```
Base URL: https://api.zkcreditscore.io/v1

GET /stats
  Response: { totalCredentials, activeLoansTVL, averageCreditTier, ... }

GET /credential/:address
  Response: { tier, expiresAt, claimTypes, isValid }
  Note: No personal data — only on-chain credential info

GET /pools
  Response: list of lending pools with current rates, utilization

GET /circuit/:circuitId
  Response: circuit info, verification key IPFS CID, audit status

GET /leaderboard  
  Response: anonymized aggregate stats for ecosystem health
```

---

## 13. Tokenomics

### 13.1 ZKC Token Overview

**Token:** ZKC (ZKCredit)  
**Standard:** SPL Token (Token 2022)  
**Total Supply:** 1,000,000,000 ZKC (1 billion)  
**Chain:** Solana Mainnet (primary), bridged to Eclipse (Solana L2)

### 13.2 Allocation

| Category | Allocation | Vesting |
|---|---|---|
| Protocol Treasury | 30% (300M) | 4 years, quarterly unlock |
| Team & Advisors | 20% (200M) | 1 year cliff, 3 years linear |
| Ecosystem / Grants | 20% (200M) | 5 years, milestone-based |
| Community Sale / IDO | 15% (150M) | 20% at TGE, 12 months linear |
| Liquidity Provision | 10% (100M) | At TGE, locked in LP |
| Security Council | 5% (50M) | 2 years, quarterly |

### 13.3 Token Utility

**Fee Discounts:** ZKC stake karne se protocol fees pe 10–30% discount  
**Governance:** 1 ZKC = 1 vote (quadratic voting for parameter changes)  
**Staking Rewards:** Protocol revenue ka 40% ZKC stakers ko distribute  
**Proof Subsidies:** ZKC stake karne se gas fees covered by protocol  
**Credential Boost:** ZKC collateral ke roop mein use karne se credit tier boost

### 13.4 Revenue Model

| Revenue Source | Mechanism | % to Protocol |
|---|---|---|
| Origination Fee | 0.5% of loan amount at creation | 100% |
| Interest Spread | Borrow rate minus supply rate | 20% |
| Liquidation Fee | 1% of liquidated amount | 100% |
| Credential Issuance | $2 equivalent in ZKC per proof | 100% |
| Integration License | $500/month for enterprise SDK | 100% |

**Revenue Distribution:**  
- 40% → ZKC Stakers (protocol yield)
- 30% → Insurance/Reserve Fund
- 20% → Protocol Treasury (development)
- 10% → Security Council operations

---

## 14. Risk Framework

### 14.1 Smart Contract Risk

| Risk | Severity | Mitigation |
|---|---|---|
| Reentrancy attack | Critical | Anchor's type-safe CPI, SPL Token checks |
| Oracle manipulation | High | Multi-oracle (Pyth + Switchboard), TWAP pricing, circuit breakers |
| ZK proof forgery | Critical | Trusted setup audit, multiple audits of verifier contract |
| Governance attack | High | Timelock (48hr), security council veto, quorum (10%) |
| Upgrade vulnerability | High | Anchor BPF upgrade + multisig upgrade authority, 48hr timelock |

### 14.2 Credit Risk

| Risk | Severity | Mitigation |
|---|---|---|
| Fake ZK proofs | Critical | Cryptographically impossible — ZK soundness property |
| Stale credentials | Medium | 30-day expiry, automatic liquidation threshold adjustment |
| Collateral price crash | High | Conservative LTV ratios, instant oracle updates, liquidation bots |
| Borrower default (no on-chain consequence) | Medium | Credit tier progressively increases collateral on renewal |
| Data source manipulation | Medium | Multiple data source requirement for Premium tier, time-weighted |

### 14.3 Privacy Risk

| Risk | Severity | Mitigation |
|---|---|---|
| Proof data leakage | Low | Public inputs contain no personal data by design |
| Nullifier correlation | Low | Nullifiers are circuit-specific, not linkable to identity |
| SBT metadata inference | Low | SBT only stores tier + hash — no score values |
| TEE prover compromise | Medium | TEE fallback is optional; default is local proving |
| Data connector breach | High | Data never stored after proof generation; delete immediately |

### 14.4 Insurance Fund

- 5% of all origination fees go to Insurance Fund
- Minimum 10% of protocol TVL maintained as reserve
- Insurance covers: smart contract exploits (up to 80% of loss), oracle failures
- Third-party insurance: Solace / Neptune Mutual integration optional

---

## 15. Compliance & Legal

### 15.1 Regulatory Approach

ZKCreditScore deliberately designed to be regulation-compatible:

**GDPR / India DPDP Act:**
- No personal data ever stored by protocol
- Data processing happens entirely client-side
- Right to erasure: user can burn SBT and all on-chain data is non-personal
- Data minimization: only cryptographic proofs on-chain

**FATF Travel Rule:**
- Protocol does not hold or transfer customer funds directly (non-custodial)
- ZK credentials can include AML/sanctions check proof
- Enterprise integration SDK supports Travel Rule compliance for exchanges

**India RBI:**
- Protocol does not accept fiat deposits — pure crypto lending
- Not classified as NBFC (no fiat intermediation)
- Account Aggregator integration follows RBI AA framework

**US:**
- Non-US entity structure recommended
- Restriction of US persons from front-end (IP geofencing)
- Legal opinion letter from Debevoise & Plimpton on token classification

### 15.2 KYC/AML Optional Layer

For institutional pools (separate from permissionless pools):
- ZK proof can include "Sanctions check passed" claim
- Proof generated via Chainalysis/Elliptic API locally
- Proof submitted with loan request for institutional compliance

---

## 16. Roadmap & Milestones

### Phase 1 — Foundation

| Milestone | Deliverable |
|---|---|
| M1 | ZK circuit design + audit (CreditScore + Income circuits) |
| M2 | Smart contracts v0.1 (Verifier + SBT) testnet deploy |
| M3 | Client app MVP (iOS + Chrome) with Account Aggregator integration |
| M4 | Lending Pool v0.1 testnet (USDC only, single collateral type) |
| M5 | Security audit — Trail of Bits (circuits) + Neodyme (Anchor contracts) |
| M6 | Trusted setup ceremony (public, verifiable) |

### Phase 2 — Mainnet Launch

| Milestone | Deliverable |
|---|---|
| M7 | Mainnet launch on Solana — permissionless mainnet |
| M8 | ZKC token launch + governance activation |
| M9 | Multi-collateral support (SOL, mSOL, jitoSOL, USDC) |
| M10 | Composite credit score circuit + tier system full launch |
| M11 | Integration SDK v1.0 — first 3 protocol integrations |
| M12 | $50M TVL target — liquidity mining program |

### Phase 3 — Expansion

| Milestone | Deliverable |
|---|---|
| M13 | Eclipse L2 deployment + cross-chain credential portability via Wormhole |
| M14 | Plaid integration (US/EU market entry) |
| M15 | B2B API — white-label for other DeFi protocols |
| M16 | Under-collateralized flash loans for ZK Premium tier |
| M17 | Mobile-first markets: India, Nigeria, Indonesia, Brazil expansion |
| M18 | ZK ML credit model (off-chain ML inference + ZK proof of correct computation) |
| M24 | $500M TVL target, 100+ protocol integrations |

---

## 17. Success Metrics

### 17.1 Product KPIs

| Metric | 3-Month Target | 6-Month Target | 12-Month Target |
|---|---|---|---|
| ZK Credentials Issued | 1,000 | 10,000 | 100,000 |
| Active Loans | 200 | 2,000 | 20,000 |
| Total TVL (Deposits) | $5M | $25M | $100M |
| Loan Origination Volume | $2M | $15M | $75M |
| Average Credit Tier | 1.5 | 2.0 | 2.5 |
| Default Rate | <2% | <3% | <3% |
| Capital Efficiency vs Standard | +40% | +50% | +55% |
| Protocol Integrations | 2 | 5 | 20 |

### 17.2 Business Metrics

| Metric | 12-Month Target |
|---|---|
| Protocol Revenue | $2M ARR |
| ZKC Market Cap | $50M |
| Insurance Fund Size | $5M |
| Developer SDK Downloads | 10,000+ |
| Team Size | 20 people |

### 17.3 Technical Metrics

| Metric | Target |
|---|---|
| Proof Generation Time (mobile) | <30 seconds |
| On-Chain Verification Compute | <200,000 CU |
| Smart Contract Audit Score | No critical issues |
| Uptime | 99.9% |
| Proof Size | <5KB |

---

## 18. Open Questions

### Technical

1. **Trusted Setup Ceremony:** Hermez ceremony use karein ya apna perform karein? Apna zyada trust deta hai lekin expensive hai.

2. **TEE Fallback Security:** Phala Network vs Intel TDX vs AWS Nitro — konsa TEE provider sabse trustless hai for ZK proving?

3. **Data Source Rate Limits:** CIBIL API ke strict rate limits hain. Caching strategy kya ho? (Cached data se proof generate ho sakti hai par freshness guarantee kaisi hogi?)

4. **Circuit Upgradability:** ZK circuits upgrade nahi hote easily. V2 circuit ke liye fresh trusted setup chahiye. Migration path kya hoga?

5. **Proof Aggregation:** Multiple users ke proofs batch karke ek single on-chain submission mein aggregate karein? (Cost reduction ~80%)

### Product

6. **Credential Composability:** Agar user ke paas Aave credit delegation + ZKCreditScore dono hain, toh kaunsa collateral ratio apply hoga?

7. **Credit Improvement Loop:** Default hone ke baad user ka tier kaise degrade ho? On-chain visibility vs off-chain consequence problem.

8. **Institutional Pool Separation:** Permissionless pool aur compliance pool ko separate contract rakhein ya flags se manage karein?

### Business

9. **Data Connector Partnerships:** Account Aggregator ka India mein rollout slow hai. Fallback strategy kya ho for PDF parsing reliability?

10. **Competitor Response:** Aave V4 ne credit delegation feature announce kiya hai. Differentiation kaafi hai?

---

## Appendix A — Tech Stack Summary

| Layer | Technology |
|---|---|
| ZK Circuits | Circom 2.0 |
| Proving System | Groth16 (snarkjs) |
| Smart Contracts | Anchor (Rust) 0.30.x |
| Primary Chain | Solana Mainnet |
| Secondary Chain | Eclipse (Solana L2) |
| Oracle | Pyth + Switchboard |
| Data Attestation | zkTLS (Reclaim Protocol) |
| Account Aggregator | Sahamati AA Framework |
| Client App | React Native + TypeScript |
| Browser Extension | Chrome Extension (React) |
| Backend | Node.js + PostgreSQL (analytics only) |
| Indexing | Solana DAS API + Helius |
| Cross-chain | Wormhole |
| Gas Subsidies | ZKC staking program |
| Insurance | Solace / Neptune Mutual |

---

## Appendix B — Competitor Comparison Matrix

| Feature | ZKCreditScore | Aave | Maple Finance | TrueFi | Goldfinch | Spectral |
|---|---|---|---|---|---|---|
| Under-collateralized loans | ✅ | ❌ | ✅ (whitelist) | ✅ (whitelist) | ✅ (auditor) | Partial |
| Privacy preserved | ✅ | N/A | ❌ | ❌ | ❌ | Partial |
| Permissionless | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Off-chain credit data | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| ZK proof based | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Individual borrowers | ✅ | ✅ | ❌ (institutional) | ❌ (institutional) | Partial | ✅ |
| Composable credential | ✅ | N/A | ❌ | ❌ | ❌ | Partial |
| India-native | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

*Document Version: 1.0 | Next Review: August 2026 | Owner: Product Lead*  
*Classification: Internal Confidential — Do Not Distribute*
