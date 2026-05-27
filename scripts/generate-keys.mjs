// scripts/generate-keys.mjs — generate Solana program keypairs
import { Keypair } from "@solana/web3.js";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const programs = [
  { name: "zk_credit_verifier", label: "verifier" },
  { name: "zk_lending_pool", label: "lendingPool" },
  { name: "zkc_token", label: "zkcToken" },
];

const keypairs = {};

for (const p of programs) {
  const kp = Keypair.generate();
  keypairs[p.label] = kp.publicKey.toBase58();
  const keypath = join(root, "anchor", "target", "deploy", `${p.name}-keypair.json`);
  writeFileSync(keypath, JSON.stringify(Array.from(kp.secretKey)));
  console.log(`✅ ${p.name}: ${kp.publicKey.toBase58()}`);
  console.log(`   Keypair saved: ${keypath}`);
}

// Write constants update
const verifier = keypairs.verifier;
const pool = keypairs.lendingPool;
const token = keypairs.zkcToken;

const programIdLine = `export const SOLANA_PROGRAM_ID = {
  verifier: '${verifier}',
  lendingPool: '${pool}',
  credential: '${verifier}',
  zkcToken: '${token}',
};`;

writeFileSync(join(root, "scripts", ".program-ids.txt"), `${verifier}\n${pool}\n${token}\n`);
writeFileSync(join(root, "scripts", ".constants-patch.txt"), programIdLine);

console.log("\n📝 Update these files with new program IDs:");
console.log("  1. anchor/Anchor.toml — [programs.localnet] section");
console.log("  2. anchor/programs/zk-credit-verifier/src/lib.rs — declare_id!");
console.log("  3. anchor/programs/zk-lending-pool/src/lib.rs — declare_id!");
console.log("  4. anchor/programs/zkc-token/src/lib.rs — declare_id!");
console.log("  5. packages/sdk/src/constants/index.ts — SOLANA_PROGRAM_ID");
console.log(`\n✨ Script file: scripts/.program-ids.txt`);
console.log(`   Constants patch: scripts/.constants-patch.txt`);
