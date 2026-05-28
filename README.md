<div align="center">
  <img src="./public/logo.svg" alt="ZKCreditScore Logo" width="120" />
  <h1 align="center">ZKCreditScore Protocol</h1>
  <p align="center">
    <strong>Privacy-Preserving Decentralized Lending on Solana</strong>
  </p>
  <p align="center">
    Prove your creditworthiness — without revealing your data.
  </p>

  <p align="center">
    <a href="#overview">Overview</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#smart-contracts">Smart Contracts</a> •
    <a href="#zk-circuits">ZK Circuits</a> •
    <a href="#sdk">SDK</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deployment">Deployment</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/solana-v2.0-blue?logo=solana" alt="Solana" />
    <img src="https://img.shields.io/badge/anchor-v0.30.1-purple" alt="Anchor" />
    <img src="https://img.shields.io/badge/circom-v2.1.0-orange" alt="Circom" />
    <img src="https://img.shields.io/badge/next.js-v16-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </p>
</div>

---

## 📋 Overview

ZKCreditScore is a **privacy-preserving, decentralized lending protocol** built on **Solana** that uses **Zero-Knowledge Proofs (ZKPs)** to enable **under-collateralized loans** based on real-world creditworthiness — without revealing sensitive financial data.

### The Problem

Every DeFi lending protocol today requires **125–200% overcollateralization**. A borrower must lock $1,500–$2,000 to borrow $1,000. This makes DeFi lending capital-inefficient and excludes retail users, small businesses, and productive credit use cases — a **$10.3 trillion underserved market**.

### The Solution

ZKCreditScore bridges off-chain credit data with on-chain DeFi using Zero-Knowledge Proofs:

1. Users connect their financial data (bank statements, credit bureau reports, income proofs) locally
2. A **Groth16 ZK proof** is generated client-side via Circom/snarkjs (<30 seconds)
3. The proof is submitted on Solana — **only specific boolean claims** are verified (e.g., "credit score > 700")
4. A **Soulbound Token (SBT)** credential is issued, enabling under-collateralized loans at **50–80% collateral ratios**

### Key Differentiators

| Feature | ZKCreditScore | Aave / Compound | Maple Finance | Spectral |
|---|---|---|---|---|
| **Collateral Ratio** | 50–150% (tier-based) | 125–200% | 100–150% | 150%+ |
| **Credit Data** | Off-chain (bank, bureau, income) | None | Off-chain (centralized) | On-chain only |
| **Privacy** | ✅ ZK — zero data exposure | N/A | ❌ KYC required | ❌ On-chain transparent |
| **Permissionless** | ✅ Yes | ✅ Yes | ❌ Whitelisted | ✅ Yes |
| **Capital Efficiency** | Up to 2x more efficient | Low | Moderate | Low |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER DEVICE                               │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  Plaid / │  │  Client-Side │  │     snarkjs WASM          │  │
│  │  CIBIL / │──►  Data Parser │──►    ZK Prover              │  │
│  │  Account │  │ (Local only) │  │  (Groth16, BN128)         │  │
│  │  Aggreg. │  └──────────────┘  └───────────┬───────────────┘  │
│  └──────────┘                                 │                  │
│                                               │ ZK Proof         │
│                                               ▼                  │
│                                      ┌──────────────────┐        │
│                                      │  Phantom Wallet   │        │
│                                      │  (Solana Tx)      │        │
│                                      └────────┬─────────┘        │
└──────────────────────────────────────┬────────┼──────────────────┘
                                       │        │
                                       ▼        ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SOLANA BLOCKCHAIN                            │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │ zk-credit-verifier  │  │ zk-lending-pool│  │  zkc-token   │   │
