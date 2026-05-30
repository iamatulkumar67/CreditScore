/**
 * Initialize ZKCreditScore Protocol on Devnet
 * 
 * This script:
 * 1. Initializes the verifier config
 * 2. Initializes the ZKCR token (mint + treasury)
 * 3. Initializes the governance config
 * 4. Creates a lending pool for wrapped SOL
 * 
 * Run: node scripts/initialize-devnet.mjs
 */

import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, BN, Wallet } from '@coral-xyz/anchor';
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROGRAM_IDS = {
  verifier: '9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh',
  lendingPool: 'HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo',
  zkcToken: 'AdeWp5SXbwMtb3Mr9FTfpygPGzHoTdGqxAu3EKmmXRTQ',
  governance: '4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT',
};

const RPC_URL = 'https://api.devnet.solana.com';
const ZKCR_TOTAL_SUPPLY = new BN('1000000000000000000'); // 1B tokens * 10^9 decimals

// Load wallet keypair
function loadKeypair() {
  const home = process.env.HOME || process.env.USERPROFILE;
  const keypairPath = path.join(home, '.config', 'solana', 'id.json');
  const raw = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function derivePda(seeds, programId) {
  return PublicKey.findProgramAddressSync(
    seeds.map(s => typeof s === 'string' ? Buffer.from(s) : s),
    new PublicKey(programId)
  );
}

async function main() {
  const connection = new Connection(RPC_URL, 'confirmed');
  const payer = loadKeypair();
  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

  console.log(`Wallet: ${payer.publicKey.toBase58()}`);
  console.log(`Balance: ${(await connection.getBalance(payer.publicKey)) / 1e9} SOL\n`);

  // ============ 1. Initialize Verifier Config ============
  console.log('--- Initializing Verifier Config ---');
  const [verifierConfig] = derivePda(['config'], PROGRAM_IDS.verifier);
  const verifierConfigInfo = await connection.getAccountInfo(verifierConfig);
  
  if (verifierConfigInfo) {
    console.log('✓ Verifier config already initialized');
  } else {
    const verifierProgram = new PublicKey(PROGRAM_IDS.verifier);
    const ix = {
      programId: verifierProgram,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: verifierConfig, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      // initializeConfig discriminator: sha256("global:initialize_config")[0..8]
      data: Buffer.from([208, 127, 21, 1, 194, 190, 196, 70]),
    };
    
    const { Transaction } = await import('@solana/web3.js');
    const tx = new Transaction().add(ix);
    const sig = await provider.sendAndConfirm(tx);
    console.log(`✓ Verifier config initialized: ${sig}`);
  }

  // ============ 2. Initialize ZKCR Token ============
  console.log('\n--- Initializing ZKCR Token ---');
  const [tokenConfig] = derivePda(['config'], PROGRAM_IDS.zkcToken);
  const tokenConfigInfo = await connection.getAccountInfo(tokenConfig);

  if (tokenConfigInfo) {
    console.log('✓ ZKCR token already initialized');
    // Read mint address from config
    const configData = tokenConfigInfo.data;
    // Skip 8-byte discriminator + 32-byte authority = offset 40 for mint pubkey
    const mintBytes = configData.slice(40, 72);
    const mintAddress = new PublicKey(mintBytes);
    console.log(`  Mint: ${mintAddress.toBase58()}`);
    
    // Save mint address
    const mintFile = path.join(__dirname, '..', 'packages', 'sdk', 'src', 'constants', 'mint.json');
    fs.writeFileSync(mintFile, JSON.stringify({ mint: mintAddress.toBase58() }));
  } else {
    console.log('  Creating ZKCR mint keypair...');
    const mintKeypair = Keypair.generate();
    const mintFile = path.join(__dirname, 'zkcr-mint-keypair.json');
    fs.writeFileSync(mintFile, JSON.stringify(Array.from(mintKeypair.secretKey)));
    console.log(`  Mint keypair saved: ${mintFile}`);
    console.log(`  Mint address: ${mintKeypair.publicKey.toBase58()}`);

    const [mintAuthority] = derivePda(['mint-authority'], PROGRAM_IDS.zkcToken);
    const [treasuryAuthority] = derivePda(['treasury'], PROGRAM_IDS.zkcToken);
    const treasuryAta = getAssociatedTokenAddressSync(
      mintKeypair.publicKey, treasuryAuthority, true, TOKEN_2022_PROGRAM_ID
    );

    console.log(`  Mint Authority PDA: ${mintAuthority.toBase58()}`);
    console.log(`  Treasury Authority PDA: ${treasuryAuthority.toBase58()}`);
    console.log(`  Treasury ATA: ${treasuryAta.toBase58()}`);

    // Build initialize_token instruction manually
    // Discriminator for "initialize_token" + total_supply (u64 LE)
    const data = Buffer.alloc(8 + 8);
    // sha256("global:initialize_token")[0..8]
    Buffer.from([38, 209, 150, 50, 190, 117, 16, 54]).copy(data, 0);
    data.writeBigUInt64LE(BigInt('1000000000000000000'), 8);

    const zkcProgram = new PublicKey(PROGRAM_IDS.zkcToken);
    const ix = {
      programId: zkcProgram,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: mintAuthority, isSigner: false, isWritable: false },
        { pubkey: treasuryAta, isSigner: false, isWritable: true },
        { pubkey: treasuryAuthority, isSigner: false, isWritable: false },
        { pubkey: tokenConfig, isSigner: false, isWritable: true },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    };

    const { Transaction } = await import('@solana/web3.js');
    const tx = new Transaction().add(ix);
    try {
      const sig = await provider.sendAndConfirm(tx, [mintKeypair]);
      console.log(`✓ ZKCR token initialized: ${sig}`);
    } catch (e) {
      console.error('✗ Token initialization failed:', e.message);
      console.log('  You may need to run this with the Anchor IDL for proper serialization.');
    }

    // Save mint address for SDK
    const sdkMintFile = path.join(__dirname, '..', 'packages', 'sdk', 'src', 'constants', 'mint.json');
    fs.writeFileSync(sdkMintFile, JSON.stringify({ mint: mintKeypair.publicKey.toBase58() }));
  }

  // ============ 3. Initialize Governance ============
  console.log('\n--- Initializing Governance ---');
  const [govConfig] = derivePda(['governance-config'], PROGRAM_IDS.governance);
  const govConfigInfo = await connection.getAccountInfo(govConfig);

  if (govConfigInfo) {
    console.log('✓ Governance already initialized');
  } else {
    const govProgram = new PublicKey(PROGRAM_IDS.governance);
    // sha256("global:initialize")[0..8]
    const data = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);
    
    const ix = {
      programId: govProgram,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: govConfig, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    };

    const { Transaction } = await import('@solana/web3.js');
    const tx = new Transaction().add(ix);
    try {
      const sig = await provider.sendAndConfirm(tx);
      console.log(`✓ Governance initialized: ${sig}`);
    } catch (e) {
      console.error('✗ Governance initialization failed:', e.message);
    }
  }

  console.log('\n=== Initialization Complete ===');
  console.log(`Verifier Config: ${verifierConfig.toBase58()}`);
  console.log(`Token Config: ${tokenConfig.toBase58()}`);
  console.log(`Governance Config: ${govConfig.toBase58()}`);
  
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`\nRemaining balance: ${balance / 1e9} SOL`);
}

main().catch(console.error);
