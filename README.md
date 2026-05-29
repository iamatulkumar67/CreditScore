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
    <a href="#project-overview">Overview</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="docs/ARCHITECTURE.md">Architecture Docs</a> •
    <a href="docs/API.md">API Docs</a>
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

## Project Overview

ZKCreditScore is a **privacy-preserving, decentralized lending protocol** built on **Solana** that uses **Zero-Knowledge Proofs (ZKPs)** to enable **under-collateralized loans** based on real-world creditworthiness — without revealing sensitive financial data.

Every DeFi lending protocol today requires **125–200% overcollateralization**. A borrower must lock $1,500–$2,000 to borrow $1,000. This makes DeFi lending capital-inefficient and excludes retail users, small businesses, and productive credit use cases — a **$10.3 trillion underserved market**.

The key innovation is the use of **Groth16 ZK proofs** to bridge off-chain credit data with on-chain DeFi. Users connect their financial data locally (bank statements, credit bureau reports, income proofs), generate a ZK proof on their own device (<30 seconds), and submit only the proof on-chain. The protocol verifies specific boolean claims (e.g., "credit score > 700") without ever seeing the underlying data. A Soulbound Token (SBT) credential is issued, enabling loans at **50–80% collateral ratios** — up to **2x more capital efficient** than standard DeFi.

| Feature | ZKCreditScore | Aave / Compound | Maple Finance | Spectral |
|---|---|---|---|---|
| **Collateral Ratio** | 50–150% (tier-based) | 125–200% | 100–150% | 150%+ |
| **Credit Data** | Off-chain (bank, bureau, income) | None | Off-chain (centralized) | On-chain only |
| **Privacy** | ZK — zero data exposure | N/A | KYC required | On-chain transparent |
| **Permissionless** | Yes | Yes | Whitelisted | Yes |
| **Capital Efficiency** | Up to 2x more efficient | Low | Moderate | Low |

---

## Architecture

The system is organized into three layers:

- **User Layer** — Client-side ZK proof generation via Circom/snarkjs WASM, wallet integration (Phantom), and the Next.js frontend.
- **Blockchain Layer** — Four Anchor programs on Solana: zk-credit-verifier, zk-lending-pool, zkc-token, and zk-governance.
- **Data Connector Layer** — Plaid, CIBIL, Account Aggregator (India), and zkTLS (Reclaim Protocol) for fetching financial data.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a detailed system architecture breakdown, including ASCII diagrams, smart contract specifications, ZK circuit descriptions, and data flow.

---

## Tech Stack

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
| **SDK** | TypeScript (ESM + CJS, published as `zkcreditscore-sdk`) |
| **Database** | SQLite via Prisma (dev) |
| **CI/CD** | GitHub Actions, Vercel |
| **Auth** | Solana wallet signatures (no traditional auth) |
| **Reverse Proxy** | Caddy |

---

## Project Structure

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
│   └── lib/                      # Utilities, types, DB client, SDK init
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
│   └── sdk/                      # zkcreditscore-sdk TypeScript package
│       └── src/
│           ├── prover/           # Client-side ZK proof generation
│           ├── solana/           # Anchor program interaction
│           ├── api/              # REST API client
│           ├── integration/      # DeFi integration helpers
│           ├── connectors/       # Data source connectors (Plaid)
│           ├── types/            # TypeScript type definitions
│           └── constants/        # Program IDs, configs, network URLs
├── prisma/                       # Prisma schema (SQLite)
├── scripts/                      # Dev setup scripts, key generation
├── .github/workflows/            # CI/CD pipelines
└── .zscripts/                    # Build/deploy automation scripts
```

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **Bun** (package manager)
- **Rust** >= 1.81 + **Solana CLI** v1.18.26 + **Anchor CLI** v0.30.1 (for smart contracts)
- **Circom** 2.0+ (for ZK circuits)

### Clone & Install

```bash
git clone https://github.com/iamatulkumar67/CreditScore.git
cd CreditScore

# Install frontend dependencies
bun install

# Build SDK
cd packages/sdk && npm run build && cd ../..

# Set up database
bun run db:push
```

### Run Development Server

```bash
bun run dev
# Opens at http://localhost:3000
```

### Build for Production

```bash
bun run build

# Start production server
bun run start
```

### Run Tests

```bash
# Frontend lint
bun run lint

# Anchor tests
cd anchor && anchor test

# SDK tests
cd packages/sdk && npm test
```

---

## Environment Variables

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | SQLite database file path | `file:./prisma/dev.db` | Yes |
| `NEXT_PUBLIC_SOLANA_RPC` | Solana RPC endpoint | `https://api.devnet.solana.com` | No |
| `NEXT_PUBLIC_VERIFIER_PROGRAM_ID` | zk-credit-verifier program ID | SDK default | No |
| `NEXT_PUBLIC_LENDING_POOL_PROGRAM_ID` | zk-lending-pool program ID | SDK default | No |
| `NEXT_PUBLIC_ZKC_TOKEN_PROGRAM_ID` | zkc-token program ID | SDK default | No |

---

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start Next.js dev server on port 3000 |
| `bun run build` | Build Next.js for production (standalone) |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint across the project |
| `bun run db:push` | Push Prisma schema to SQLite |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run Prisma migrations |
| `npm test` (packages/sdk) | Run SDK tests |

---

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, smart contracts, ZK circuits, data flow |
| [SETUP.md](docs/SETUP.md) | Development environment setup guide |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel, Solana program, and CI/CD deployment |
| [API.md](docs/API.md) | REST API and SDK API reference |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [FEATURES.md](docs/FEATURES.md) | Feature documentation (ZK proofs, lending, staking, governance) |
| [ZKCreditScore_PRD.md](ZKCreditScore_PRD.md) | Full product requirements document |

---

## Contributing

Contributions are welcome! Please read the PRD (`ZKCreditScore_PRD.md`) for the full product specification.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.

---

<div align="center">
  <p>
    <a href="https://zkscore.credit">Website</a> •
    <a href="https://docs.zkscore.credit">Docs</a> •
    <a href="https://x.com/zkcreditscore">X</a> •
    <a href="https://discord.gg/zkcreditscore">Discord</a>
  </p>
</div>
