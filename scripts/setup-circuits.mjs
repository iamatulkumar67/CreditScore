/**
 * ZK Circuit Setup Script
 *
 * Handles the full circuit lifecycle:
 *   1. Compile .circom files to R1CS + WASM (requires circom)
 *   2. Powers of Tau ceremony (phase 1)
 *   3. Per-circuit Groth16 setup (phase 2)
 *   4. Export WASM + zkey + verification_key.json to public/circuits/
 *
 * If circom is not installed, generates mock artifacts for devnet testing.
 *
 * Usage: node scripts/setup-circuits.mjs [--mock]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CIRCUITS_DIR = path.join(ROOT, 'circuits');
const BUILD_DIR = path.join(CIRCUITS_DIR, 'build');
const PUBLIC_DIR = path.join(ROOT, 'public', 'circuits');
const CIRCOMLIB_DIR = path.join(CIRCUITS_DIR, 'node_modules', 'circomlib', 'circuits');
const POT_FILE = path.join(BUILD_DIR, 'pot14_final.ptau');

// Circuit definitions: [name, build subdirectory]
const CIRCUITS = [
  { name: 'credit_score_above', subdir: 'credit_score' },
  { name: 'income_above', subdir: 'income' },
  { name: 'dti_below', subdir: 'dti' },
  { name: 'no_default', subdir: 'default' },
  { name: 'composite_credit_score', subdir: 'composite' },
];

const FORCE_MOCK = process.argv.includes('--mock');

function run(cmd, cwd = ROOT) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function commandExists(cmd) {
  try {
    execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getSnarkjsBin() {
  const localBin = path.join(CIRCUITS_DIR, 'node_modules', '.bin', 'snarkjs');
  if (fs.existsSync(localBin) || fs.existsSync(localBin + '.cmd')) return localBin;
  if (commandExists('snarkjs')) return 'snarkjs';
  return null;
}

// ─── Real compilation flow ───────────────────────────────────────────────────

function compileCircuits(snarkjs) {
  console.log('\n=== Phase 0: Compiling circuits ===\n');
  for (const { name, subdir } of CIRCUITS) {
    const outDir = path.join(BUILD_DIR, subdir);
    fs.mkdirSync(outDir, { recursive: true });
    const circomFile = path.join(CIRCUITS_DIR, `${name}.circom`);
    console.log(`  Compiling ${name}.circom...`);
    run(`circom "${circomFile}" -l "${CIRCOMLIB_DIR}" --r1cs --wasm --sym -o "${outDir}"`);
  }
}

function powersOfTau(snarkjs) {
  console.log('\n=== Phase 1: Powers of Tau ===\n');
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  const pot0 = path.join(BUILD_DIR, 'pot14_0000.ptau');
  const pot1 = path.join(BUILD_DIR, 'pot14_0001.ptau');

  if (fs.existsSync(POT_FILE)) {
    console.log('  Powers of Tau already exists, skipping...');
    return;
  }

  run(`"${snarkjs}" powersoftau new bn128 14 "${pot0}" -v`);
  const entropy = crypto.randomBytes(32).toString('hex');
  run(`"${snarkjs}" powersoftau contribute "${pot0}" "${pot1}" --name="ZKCreditScore contribution" -v -e="${entropy}"`);
  run(`"${snarkjs}" powersoftau prepare phase2 "${pot1}" "${POT_FILE}" -v`);
  run(`"${snarkjs}" powersoftau verify "${POT_FILE}"`);

  // Clean intermediate files
  safeUnlink(pot0);
  safeUnlink(pot1);
}

function phase2Setup(snarkjs) {
  console.log('\n=== Phase 2: Groth16 per-circuit setup ===\n');
  for (const { name, subdir } of CIRCUITS) {
    const dir = path.join(BUILD_DIR, subdir);
    const r1cs = path.join(dir, `${name}.r1cs`);
    const zkey0 = path.join(dir, `${name}_0000.zkey`);
    const zkeyFinal = path.join(dir, `${name}_final.zkey`);
    const vk = path.join(dir, 'verification_key.json');

    if (!fs.existsSync(r1cs)) {
      console.log(`  SKIP ${name} — r1cs not found`);
      continue;
    }

    console.log(`  Setting up ${name}...`);
    run(`"${snarkjs}" groth16 setup "${r1cs}" "${POT_FILE}" "${zkey0}"`);
    const entropy = crypto.randomBytes(32).toString('hex');
    run(`"${snarkjs}" zkey contribute "${zkey0}" "${zkeyFinal}" --name="ZKCreditScore phase2" -v -e="${entropy}"`);
    run(`"${snarkjs}" zkey export verificationkey "${zkeyFinal}" "${vk}"`);

    // Clean intermediate zkey
    safeUnlink(zkey0);
    console.log(`  ✓ ${name}`);
  }
}

function exportToPublic() {
  console.log('\n=== Exporting artifacts to public/circuits/ ===\n');
  for (const { name, subdir } of CIRCUITS) {
    const srcDir = path.join(BUILD_DIR, subdir);
    const destDir = path.join(PUBLIC_DIR, name);
    fs.mkdirSync(destDir, { recursive: true });

    // WASM is in <name>_js/<name>.wasm after circom compilation
    const wasmSrc = path.join(srcDir, `${name}_js`, `${name}.wasm`);
    const wasmDest = path.join(destDir, `${name}.wasm`);
    const zkeySrc = path.join(srcDir, `${name}_final.zkey`);
    const zkeyDest = path.join(destDir, `${name}_final.zkey`);
    const vkSrc = path.join(srcDir, 'verification_key.json');
    const vkDest = path.join(destDir, 'verification_key.json');

    if (!fs.existsSync(wasmSrc) || !fs.existsSync(zkeySrc) || !fs.existsSync(vkSrc)) {
      console.log(`  SKIP ${name} — build artifacts incomplete`);
      continue;
    }

    fs.copyFileSync(wasmSrc, wasmDest);
    fs.copyFileSync(zkeySrc, zkeyDest);
    fs.copyFileSync(vkSrc, vkDest);
    console.log(`  ✓ ${name} → ${destDir}`);
  }
}

// ─── Mock artifact generation (devnet) ───────────────────────────────────────

function generateMockArtifacts() {
  console.log('\n=== Generating mock artifacts (devnet mode) ===\n');
  for (const { name } of CIRCUITS) {
    const dir = path.join(PUBLIC_DIR, name);
    fs.mkdirSync(dir, { recursive: true });

    // Mock verification key
    const vk = {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 4,
      vk_alpha_1: [randomHex(), randomHex(), '1'],
      vk_beta_2: [[randomHex(), randomHex()], [randomHex(), randomHex()], ['1', '0']],
      vk_gamma_2: [[randomHex(), randomHex()], [randomHex(), randomHex()], ['1', '0']],
      vk_delta_2: [[randomHex(), randomHex()], [randomHex(), randomHex()], ['1', '0']],
      IC: Array.from({ length: 5 }, () => [randomHex(), randomHex(), '1']),
      circuit: name,
    };
    fs.writeFileSync(path.join(dir, 'verification_key.json'), JSON.stringify(vk, null, 2));

    // Minimal valid WASM module (empty)
    fs.writeFileSync(path.join(dir, `${name}.wasm`), Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));

    // Mock zkey placeholder
    const zkeyBuf = Buffer.alloc(64);
    zkeyBuf.write('zkey', 0);
    zkeyBuf.writeUInt32LE(1, 4);
    zkeyBuf.writeUInt32LE(1, 8);
    fs.writeFileSync(path.join(dir, `${name}_final.zkey`), zkeyBuf);

    console.log(`  ✓ ${name} (mock)`);
  }
}

// ─── Manifest generation ─────────────────────────────────────────────────────

function writeManifest(mode) {
  const manifest = {
    version: '1.0.0',
    circuits: CIRCUITS.map(({ name }) => ({
      id: name,
      wasmPath: `/circuits/${name}/${name}.wasm`,
      zkeyPath: `/circuits/${name}/${name}_final.zkey`,
      vkPath: `/circuits/${name}/verification_key.json`,
    })),
    generatedAt: new Date().toISOString(),
    mode,
  };
  fs.writeFileSync(path.join(PUBLIC_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written to public/circuits/manifest.json`);
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function randomHex() {
  return crypto.randomBytes(32).toString('hex');
}

function safeUnlink(filePath) {
  try { fs.unlinkSync(filePath); } catch { /* ignore */ }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== ZKCreditScore Circuit Setup ===');
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const hasCircom = commandExists('circom');
  const snarkjs = getSnarkjsBin();

  if (FORCE_MOCK || !hasCircom) {
    if (!hasCircom) {
      console.log('\ncircom not found — generating mock artifacts for devnet testing.');
      console.log('Install circom for production builds:');
      console.log('  git clone https://github.com/iden3/circom.git');
      console.log('  cd circom && cargo build --release && cargo install --path circom\n');
    }
    generateMockArtifacts();
    writeManifest('devnet-mock');
    console.log('\n=== Setup complete (mock mode) ===');
    return;
  }

  if (!snarkjs) {
    console.error('ERROR: snarkjs not found. Run `cd circuits && npm install` first.');
    process.exit(1);
  }

  if (!fs.existsSync(CIRCOMLIB_DIR)) {
    console.error('ERROR: circomlib not found. Run `cd circuits && npm install` first.');
    process.exit(1);
  }

  compileCircuits(snarkjs);
  powersOfTau(snarkjs);
  phase2Setup(snarkjs);
  exportToPublic();
  writeManifest('production');
  console.log('\n=== Setup complete (production) ===');
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
