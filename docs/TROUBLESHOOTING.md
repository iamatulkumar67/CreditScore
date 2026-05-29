# ZKCreditScore Protocol — Troubleshooting Guide

---

## Blank Screen on /app

### Symptoms
- The `/app` dashboard page loads a blank white/dark screen
- No error visible in the UI
- JavaScript console shows errors

### Causes and Solutions

**Missing Phantom Wallet Extension**

If Phantom is not installed, `@solana/wallet-adapter-phantom` will throw.

- **Solution:** Install Phantom from https://phantom.app
- After installing, reload the page

**Solana Wallet Adapter Styles Not Loaded**

The app tries to dynamically import `@solana/wallet-adapter-react-ui/styles.css`. If this fails, the modal may not render.

- **Fix in code:** The error is caught with `console.warn` — not critical
- If the modal button appears but does nothing, ensure your node_modules are properly installed: `bun install`

**React Strict Mode Double-Render**

`next.config.ts` has `reactStrictMode: false` — if you re-enable it, wallet adapter may cause issues.

- **Solution:** Keep `reactStrictMode: false` in `next.config.ts`

**ErrorBoundary Catch**

The app page wraps in an `ErrorBoundary`. If you see the error fallback UI ("Something went wrong"):

1. Check the browser console for the actual error message
2. Common cause: `ZKProver` import failing because snarkjs is not installed
3. Fix: The SDK uses try/catch for snarkjs — ensure circuits are configured or use mock mode

---

## Wallet Connection Issues

### Phantom Not Detected

- **Cause:** Phantom extension not installed or not enabled for this site
- **Fix:** Install Phantom from https://phantom.app. Ensure it's enabled and you're logged in.
- **Verify:** Check `window.solana` in the browser console — should return the Phantom provider object

### Network Mismatch

- **Symptom:** Wallet connects but transactions fail
- **Cause:** Phantom is on Mainnet, but the app expects Devnet
- **Fix:** In Phantom: Settings -> Network -> Switch to "Devnet"

### Auto-Connect Fails

- **Symptom:** "Connecting..." spinner never resolves
- **Causes:**
  - Phantom not unlocked
  - Previously connected site permissions revoked
- **Fixes:**
  - Unlock Phantom wallet
  - Go to Phantom -> Settings -> Connected Sites -> Remove zkscore.credit, then reconnect
  - Reload the page

### "wallet-adapter-react-ui/styles.css" Missing

- **Symptom:** Wallet modal button appears but modal does not open
- **Fix:** Ensure `@solana/wallet-adapter-react-ui` is in `package.json` and installed. If using custom bundler, you may need to import the CSS manually:

```typescript
import "@solana/wallet-adapter-react-ui/styles.css";
```

---

## SDK Import Errors

### "Module not found: zkcreditscore-sdk"

- **Cause:** SDK not built before frontend start
- **Fix:**

```bash
cd packages/sdk && npm run build && cd ../..
```

The `postinstall` script in `package.json` runs this automatically, but if you install deps separately it may be missed.

### "Cannot find module 'snarkjs'"

- **Cause:** snarkjs is an optional dependency of the SDK and may not be installed
- **Fix:**

```bash
npm install snarkjs
```

If snarkjs is unavailable, `ZKProver` will fall back to mock proofs. Real proof generation requires snarkjs WASM files.

### TypeScript Path Alias Not Resolved

- **Symptom:** `import {...} from 'zkcreditscore-sdk'` works in production but not in IDE
- **Cause:** TypeScript path aliases in `tsconfig.json` need IDE restart
- **Fix:**
  1. Ensure `tsconfig.json` has the paths entry:
  ```json
  {
    "paths": {
      "zkcreditscore-sdk": ["./packages/sdk/src/index.ts"],
      "zkcreditscore-sdk/*": ["./packages/sdk/src/*"]
    }
  }
  ```
  2. Restart TypeScript server in your IDE

### SDK Dual Package (ESM + CJS) Issues

