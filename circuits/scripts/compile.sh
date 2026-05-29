#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
CIRCOMLIB_DIR="$ROOT_DIR/node_modules/circomlib/circuits"
CIRCUITS=(
  "credit_score_above:credit_score"
  "income_above:income"
  "dti_below:dti"
  "no_default:default"
  "composite_credit_score:composite"
)

# Ensure circom is installed
if ! command -v circom &>/dev/null; then
  echo "Error: circom not found. Install it first:"
  echo "  git clone https://github.com/iden3/circom.git"
  echo "  cd circom && cargo build --release && cargo install --path circom"
  exit 1
fi

# Ensure snarkjs is installed
if ! command -v snarkjs &>/dev/null; then
  if [ ! -f "$ROOT_DIR/node_modules/.bin/snarkjs" ]; then
    echo "Installing npm dependencies..."
    cd "$ROOT_DIR" && npm install
  fi
  export PATH="$ROOT_DIR/node_modules/.bin:$PATH"
fi

echo "=== Compiling ZK circuits ==="
for entry in "${CIRCUITS[@]}"; do
  CIRCUIT="${entry%%:*}"
  SUBDIR="${entry##*:}"
  OUT_DIR="$BUILD_DIR/$SUBDIR"
  mkdir -p "$OUT_DIR"

  echo "  Compiling $CIRCUIT.circom -> $OUT_DIR"
  circom "$ROOT_DIR/$CIRCUIT.circom" \
    -l "$CIRCOMLIB_DIR" \
    --r1cs --wasm --sym \
    -o "$OUT_DIR"
done

echo ""
echo "=== Compilation complete ==="
echo "Output artifacts:"
find "$BUILD_DIR" -type f | sort
