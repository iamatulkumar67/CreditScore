#!/usr/bin/env bash
set -euo pipefail

# ─── ZKCreditScore — Full Devnet Deployment ───────────────────────────────
# Prerequisites: Solana CLI, Anchor CLI 0.30.1, Node.js, yarn/npm
# Usage: bash deploy.sh
# ──────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }

# Step 0: Check tooling
log "Checking prerequisites..."
command -v solana >/dev/null 2>&1 || fail "solana CLI not found"
command -v anchor  >/dev/null 2>&1 || fail "anchor CLI not found"
command -v node    >/dev/null 2>&1 || fail "node not found"
ok "All CLI tools available"

# Step 1: Configure Solana for devnet
log "Configuring Solana for devnet..."
solana config set --url devnet
solana config get
ok "Solana configured for devnet"

# Step 2: Check/fund deployer
DEPLOYER=$(solana address)
BALANCE=$(solana balance | awk '{print $1}')
log "Deployer: $DEPLOYER"
log "Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 5" | bc -l) )); then
  NEED=$(( 5 - $(echo "$BALANCE" | cut -d. -f1) ))
  warn "Low balance — airdropping..."
  for i in $(seq 1 $NEED); do
    solana airdrop 2 2>/dev/null || solana airdrop 1 2>/dev/null || true
    sleep 2
  fi
  BALANCE=$(solana balance | awk '{print $1}')
  ok "New balance: $BALANCE SOL"
fi

# Step 3: Install npm deps
log "Installing dependencies..."
cd "$(dirname "$0")"
npm install 2>&1 | tail -1
ok "Dependencies installed"

# Step 4: Build all programs
log "Building programs (this takes a while)..."
anchor build
ok "All programs built"

# Step 5: Deploy all programs
log "Deploying to devnet..."
for program in zk_credit_verifier zk_lending_pool zkc_token zk_governance; do
  log "  Deploying $program..."
  anchor deploy --program-name "$program" --provider.cluster devnet
  ok "$program deployed"
done

# Step 6: Verify deployment
log "Verifying deployment..."
for program in zk_credit_verifier zk_lending_pool zkc_token zk_governance; do
  ADDRESS=$(solana program show --programs | grep -A1 "$program" | tail -1 | awk '{print $1}' 2>/dev/null || echo "unknown")
  ok "$program → $ADDRESS"
done

# Step 7: Run migration (init protocol state)
log "Running protocol initialization..."
anchor run init-protocol 2>/dev/null || {
  warn "Migration script not registered in Anchor.toml — running directly:"
  npx ts-node migrations/deploy.ts
}

log "────────────────────────────────────────"
log "${GREEN}ZKCreditScore deployed to devnet!${NC}"
log "Deployer: $DEPLOYER"
log "Next steps:"
log "  1. Copy the deployed program IDs to packages/sdk/src/constants/index.ts"
log "  2. Update anchor/Anchor.toml [programs.devnet] if IDs changed"
log "  3. Run tests: anchor test --skip-deploy --provider.cluster devnet"
log "────────────────────────────────────────"