│  │ • Verify ZK proof   │  │ • Deposit      │  │ • Staking    │   │
│  │ • Issue/Revoke SBT  │◄─►│ • Borrow       │  │ • Rewards    │   │
│  │ • Nullifier mgmt    │  │ • Repay        │  │ • Fee disc.  │   │
│  └────────────────────┘  │ • Liquidate    │  └───────┬──────┘   │
│                          └────────────────┘          │          │
│  ┌────────────────────┐                              │          │
│  │  zk-governance      │◄─────────────────────────────┘          │
│  │ • Proposals         │                                         │
│  │ • Stake-weighted     │                                         │
│  │   voting            │                                         │
│  │ • Timelock exec     │                                         │
│  └────────────────────┘                                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DATA CONNECTOR LAYER                         │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────────┐   │
│  │  Plaid  │  │  CIBIL  │  │ Account │  │    zkTLS         │   │
│  │ (US/EU) │  │(Global) │  │ Aggreg. │  │  (Reclaim Prot.) │   │
│  │         │  │         │  │ (India) │  │                  │   │
│  └─────────┘  └─────────┘  └─────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4 + shadcn/ui (New York) + Framer Motion |
| **State** | Zustand v5 + TanStack React Query v5 |
| **Charts** | Recharts |
| **Blockchain** | Solana, Anchor Framework v0.30.1 |
| **Wallet** | @solana/wallet-adapter (Phantom) |
| **ZK Proofs** | Circom 2.1.0 + snarkjs (Groth16, BN128 curve) |
| **Smart Contracts** | Rust (Anchor) |
| **SDK** | TypeScript (ESM + CJS, published as `@zkcreditscore/sdk`) |
| **Database** | SQLite via Prisma (dev) |
| **CI/CD** | GitHub Actions, Vercel |
| **Auth** | Solana wallet signatures (no traditional auth) |

---

## 📄 Smart Contracts

Four Anchor programs manage the protocol, each deployed as a Solana BPF program:

### 1. zk-credit-verifier
**Program ID:** `9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh`

Core ZK proof verification and credential management:
- `verify_and_issue_credential` — Verifies a Groth16 proof, checks nullifier, calculates credit tier, mints SBT credential
- `has_valid_credential` — Checks if a user holds a valid, non-revoked credential
- `revoke_credential` — Allows owner to revoke their own credential
- `update_config` — Updates verifier parameters (authority only)

**Accounts:** `Credential`, `Nullifier`, `VerifierConfig`

### 2. zk-lending-pool
**Program ID:** `HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo`

Lending/borrowing protocol with tier-based collateral ratios:
- **Kink interest rate model:** Base 2%, optimal utilization 80%, slope1 8%, slope2 75%
- **Collateral ratios by tier:**
  - Tier 0 (None): 150%
  - Tier 1 (Basic): 110%
  - Tier 2 (Good): 80%
  - Tier 3 (Excellent): 60%
  - Tier 4 (Premium): 50%
- `initialize_pool`, `deposit_and_borrow`, `repay`, `liquidate`, `update_pool_config`

### 3. zkc-token
**Program ID:** `4A1AR7H5VHQzwM7QuucYDHKTrQWt9HQ1GyEB4gh4pump`

ZKCR governance and utility token (SPL Token 2022 standard):
- **Total supply:** 1,000,000,000 ZKCR
- **Minimum stake:** 1,000 ZKCR
- **Reward rate:** 500 bps annually
- **Fee discounts:** Up to 30% based on stake amount
- `initialize_token`, `stake_tokens`, `unstake_tokens`, `claim_rewards`, `get_fee_discount`

### 4. zk-governance
**Program ID:** `4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT`

On-chain DAO with stake-weighted voting:
- **Min voting period:** 1 day | **Max:** 7 days
- **Timelock:** 48 hours (6 hours for emergency)
- **Quorum:** 10% of staked supply
- **Min stake to propose:** 10,000 ZKCR
- `initialize`, `create_proposal`, `cast_vote`, `queue_proposal`, `execute_proposal`

### Tokenomics

```
┌──────────────────────────────────────────────┬────────────┬──────────────────┐
│ Category                                     │ Percentage  │ Amount           │
├──────────────────────────────────────────────┼────────────┼──────────────────┤
│ Protocol Treasury                             │     30%     │ 300,000,000 ZKCR │
│ Team & Advisors (1yr cliff, 3yr linear)      │     20%     │ 200,000,000 ZKCR │
│ Ecosystem / Grants (milestone-based)         │     20%     │ 200,000,000 ZKCR │
│ Community Sale / IDO (20% TGE, 12mo linear)  │     15%     │ 150,000,000 ZKCR │
│ Liquidity Provision (locked in LP)           │     10%     │ 100,000,000 ZKCR │
│ Security Council (2yr quarterly)             │      5%     │  50,000,000 ZKCR │
├──────────────────────────────────────────────┼────────────┼──────────────────┤
│ Total                                        │    100%     │ 1,000,000,000    │
└──────────────────────────────────────────────┴────────────┴──────────────────┘
```

