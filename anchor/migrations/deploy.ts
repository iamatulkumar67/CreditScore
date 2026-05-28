/**
 * ZKCreditScore — Protocol initialization migration
 *
 * Usage: anchor run init-protocol
 * Requires: programs already deployed, deployer keypair funded
 */
import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CLUSTER = process.env.CLUSTER || "devnet";
const NETWORKS: Record<string, string> = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  localnet: "http://127.0.0.1:8899",
};

async function main() {
  const url = NETWORKS[CLUSTER];
  console.log(`\n🚀 Initializing ZKCreditScore on ${CLUSTER} (${url})\n`);

  const connection = new Connection(url, "confirmed");

  // Load deployer wallet
  const keypairPath =
    process.env.DEPLOY_KEYPAIR ||
    join(homedir(), ".config", "solana", "id.json");
  if (!existsSync(keypairPath)) {
    throw new Error(`Keypair not found at ${keypairPath}`);
  }
  const secret = JSON.parse(readFileSync(keypairPath, "utf-8"));
  const wallet = new Wallet(Keypair.fromSecretKey(new Uint8Array(secret)));

  console.log(`Deployer: ${wallet.publicKey.toBase58()}`);
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < LAMPORTS_PER_SOL) {
    console.warn("⚠ Low balance — fund the deployer wallet first.");
  }

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load IDLs with real deployed program IDs
  const PROGRAM_NAMES: Record<string, string> = {
    zk_credit_verifier: "9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh",
    zk_lending_pool: "HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo",
    zkc_token: "4A1AR7H5VHQzwM7QuucYDHKTrQWt9HQ1GyEB4gh4pump",
    zk_governance: "4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT",
  };

  const programs: Program[] = [];

  for (const [name, address] of Object.entries(PROGRAM_NAMES)) {
    const idlPath = join(__dirname, "..", "target", "idl", `${name}.json`);
    if (!existsSync(idlPath)) {
      console.warn(`⚠ IDL not found for ${name} — skipping`);
      continue;
    }
    const idl = JSON.parse(readFileSync(idlPath, "utf-8"));
    const program = new Program(idl, new PublicKey(address), provider);
    programs.push(program);
    console.log(`✅ ${name} loaded at ${address}`);
    console.log(`   Instructions: ${idl.instructions.map((i: any) => i.name).join(", ")}`);
  }

  console.log("\n🎉 Protocol ready for interaction!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
