# ZKCreditScore — Solana Devnet Deployment Guide

## Prerequisites

- Solana CLI v1.18.26 (`solana --version`)
- Anchor CLI v0.30.1 (`anchor --version`)
- Rust 1.75+ (`rustc --version`)
- A funded devnet wallet

## Step 1: Configure Solana for Devnet

```bash
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json
```

## Step 2: Fund Your Wallet

Each program requires ~2-2.5 SOL for deployment. Total needed: **~9 SOL**.

```bash
# Check your address
solana address

# Airdrop SOL (max 2 SOL per request on devnet)
solana airdrop 2
solana airdrop 2
solana airdrop 2
solana airdrop 2
solana airdrop 2

# Verify balance
solana balance
```

> Note: Devnet airdrops may be rate-limited. Wait 30 seconds between requests.

## Step 3: Build the Programs

```bash
cd anchor

# Set HOME env var (Windows only)
set HOME=%USERPROFILE%

# Build all programs (skip IDL due to anchor-syn 0.30.1 nightly requirement)
anchor build --no-idl
```

### Verify Build Output

```bash
# Check .so files exist in target/deploy/
ls target/deploy/*.so
```

Expected output:
- `zk_credit_verifier.so` (~263 KB)
- `zk_lending_pool.so` (~315 KB)
- `zkc_token.so` (~349 KB)
- `zk_governance.so` (~319 KB)

## Step 4: Deploy Programs to Devnet

Deploy each program individually:

```bash
# Deploy zk-credit-verifier
solana program deploy target/deploy/zk_credit_verifier.so --program-id target/deploy/zk_credit_verifier-keypair.json

# Deploy zk-lending-pool
solana program deploy target/deploy/zk_lending_pool.so --program-id target/deploy/zk_lending_pool-keypair.json

# Deploy zkc-token
solana program deploy target/deploy/zkc_token.so --program-id target/deploy/zkc_token-keypair.json

# Deploy zk-governance
solana program deploy target/deploy/zk_governance.so --program-id target/deploy/zk_governance-keypair.json
```

Or deploy all at once with Anchor:

```bash
anchor deploy --provider.cluster devnet
```

## Step 5: Verify Deployment

```bash
# Verify each program is deployed
solana program show 9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh
solana program show HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo
solana program show AdeWp5SXbwMtb3Mr9FTfpygPGzHoTdGqxAu3EKmmXRTQ
solana program show 4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT
```

## Program IDs

| Program | ID |
|---------|-----|
| zk-credit-verifier | `9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh` |
| zk-lending-pool | `HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo` |
| zkc-token | `AdeWp5SXbwMtb3Mr9FTfpygPGzHoTdGqxAu3EKmmXRTQ` |
| zk-governance | `4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT` |

## Step 6: Initialize Programs (Post-Deployment)

After deployment, initialize each program's config accounts:

### Initialize Verifier Config
```typescript
await program.methods.initializeConfig().rpc();
```

### Initialize Lending Pool
```typescript
await program.methods.initializePool({
  baseRate: new BN(200),        // 2% base rate
  optimalUtilization: new BN(80), // 80% optimal
  slope1: new BN(800),          // 8% slope1
  slope2: new BN(7500),         // 75% slope2
  paused: false,
}).accounts({ mint: USDC_MINT }).rpc();
```

### Initialize ZKC Token
```typescript
await program.methods.initializeToken(
  new BN(1_000_000_000_000_000_000) // 1B tokens with 9 decimals
).rpc();
```

### Initialize Governance
```typescript
await program.methods.initialize().rpc();
```

## Troubleshooting

### "Insufficient funds"
Request more airdrops or wait for rate limits to reset.

### "Program already deployed"
Use `solana program deploy --program-id <keypair> --upgrade-authority <your-wallet>` to upgrade.

### Build fails with "edition2024" errors
The Cargo.lock has pinned dependencies. If you delete it, regenerate with:
```bash
# Use the Solana platform-tools cargo to generate compatible lockfile
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo generate-lockfile
# Then pin problematic deps:
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update blake3 --precise 1.5.1
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update borsh@1.6.1 --precise 1.5.3
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update proc-macro-crate@3.5.0 --precise 3.2.0
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update serde_json --precise 1.0.133
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update serde_bytes --precise 0.11.15
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update bitflags@2.11.1 --precise 2.6.0
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update serde --precise 1.0.217
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update unicode-segmentation --precise 1.12.0
~/.cache/solana/v1.41/platform-tools/rust/bin/cargo update indexmap@2.14.0 --precise 2.7.0
```

### IDL generation fails
This is a known issue with anchor-syn 0.30.1 on stable Rust. Use `anchor build --no-idl` to skip IDL generation. The programs deploy and work without IDLs.
