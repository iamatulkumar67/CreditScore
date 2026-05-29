# ZKCreditScore Protocol — Deployment Guide

---

## Vercel Deployment (Frontend)

### Prerequisites

- A Vercel account
- Vercel CLI installed (`npm i -g vercel`)

### Manual Deployment

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Automated Deployment

The landing page auto-deploys on every push to `main` via the `deploy-landing.yml` GitHub Actions workflow.

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token (create at https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel team/user ID (check `.vercel/project.json` or run `vercel teams list`) |
| `VERCEL_PROJECT_ID` | Vercel project ID (check `.vercel/project.json`) |

### Vercel Configuration

The `vercel.json` file at the project root configures the build:

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install && cd packages/sdk && npm run build",
  "git": {
    "deploymentEnabled": true
  }
}
```

Deployments are triggered on `main` branch pushes that change files under `src/`, `public/`, `package.json`, `next.config.*`, or `package-lock.json`.

---

## Solana Program Deployment

### Prerequisites

- Solana CLI v1.18.26 installed
- Anchor CLI v0.30.1 installed
- Deployer wallet with sufficient SOL balance (~5+ SOL for devnet, ~20+ SOL for mainnet)

### Manual Deployment (Devnet)

```bash
# Build all programs
cd anchor && anchor build

# Configure Solana for devnet
solana config set --url devnet

# Configure deployer wallet
solana config set --keypair ~/.config/solana/id.json

# Check balance
solana balance

# Fund if needed
solana airdrop 2

# Deploy all programs
./deploy.sh
```

### Manual Deployment (Mainnet)

```bash
# Build with release profile
cd anchor && anchor build

# Set mainnet
solana config set --url mainnet-beta

# Deploy each program individually
solana program deploy \
  --program-id target/deploy/zk_credit_verifier-keypair.json \
  target/deploy/zk_credit_verifier.so

solana program deploy \
  --program-id target/deploy/zk_lending_pool-keypair.json \
  target/deploy/zk_lending_pool.so

solana program deploy \
  --program-id target/deploy/zkc_token-keypair.json \
  target/deploy/zkc_token.so

solana program deploy \
  --program-id target/deploy/zk_governance-keypair.json \
  target/deploy/zk_governance.so
```

### Automated Deployment (Devnet/Mainnet)

The `deploy-devnet.yml` workflow supports manual dispatch to either `devnet` or `mainnet-beta`.

To trigger: **GitHub -> Actions -> Deploy to Solana Devnet -> Run workflow**

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `SOLANA_DEPLOY_KEYPAIR` | Full JSON array of the deploy authority keypair (e.g., `[123,45,...]`) |

### Post-Deployment Steps

1. Copy deployed program IDs to `packages/sdk/src/constants/index.ts`
2. Update `anchor/Anchor.toml` `[programs.devnet]` or `[programs.programs.mainnet]` sections
3. Run protocol initialization (migrations)

---

## CI/CD Pipelines

### CI Pipeline (`ci.yml`)

Triggers on push/PR to `main`. Runs four jobs in parallel:

| Job | Description |
|---|---|
| `anchor-build` | Installs Rust nightly, Solana CLI, Anchor CLI, builds all 4 programs, runs unit tests |
| `circom-build` | Installs Circom, compiles all 5 circuits |
| `sdk-build` | Builds TypeScript SDK (ESM + CJS), runs tests |
| `landing-build` | Installs npm deps, runs lint, builds Next.js |

Artifacts from each job are uploaded and retained for 3-7 days.

### Deploy Landing (`deploy-landing.yml`)

Triggers on push to `main` for `src/`, `public/`, `package.json`, `next.config.*`, `package-lock.json` changes.

Deploys to Vercel using `amondnet/vercel-action@v25`.

### Deploy Devnet (`deploy-devnet.yml`)

Manual dispatch workflow. Builds all 4 Anchor programs and deploys to the selected cluster (devnet or mainnet-beta).

### Publish SDK (`publish-sdk.yml`)

Manual dispatch workflow. Builds, versions (patch/minor/major), publishes to npm, and commits the version bump.

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `NPM_TOKEN` | npm automation token with `publish` permission |
| `GH_PAT` | (Optional) GitHub PAT with `repo` scope |

---

## Environment Configuration

### Environment Matrix

| Setting | Development | Staging | Production |
|---|---|---|---|
| Solana Cluster | Localnet / Devnet | Devnet | Mainnet-beta |
| RPC Endpoint | `http://127.0.0.1:8899` | `https://api.devnet.solana.com` | `https://api.mainnet-beta.solana.com` |
| Database | SQLite (dev.db) | SQLite / Postgres | Postgres |
| Wallet | Any (auto-connect) | Phantom | Phantom + Backpack |
| Proving Mode | Mock (instant) | snarkjs WASM | snarkjs WASM + WebGPU |

### Environment Variables by Environment

```env
# Development (.env)
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_SOLANA_RPC="http://127.0.0.1:8899"

# Staging
DATABASE_URL="file:./prisma/staging.db"
NEXT_PUBLIC_SOLANA_RPC="https://api.devnet.solana.com"

# Production
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SOLANA_RPC="https://api.mainnet-beta.solana.com"
```

---

## Domain Setup

### Custom Domain

The landing page is deployed at `zkscore.credit` via Vercel.

To configure a custom domain:
1. Go to **Vercel Dashboard -> Project -> Domains**
2. Add your domain (e.g., `zkscore.credit`)
3. Update DNS records at your registrar:

| Type | Name | Value |
|---|---|---|
| CNAME | `www` | `cname.vercel-dns.com` |
| A | `@` | `76.76.21.21` |
| A | `@` | `76.76.21.98` |

### Vercel DNS

Vercel automatically provisions SSL certificates via Let's Encrypt. DNS is managed through Vercel's nameservers for the apex domain.

### Caddyfile (Self-Hosted)

The project includes a `Caddyfile` for reverse proxy setups:

```caddy
:81 {
    @transform_port_query {
        query XTransformPort=*
    }
    handle @transform_port_query {
        reverse_proxy localhost:{query.XTransformPort}
    }
    handle {
        reverse_proxy localhost:3000
    }
}
```

---

## Release Process

### Versioning

The project follows **Semantic Versioning** (MAJOR.MINOR.PATCH):

| Component | Version File | Version |
|---|---|---|
| Frontend | `package.json` | `0.2.0` |
| SDK | `packages/sdk/package.json` | `0.1.0` |
| Programs | `anchor/programs/*/Cargo.toml` | `0.1.0` |
| Circuits | `circuits/package.json` | `0.1.0` |

### Changelog

All notable changes should be documented in GitHub Releases. Each release should include:

- Protocol version
- Program IDs (if changed)
- SDK version
- New features
- Bug fixes
- Breaking changes
- Upgrade instructions

### Tagging

```bash
git tag v0.2.0
git push origin v0.2.0
```

### Release Checklist

1. [ ] All CI pipelines pass
2. [ ] Programs deployed and verified on devnet
3. [ ] SDK built and tested
4. [ ] Changelog updated
5. [ ] Version bumped in all relevant files
6. [ ] Programs deployed to mainnet (if production release)
7. [ ] SDK published to npm (if SDK release)
8. [ ] Frontend deployed to Vercel
9. [ ] GitHub Release created with tag
