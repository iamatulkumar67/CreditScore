# ZKCreditScore Protocol — Development Setup

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | >= 18 | Frontend + SDK |
| Bun | Latest | Package manager |
| Rust | >= 1.81 | Anchor program compilation |
| Solana CLI | v1.18.26 | Chain interaction + deployment |
| Anchor CLI | v0.30.1 | Smart contract framework |
| Circom | 2.0+ | ZK circuit compilation |
| snarkjs | 0.7.x | ZK proof generation (client-side) |

---

## Environment Setup

### Windows

#### 1. Install Node.js and Bun

```bash
# Install Node.js from https://nodejs.org/ (version >= 18)

# Install Bun
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### 2. Install Rust

```bash
# Download and run rustup-init.exe from https://rustup.rs/
# After installation, restart terminal and verify:
rustc --version
cargo --version
```

#### 3. Install Solana CLI

```bash
# Download Solana installer for Windows:
# From PowerShell (as Administrator):
cmd /c "curl https://release.solana.com/v1.18.26/solana-install-init-x86_64-pc-windows-msvc.msi -o solana-install.msi && start solana-install.msi"

# After installation, verify:
solana --version
```

#### 4. Install Anchor CLI

```bash
# Install via cargo (requires Rust build tools)
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked

# Verify:
anchor --version
```

#### 5. Install Circom

```bash
# Clone and build Circom
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
# The binary will be at target/release/circom.exe
# Add it to your PATH
```

#### 6. Install snarkjs globally

```bash
npm install -g snarkjs
```

### macOS / Linux

Run the automated setup script:

```bash
curl -sSL https://raw.githubusercontent.com/iamatulkumar67/CreditScore/main/scripts/setup-dev.sh | bash
```

Or install manually:

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI v1.18.26
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"

# Anchor CLI v0.30.1
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked

# Circom
git clone https://github.com/iden3/circom.git /tmp/circom
cd /tmp/circom && cargo build --release && sudo install -m 755 target/release/circom /usr/local/bin/circom

# Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# Bun
curl -fsSL https://bun.sh/install | bash

# snarkjs
npm install -g snarkjs
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/iamatulkumar67/CreditScore.git
cd CreditScore

# Install frontend dependencies
bun install

# Build the SDK
cd packages/sdk && npm run build && cd ../..

# Set up the SQLite database
bun run db:push
```

---

## Running Locally

### Frontend Development Server

```bash
bun run dev
# Opens at http://localhost:3000
```

The dev server includes hot module replacement and logs to `dev.log`.

### Anchor Smart Contracts

```bash
cd anchor

# Build all four programs
anchor build

# Run tests (starts local validator automatically)
anchor test

# Deploy to localnet
anchor deploy
```

### ZK Circuits

```bash
cd circuits

# Install circom dependencies
npm install

# Compile all circuits
npm run compile:all

# Or compile individually
npm run compile:credit
npm run compile:income
npm run compile:dti
npm run compile:default
npm run compile:composite
```

### SDK

```bash
cd packages/sdk

# Build ESM + CJS
npm run build

# Run tests
npm test
```

### Database Commands

```bash
# Push schema changes to SQLite
bun run db:push

# Generate/regenerate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Reset database
bun run db:reset
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
```

| Variable | Description | Required | Default | Example |
|---|---|---|---|---|
| `DATABASE_URL` | SQLite database file path | Yes | `file:./prisma/dev.db` | `file:./prisma/prod.db` |
| `NEXT_PUBLIC_SOLANA_RPC` | Solana RPC endpoint URL | No | `https://api.devnet.solana.com` | `https://api.mainnet-beta.solana.com` |
| `NEXT_PUBLIC_VERIFIER_PROGRAM_ID` | zk-credit-verifier program ID | No | SDK default | `9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh` |
| `NEXT_PUBLIC_LENDING_POOL_PROGRAM_ID` | zk-lending-pool program ID | No | SDK default | `HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo` |
| `NEXT_PUBLIC_ZKC_TOKEN_PROGRAM_ID` | zkc-token program ID | No | SDK default | `4A1AR7H5VHQzwM7QuucYDHKTrQWt9HQ1GyEB4gh4pump` |

All `NEXT_PUBLIC_*` variables are optional — the SDK provides sensible defaults for all protocol constants.

---

## Wallet Setup

### Phantom for Local Development

1. Install the **Phantom** browser extension
2. Create a new wallet or import an existing one
3. Switch to **Solana Devnet**:
   - Open Phantom
   - Settings -> Network -> "Devnet"
4. Get Devnet SOL for testing:
   ```bash
   solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
   ```
   Or use the faucet at https://faucet.solana.com

---

## Troubleshooting

See [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

### Quick Fixes

**"bun not found"** — Install Bun via `powershell -c "irm bun.sh/install.ps1 | iex"` (Windows) or `curl -fsSL https://bun.sh/install | bash` (macOS/Linux).

**"anchor not found"** — Run `cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked`. Install may take 15-20 minutes.

**"circom not found"** — Clone and build from source: `git clone https://github.com/iden3/circom.git && cd circom && cargo build --release`.

**"Module not found: zkcreditscore-sdk"** — Build the SDK first: `cd packages/sdk && npm run build`.
