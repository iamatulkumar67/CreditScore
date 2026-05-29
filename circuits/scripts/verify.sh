#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"

if ! command -v snarkjs &>/dev/null; then
  export PATH="$ROOT_DIR/node_modules/.bin:$PATH"
fi

echo "=== Verifying ZK circuit artifacts ==="

all_pass=true
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
  DIR="$BUILD_DIR/$SUBDIR"

  echo ""
  echo "--- $CIRCUIT ---"

  # Check artifacts exist
  R1CS="$DIR/${CIRCUIT}.r1cs"
  WASM="$DIR/${CIRCUIT}_js/${CIRCUIT}.wasm"
  VK="$DIR/verification_key.json"
  ZKEY="$DIR/${CIRCUIT}_final.zkey"

  missing=0
  for f in "$R1CS" "$WASM" "$VK" "$ZKEY"; do
    if [ ! -f "$f" ]; then
      echo "  MISSING: $f"
      missing=1
    fi
  done

  if [ "$missing" -eq 1 ]; then
    echo "  FAIL: $CIRCUIT artifacts incomplete"
    all_pass=false
    continue
  fi

  echo "  r1cs:  $(wc -c < "$R1CS") bytes"
  echo "  wasm:  $(wc -c < "$WASM") bytes"
  echo "  zkey:  $(wc -c < "$ZKEY") bytes"
  echo "  vk:    $VK"

  # Verify r1cs constraints
  snarkjs r1cs info "$R1CS"

  # Verify zkey matches r1cs
  snarkjs zkey verify "$R1CS" "$ZKEY" || {
    echo "  FAIL: zkey verification failed for $CIRCUIT"
    all_pass=false
    continue
  }

  echo "  PASS: $CIRCUIT"
done

echo ""
if [ "$all_pass" = true ]; then
  echo "=== All circuits verified successfully ==="
else
  echo "=== Some circuits failed verification ==="
  exit 1
fi

# Optional: Generate a test proof using dummy input
echo ""
echo "=== Test proof generation (credit_score_above) ==="
CS_DIR="$BUILD_DIR/credit_score"
CS_CIRCUIT="credit_score_above"
if [ -f "$CS_DIR/${CS_CIRCUIT}_js/${CS_CIRCUIT}.wasm" ] && [ -f "$CS_DIR/${CS_CIRCUIT}_final.zkey" ]; then
  cat > /tmp/proof_input.json <<EOF
{
  "creditScore": 750,
  "bureauTimestamp": 1700000000,
  "salt": 12345,
  "addressCommitment": "1234567890123456789012345678901234567890123456789012345678901234",
  "thresholdPublic": 700,
  "nullifier": "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  "expiryTimestamp": 1800000000
}
EOF

  snarkjs groth16 fullprove \
    /tmp/proof_input.json \
    "$CS_DIR/${CS_CIRCUIT}_js/${CS_CIRCUIT}.wasm" \
    "$CS_DIR/${CS_CIRCUIT}_final.zkey" \
    /tmp/proof.json /tmp/public.json

  echo "Test proof generated at /tmp/proof.json"
  echo "Public signals at /tmp/public.json"

  # Verify the proof
  snarkjs groth16 verify \
    "$CS_DIR/verification_key.json" \
    /tmp/public.json \
    /tmp/proof.json

  echo "Test proof verification SUCCESS"
else
  echo "Skipping test proof — credit_score artifacts missing"
fi
