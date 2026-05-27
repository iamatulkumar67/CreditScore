#!/usr/bin/env bash
# setup-dev.sh — install all ZKCreditScore development toolchains
# Run: curl -sSL https://raw.githubusercontent.com/iamatulkumar67/CreditScore/main/scripts/setup-dev.sh | bash

set -euo pipefail

echo "=== ZKCreditScore Dev Environment Setup ==="
echo ""

# 1. Rust
if ! command -v rustc &>/dev/null; then
  echo "Installing Rust..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
  source "$HOME/.cargo/env"
fi
echo "Rust: $(rustc --version)"

# 2. Solana CLI
if ! command -v solana &>/dev/null; then
  echo "Installing Solana CLI v1.18.26..."
  sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
fi
echo "Solana: $(solana --version)"

# 3. Anchor CLI
if ! command -v anchor &>/dev/null; then
  echo "Installing Anchor CLI v0.30.1..."
  cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked
fi
echo "Anchor: $(anchor --version)"

# 4. Circom
if ! command -v circom &>/dev/null; then
  echo "Installing Circom..."
  git clone https://github.com/iden3/circom.git /tmp/circom
  cd /tmp/circom
  cargo build --release
  sudo install -m 755 target/release/circom /usr/local/bin/circom
  cd -
  rm -rf /tmp/circom
fi
echo "Circom: $(circom --version)"

# 5. Node + pnpm
if ! command -v node &>/dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node: $(node --version)"
echo "npm: $(npm --version)"

# 6. snarkjs
npm install -g snarkjs 2>/dev/null || true

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "  cd anchor && anchor build"
echo "  cd circuits && npm run compile:all"
echo "  cd packages/sdk && npm install && npm run build"