---

## 🔐 ZK Circuits

Five Circom 2.0 circuits in `/circuits/`:

| Circuit | File | What It Proves |
|---|---|---|
| **Credit Score** | `credit_score_above.circom` | Credit score ≥ threshold (range: 300–900, data freshness <90 days) |
| **Income** | `income_above.circom` | Monthly income ≥ threshold (3-month average stability) |
| **Debt-to-Income** | `dti_below.circom` | DTI ratio below threshold |
| **No Default** | `no_default.circom` | No defaults in N years |
| **Composite** | `composite_credit_score.circom` | Weighted scoring → Tier 0–4 (40% score + 30% income + 20% DTI + 10% history) |

All use **Groth16 proving system** on the **BN128 curve** (compatible with Solana's alt_bn128 precompile). Client-side proof generation via snarkjs WASM with a target of <30 seconds.

---

## 📦 SDK

The `@zkcreditscore/sdk` package provides TypeScript bindings for protocol interaction:

```typescript
import { ZKProver, SolanaSDK, ZKCreditAPI } from '@zkcreditscore/sdk';

// Client-side ZK proof generation
const prover = new ZKProver();
const proof = await prover.generateProof({
  type: ClaimType.CREDIT_SCORE_ABOVE,
  threshold: 700,
  dataSourceId: 'plaid_123'
});

// Solana program interaction
const solana = new SolanaSDK(provider);
const credential = await solana.verifier.verifyAndIssue(proof);

// Protocol data queries
const api = new ZKCreditAPI('https://api.zkscore.credit');
const stats = await api.getProtocolStats();
```

### SDK Modules

| Module | Export | Purpose |
|---|---|---|
| `prover` | `ZKProver` | Client-side proof generation, data source connection |
| `solana` | `SolanaSDK` | Anchor provider + program clients (verifier, lendingPool, zkcToken) |
| `api` | `ZKCreditAPI` | REST API client for protocol data |
| `integration` | `ZKCreditIntegrationSDK` | DeFi protocol integration helpers |
| `types` | Types & Enums | `ZKProof`, `CreditTier`, `ClaimType`, `LoanRecord` |
| `constants` | Constants | Program IDs, tier configs, network URLs |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Bun** (package manager)
- **Rust** + **Solana CLI** + **Anchor CLI** (for smart contracts)
- **Circom** 2.0+ (for ZK circuits)

### Frontend

```bash
# Install dependencies
bun install

# Start development server
bun run dev          # http://localhost:3000

# Build for production
bun run build

# Start production server
bun run start
```

### Smart Contracts (Anchor)

```bash
cd anchor

# Build all programs
anchor build

# Run tests
anchor test

# Deploy to localnet
anchor deploy
```

### ZK Circuits

```bash
cd circuits

# Install dependencies
npm install

# Compile all circuits
npm run compile:all

# Or compile individually
npm run compile:credit
npm run compile:income
```

### SDK

```bash
cd packages/sdk

# Build both ESM + CJS
npm run build

# Run tests
npm test
```

### Database

```bash
# Push Prisma schema to SQLite
bun run db:push

# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate
```

---

## 📁 Project Structure

```
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages + API routes
│   │   ├── page.tsx              # Landing page (15+ marketing sections)
│   │   ├── app/page.tsx          # App dashboard (wallet-connected)
│   │   └── api/                  # API routes (stats, analytics, calculate)
│   ├── components/
│   │   ├── sections/             # Landing page sections (hero, tiers, calculator, etc.)
│   │   ├── ui/                   # shadcn/ui components (~40 primitives)
│   │   └── providers/            # Solana wallet provider
│   ├── hooks/                    # Custom hooks (use-toast, use-mobile)
│   └── lib/                      # Utilities, types, DB client
├── anchor/                       # Solana Anchor smart contracts
│   └── programs/
│       ├── zk-credit-verifier/   # ZK proof verification + SBT credentials
│       ├── zk-lending-pool/      # Lending/borrowing with tier ratios
│       ├── zkc-token/            # ZKCR token (SPL Token 2022) + staking
│       └── zk-governance/        # DAO governance with timelock
├── circuits/                     # ZK circuits (Circom 2.0)
│   ├── credit_score_above.circom
│   ├── income_above.circom
│   ├── dti_below.circom
│   ├── no_default.circom
│   └── composite_credit_score.circom
├── packages/
│   └── sdk/                      # @zkcreditscore/sdk TypeScript package
│       └── src/
│           ├── prover/           # Client-side ZK proof generation
│           ├── solana/           # Anchor program interaction
│           ├── api/              # REST API client
│           ├── integration/      # DeFi integration helpers
│           ├── types/            # TypeScript type definitions
│           └── constants/        # Program IDs, configs, network URLs
├── prisma/                       # Prisma schema (SQLite)
├── scripts/                      # Dev setup scripts
├── .github/workflows/            # CI/CD pipelines
└── .zscripts/                    # Build/deploy automation scripts
```

---

## 🌐 API Routes

| Route | Method | Description |
|---|---|---|
| `/api` | GET | Health check |
| `/api/stats` | GET | Protocol statistics (TVL, credentials, loans) |
| `/api/analytics` | GET | Historical analytics (TVL history, tier distribution) |
| `/api/calculate` | POST | Loan calculation (`{ loanAmount, creditTier, duration }`) |

---

## 🧪 Testing

```bash
# Frontend lint
bun run lint

# Anchor tests
cd anchor && anchor test

# SDK tests
cd packages/sdk && npm test

# End-to-end test suite
cd anchor && npx ts-mocha tests/zk-credit-score.ts
```

---

## 🚢 Deployment

### Vercel (Landing Page)

```bash
vercel --prod
```

The project includes GitHub Actions workflows for automated deployment:
- **CI** (`ci.yml`): Builds Anchor programs, compiles circuits, builds SDK, builds frontend
- **Deploy Landing** (`deploy-landing.yml`): Auto-deploys to Vercel on push to `main` (src/ changes)
- **Deploy Devnet** (`deploy-devnet.yml`): Manual workflow to deploy programs to Solana devnet/mainnet
- **Publish SDK** (`publish-sdk.yml`): Manual workflow to publish `@zkcreditscore/sdk` to npm

### Production Build

```bash
# Full production build (includes all services)
.zscripts/build.sh

# Start with reverse proxy
.zscripts/start.sh
```

---

## 🗺 Roadmap

### Phase 1: Foundation (Months 1–6)
- [x] ZK Circuit design (CreditScore + Income)
- [x] Smart contracts v0.1 (Verifier + SBT deployed)
- [ ] Client app MVP (iOS + Chrome with AA integration)
- [ ] Lending pool v0.1 (USDC only)
- [ ] Security audit (Trail of Bits + OpenZeppelin)
- [ ] Trusted setup ceremony

### Phase 2: Mainnet Launch (Months 7–12)
- [ ] Mainnet launch on Solana
- [ ] ZKCR Token + Governance activation
- [ ] Multi-collateral support (SOL, USDC, wBTC, mSOL)
- [ ] Composite credit score (full tier system)
- [ ] Integration SDK v1.0
- [ ] $50M TVL target

### Phase 3: Expansion (Months 13–24)
- [ ] Eclipse L2 deployment (cross-chain credentials)
- [ ] Plaid integration (US/EU market entry)
- [ ] B2B API (white-label for DeFi protocols)
- [ ] Under-collateralized flash loans
- [ ] Mobile-first markets (India, Nigeria, Indonesia, Brazil)
- [ ] $500M TVL target

---

## ✅ Compliance & Privacy

- **GDPR / DPDP Act compliant** — Zero personal data stored on-chain
- **FATF Travel Rule compatible** — ZK proofs comply without exposing PII
- **India RBI AA framework** — Native integration with Sahamati
- **US person geofencing** — Compliance-ready for regulatory requirements
- **Anti-replay protection** — Nullifier mechanism prevents proof reuse
- **Credential expiry** — 30-day default, 7-day renewal notice

---

## 🤝 Contributing

Contributions are welcome! Please read our PRD (`ZKCreditScore_PRD.md`) for the full product specification and architectural guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <p>
    Built with ❤️ for a privacy-preserving financial future on Solana
  </p>
  <p>
    <a href="https://zkscore.credit">Website</a> •
    <a href="https://docs.zkscore.credit">Docs</a> •
    <a href="https://x.com/zkcreditscore">X</a> •
    <a href="https://discord.gg/zkcreditscore">Discord</a>
  </p>
</div>