- If using ESM (`import`), ensure `package.json` has `"type": "module"` or use `.mjs` extension
- If using CJS (`require`), ensure you're using the CJS entry: `const { SolanaSDK } = require('zkcreditscore-sdk')`

---

## Anchor Build Errors

### "BPF SDK not found"

- **Cause:** Solana CLI BPF toolchain not installed
- **Fix:**

```bash
solana config set --url devnet
# The BPF SDK is bundled with Solana CLI. Ensure it's the correct version (1.18.26).
# Reinstall if needed:
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
```

### "anchor build" fails on Windows

- **Cause:** Anchor CLI on Windows has known issues with BPF compilation
- **Solutions:**
  1. Use WSL2 (Windows Subsystem for Linux) for development
  2. Build in a DevContainer
  3. Use GitHub Actions CI for builds

### Rust Compilation Errors

**"Unable to find BPF linker"**

```bash
rustup component add rust-src
```

**"No such file or directory: 'solana-bpf-linker'"**

Ensure Solana CLI is properly installed and `~/.local/share/solana/install/active_release/bin` (or equivalent Windows path) is in your PATH.

**"error[E0463]: can't find crate for `core`"**

```bash
rustup target add bpfel-unknown-unknown
```

### Anchor Version Mismatch

The project uses Anchor 0.30.1. If you have a different version installed:

```bash
# Check current version
anchor --version

# Install correct version
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked
```

---

## Circuit Compilation Issues

### "circom not found"

- **Cause:** Circom binary not installed or not in PATH
- **Fix:**

```bash
# Clone and build
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release

# Add to PATH (macOS/Linux)
sudo install -m 755 target/release/circom /usr/local/bin/circom

# Windows: add target/release/circom.exe to your PATH manually
```

### Out of Memory During Compilation

Complex circuits like `composite_credit_score.circom` may require significant RAM.

- **On Linux/macOS:** Increase swap
- **On Windows:** Close memory-intensive applications
- **Alternative:** Compile circuits individually (not `compile:all`)

```bash
npm run compile:credit
npm run compile:income
# etc.
```

### "cannot find module 'circomlib/circuits/..." 

- **Cause:** `circomlib` npm package not installed
- **Fix:**

```bash
cd circuits
npm install
```

---

## Vercel Build Failures

### "Build failed: Command "npm install && cd packages/sdk && npm run build" exited with 1"

- **Cause:** SDK build fails during Vercel deployment
- **Solutions:**
  1. Check that SDK builds locally first: `cd packages/sdk && npm run build`
  2. Ensure the SDK's `tsconfig.json` has proper output configuration
  3. If the SDK has unmet peer dependencies, Vercel may fail — ensure `package.json` has them listed

### "Error: Cannot find module 'next'"

- **Cause:** `node_modules` not properly installed
- **Fix:** Ensure `installCommand` in `vercel.json` is correct. The default installs npm deps from `package-lock.json`. If using bun locally, ensure `package-lock.json` is committed.

### "Output directory .next not found"

- **Cause:** Next.js build failed silently
- **Check:** Vercel build logs for actual error. Common causes:
  - Syntax error in a component
  - Missing import
  - TypeScript error (the project has `ignoreBuildErrors: true`, but fatal errors may still occur)

### TypeScript Errors Despite ignoreBuildErrors

`next.config.ts` has `ignoreBuildErrors: true`, but some TypeScript errors can still fail the build if they are truly syntactically fatal. Check for `any` type misuse or incorrect imports.

---

## Getting Help

### GitHub Issues

Report bugs and feature requests at: https://github.com/iamatulkumar67/CreditScore/issues

When reporting an issue, please include:
- Browser and OS version
- Node.js and npm/Bun versions
- Steps to reproduce
- Full error message and stack trace
- Console output (screenshots or text)

### Discord

Join the community: https://discord.gg/zkcreditscore

### Twitter / X

Follow for updates: https://x.com/zkcreditscore
