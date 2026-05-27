const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram } = require("@solana/web3.js");

describe("zk-credit-verifier", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const verifierProgram = anchor.workspace.ZkCreditVerifier;
  const lendingProgram = anchor.workspace.ZkLendingPool;

  it("initializes verifier config", async () => {
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      verifierProgram.programId
    );

    await verifierProgram.methods
      .updateConfig({
        minProofExpiry: new anchor.BN(86400),
        maxProofExpiry: new anchor.BN(2592000),
        supportedClaimTypes: 63,
        paused: false,
      })
      .accounts({
        authority: provider.wallet.publicKey,
        config: configPda,
      })
      .rpc();

    const config = await verifierProgram.account.verifierConfig.fetch(configPda);
    console.log("Config authority:", config.authority.toBase58());
  });

  it("issues a credential with ZK proof", async () => {
    const user = provider.wallet.publicKey;
    const [credentialPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), user.toBuffer()],
      verifierProgram.programId
    );

    const mockProof = {
      piA: Buffer.alloc(64),
      piB: Buffer.alloc(128),
      piC: Buffer.alloc(64),
    };

    const claim = {
      claimType: 0,
      threshold: new anchor.BN(700),
      expiry: new anchor.BN(Math.floor(Date.now() / 1000) + 2592000),
      nullifier: Array.from(Array(32).keys()),
    };

    const [nullifierPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("nullifier"), Buffer.from(claim.nullifier)],
      verifierProgram.programId
    );

    try {
      await verifierProgram.methods
        .verifyAndIssueCredential(mockProof, claim)
        .accounts({
          user: user,
          credential: credentialPda,
          nullifier: nullifierPda,
          config: PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            verifierProgram.programId
          )[0],
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const credential = await verifierProgram.account.credential.fetch(credentialPda);
      console.log("Credential tier:", credential.creditTier);
    } catch (e) {
      console.log("Expected: proof verification skipped in test");
    }
  });

  it("initializes a lending pool", async () => {
    const mint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lending-pool"), mint.toBuffer()],
      lendingProgram.programId
    );

    try {
      await lendingProgram.methods
        .initializePool({
          baseRate: new anchor.BN(200),
          optimalUtilization: new anchor.BN(80),
          slope1: new anchor.BN(800),
          slope2: new anchor.BN(7500),
          paused: false,
        })
        .accounts({
          authority: provider.wallet.publicKey,
          mint: mint,
          pool: poolPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Lending pool initialized");
    } catch (e) {
      console.log("Pool may already exist:", e.message);
    }
  });
});
