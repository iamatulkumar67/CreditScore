#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
POT_DIR="$ROOT_DIR"

if ! command -v snarkjs &>/dev/null; then
  export PATH="$ROOT_DIR/node_modules/.bin:$PATH"
fi

echo "=== Phase 1: Powers of Tau ==="
# Generate Powers of Tau (ceremony)
snarkjs powersoftau new bn128 14 "$POT_DIR/pot14_0000.ptau" -v
snarkjs powersoftau contribute "$POT_DIR/pot14_0000.ptau" "$POT_DIR/pot14_0001.ptau" \
  --name="First contribution" -v -e="$(openssl rand -hex 32 2>/dev/null || echo 'random')"
snarkjs powersoftau prepare phase2 "$POT_DIR/pot14_0001.ptau" "$POT_DIR/pot14_final.ptau" -v
snarkjs powersoftau verify "$POT_DIR/pot14_final.ptau"

echo ""
echo "=== Phase 2: Groth16 Setup per circuit ==="
CIRCUITS=(
  "credit_score:credit_score_above"
  "income:income_above"
  "dti:dti_below"
  "default:no_default"
  "composite:composite_credit_score"
)

for entry in "${CIRCUITS[@]}"; do
  SUBDIR="${entry%%:*}"
  CIRCUIT="${entry##*:}"
  R1CS="$BUILD_DIR/$SUBDIR/${CIRCUIT}.r1cs"
  ZKEY0="$BUILD_DIR/$SUBDIR/${CIRCUIT}_0000.zkey"
  ZKEY_FINAL="$BUILD_DIR/$SUBDIR/${CIRCUIT}_final.zkey"
  VK_JSON="$BUILD_DIR/$SUBDIR/verification_key.json"

  if [ ! -f "$R1CS" ]; then
    echo "  Skipping $CIRCUIT — r1cs not found (run compile.sh first)"
    continue
  fi

  echo "  Setting up $CIRCUIT..."
  snarkjs groth16 setup "$R1CS" "$POT_DIR/pot14_final.ptau" "$ZKEY0"
  snarkjs zkey contribute "$ZKEY0" "$ZKEY_FINAL" --name="1st contributor" -v
  snarkjs zkey export verificationkey "$ZKEY_FINAL" "$VK_JSON"
  echo "  -> $VK_JSON"
done

echo ""
echo "=== Phase 3: Export to public/circuits/ ==="
PUBLIC_DIR="$ROOT_DIR/../public/circuits"
for entry in "${CIRCUITS[@]}"; do
  SUBDIR="${entry%%:*}"
  CIRCUIT="${entry##*:}"
  SRC_DIR="$BUILD_DIR/$SUBDIR"
  DEST_DIR="$PUBLIC_DIR/$CIRCUIT"
  mkdir -p "$DEST_DIR"

  WASM_SRC="$SRC_DIR/${CIRCUIT}_js/${CIRCUIT}.wasm"
  ZKEY_SRC="$SRC_DIR/${CIRCUIT}_final.zkey"
  VK_SRC="$SRC_DIR/verification_key.json"

  if [ ! -f "$WASM_SRC" ] || [ ! -f "$ZKEY_SRC" ] || [ ! -f "$VK_SRC" ]; then
    echo "  Skipping $CIRCUIT — artifacts incomplete"
    continue
  fi

  cp "$WASM_SRC" "$DEST_DIR/${CIRCUIT}.wasm"
  cp "$ZKEY_SRC" "$DEST_DIR/${CIRCUIT}_final.zkey"
  cp "$VK_SRC" "$DEST_DIR/verification_key.json"
  echo "  -> $DEST_DIR"
done

echo ""
echo "=== Setup complete ==="
