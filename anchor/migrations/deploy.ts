const { AnchorProvider, Program, Wallet } = require("@coral-xyz/anchor");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

async function main() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const wallet = Wallet.local();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const verifierIdl = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../programs/zk-credit-verifier/target/idl/zk_credit_verifier.json"),
      "utf8"
    )
  );
  const verifierProgram = new Program(
    verifierIdl,
    new PublicKey("ZKVrf1111111111111111111111111111111111"),
    provider
  );

  const lendingIdl = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../programs/zk-lending-pool/target/idl/zk_lending_pool.json"),
      "utf8"
    )
  );
  const lendingProgram = new Program(
    lendingIdl,
    new PublicKey("ZKPool111111111111111111111111111111111"),
    provider
  );

  console.log("Deploying ZKCredit Verifier...");
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    verifierProgram.programId
  );

  try {
    const configAccount = await verifierProgram.account.verifierConfig.fetch(configPda);
    console.log("Config already initialized:", configAccount.authority.toBase58());
  } catch {
    await verifierProgram.methods
      .updateConfig({
        minProofExpiry: new anchor.BN(86400),
        maxProofExpiry: new anchor.BN(2592000),
        supportedClaimTypes: 63,
        paused: false,
      })
      .accounts({
        authority: wallet.publicKey,
        config: configPda,
      })
      .rpc();
    console.log("Verifier config initialized");
  }

  console.log("Deploying ZK Lending Pool...");
  console.log("Deployment complete!");
}

main().catch(console.error);
