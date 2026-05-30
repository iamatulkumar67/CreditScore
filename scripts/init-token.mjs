import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROGRAM_ID = new PublicKey('AdeWp5SXbwMtb3Mr9FTfpygPGzHoTdGqxAu3EKmmXRTQ');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

// Load wallet (Solana CLI config points to AppData\Local\solana\id.json)
const walletPath = join(process.env.LOCALAPPDATA || join(process.env.USERPROFILE, 'AppData', 'Local'), 'solana', 'id.json');
const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(walletPath, 'utf-8'))));

// Load mint keypair
const mintPath = join(process.cwd(), 'scripts', 'zkcr-mint-keypair.json');
const mint = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(mintPath, 'utf-8'))));

// Derive PDAs
const [mintAuthority] = PublicKey.findProgramAddressSync([Buffer.from('mint-authority')], PROGRAM_ID);
const [treasuryAuthority] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], PROGRAM_ID);
const [config] = PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID);

// Treasury ATA (Token2022, allowOwnerOffCurve=true)
const treasury = getAssociatedTokenAddressSync(mint.publicKey, treasuryAuthority, true, TOKEN_2022_PROGRAM_ID);

// Instruction data: 8-byte discriminator + 8-byte u64 LE
const discriminator = createHash('sha256').update('global:initialize_token').digest().slice(0, 8);
const totalSupply = 1000000000000000000n;
const supplyBuf = Buffer.alloc(8);
supplyBuf.writeBigUInt64LE(totalSupply);
const data = Buffer.concat([discriminator, supplyBuf]);

const ix = new TransactionInstruction({
  programId: PROGRAM_ID,
  keys: [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: mint.publicKey, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: false, isWritable: false },
    { pubkey: treasury, isSigner: false, isWritable: true },
    { pubkey: treasuryAuthority, isSigner: false, isWritable: false },
    { pubkey: config, isSigner: false, isWritable: true },
    { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
  ],
  data,
});

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const tx = new Transaction().add(ix);

console.log('Sending initialize_token transaction...');
console.log('Wallet:', wallet.publicKey.toBase58());
console.log('Mint:', mint.publicKey.toBase58());
console.log('Treasury:', treasury.toBase58());

const sig = await sendAndConfirmTransaction(connection, tx, [wallet, mint]);
console.log('Transaction confirmed:', sig);
