/**
 * Initialize ZKCreditScore Protocol on Devnet
 * Uses the correct Solana CLI keypair and Anchor instruction discriminators.
 */
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROGRAM_IDS = {
  verifier: new PublicKey('9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh'),
  lendingPool: new PublicKey('HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo'),
  zkcToken: new PublicKey('AdeWp5SXbwMtb3Mr9FTfpygPGzHoTdGqxAu3EKmmXRTQ'),
  governance: new PublicKey('4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT'),
};

const RPC_URL = 'https://api.devnet.solana.com';

function anchorDiscriminator(name) {
  return createHash('sha256').update(`global:${name}`).digest().slice(0, 8);
}

function loadKeypair() {
  // Try the Solana CLI default path on Windows
  const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');
  const keypairPath = path.join(localAppData, 'solana', 'id.json');
  if (fs.existsSync(keypairPath)) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf-8'))));
  }
  // Fallback to ~/.config/solana/id.json
  const fallback = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(fallback, 'utf-8'))));
}

function derivePda(seeds, programId) {
  return PublicKey.findProgramAddressSync(
    seeds.map(s => typeof s === 'string' ? Buffer.from(s) : s),
    programId
  );
}

async function main() {
  const connection = new Connection(RPC_URL, 'confirmed');
  const payer = loadKeypair();
  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

  console.log(`Wallet: ${payer.publicKey.toBase58()}`);
  const bal = await connection.getBalance(payer.publicKey);
  console.log(`Balance: ${bal / 1e9} SOL\n`);

  if (bal === 0) {
    console.error('ERROR: Wallet has 0 SOL. Cannot proceed.');
    process.exit(1);
  }

  // ============ 1. Initialize Verifier Config ============
  console.log('--- 1. Verifier Config ---');
  const [verifierConfig] = derivePda(['config'], PROGRAM_IDS.verifier);
  console.log(`  PDA: ${verifierConfig.toBase58()}`);

  const verifierInfo = await connection.getAccountInfo(verifierConfig);
  if (verifierInfo) {
    console.log('  ✓ Already initialized\n');
  } else {
    const disc = anchorDiscriminator('initialize_config');
    const ix = {
      programId: PROGRAM_IDS.verifier,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: verifierConfig, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: disc,
    };
    const tx = new Transaction().add(ix);
    try {
      const sig = await provider.sendAndConfirm(tx);
      console.log(`  ✓ Initialized! Tx: ${sig}\n`);
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}\n`);
    }
  }

  // ============ 2. Initialize Governance ============
  console.log('--- 2. Governance Config ---');
  const [govConfig] = derivePda(['governance-config'], PROGRAM_IDS.governance);
  console.log(`  PDA: ${govConfig.toBase58()}`);

  const govInfo = await connection.getAccountInfo(govConfig);
  if (govInfo) {
    console.log('  ✓ Already initialized\n');
  } else {
    const disc = anchorDiscriminator('initialize');
    const ix = {
      programId: PROGRAM_IDS.governance,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: govConfig, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: disc,
    };
    const tx = new Transaction().add(ix);
    try {
      const sig = await provider.sendAndConfirm(tx);
      console.log(`  ✓ Initialized! Tx: ${sig}\n`);
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}\n`);
    }
  }

  // ============ 3. ZKCR Token — Generate Mint Keypair ============
  console.log('--- 3. ZKCR Token (Mint Keypair) ---');
  const mintKeypairPath = path.join(__dirname, 'zkcr-mint-keypair.json');
  let mintKeypair;
  if (fs.existsSync(mintKeypairPath)) {
    mintKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(mintKeypairPath, 'utf-8'))));
    console.log(`  Existing mint keypair loaded: ${mintKeypair.publicKey.toBase58()}`);
  } else {
    mintKeypair = Keypair.generate();
    fs.writeFileSync(mintKeypairPath, JSON.stringify(Array.from(mintKeypair.secretKey)));
    console.log(`  New mint keypair generated: ${mintKeypair.publicKey.toBase58()}`);
    console.log(`  Saved to: ${mintKeypairPath}`);
  }

  const [tokenConfig] = derivePda(['config'], PROGRAM_IDS.zkcToken);
  const tokenInfo = await connection.getAccountInfo(tokenConfig);
  if (tokenInfo) {
    console.log('  ✓ Token config already initialized on-chain\n');
  } else {
    console.log('  ⚠ Token NOT initialized on-chain yet.');
    console.log('  To initialize, you need to call initialize_token with:');
    console.log(`    - Mint: ${mintKeypair.publicKey.toBase58()}`);
    console.log(`    - Token Config PDA: ${tokenConfig.toBase58()}`);
    const [mintAuthority] = derivePda(['mint-authority'], PROGRAM_IDS.zkcToken);
    const [treasury] = derivePda(['treasury'], PROGRAM_IDS.zkcToken);
    console.log(`    - Mint Authority PDA: ${mintAuthority.toBase58()}`);
    console.log(`    - Treasury PDA: ${treasury.toBase58()}`);
    console.log('    - Requires Token2022 program + ATA creation');
    console.log('    - Total supply: 1,000,000,000 ZKCR (9 decimals)\n');
  }

  // ============ Summary ============
  console.log('=== Summary ===');
  console.log(`Verifier Config: ${verifierConfig.toBase58()} — ${verifierInfo ? 'existed' : 'initialized'}`);
  console.log(`Governance Config: ${govConfig.toBase58()} — ${govInfo ? 'existed' : 'initialized'}`);
  console.log(`Token Config: ${tokenConfig.toBase58()} — ${tokenInfo ? 'existed' : 'pending'}`);
  console.log(`Mint Keypair: ${mintKeypair.publicKey.toBase58()}`);
  const finalBal = await connection.getBalance(payer.publicKey);
  console.log(`\nRemaining balance: ${finalBal / 1e9} SOL`);
}

main().catch(console.error);
