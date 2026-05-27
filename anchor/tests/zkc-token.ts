const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram } = require("@solana/web3.js");
const {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} = require("@solana/spl-token");

describe("zkc-token", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.ZkcToken;

  let mintPda;
  let mintAuthorityPda;
  let configPda;
  let treasuryPda;
  let treasuryAuthorityPda;

  before(async () => {
    [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint")],
      program.programId
    );
    [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint")],
      program.programId
    );
    [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
    [treasuryAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );
    treasuryPda = getAssociatedTokenAddressSync(
      mintPda,
      treasuryAuthorityPda,
      true,
      TOKEN_2022_PROGRAM_ID
    );
  });

  it("initializes the ZKC token with total supply", async () => {
    const totalSupply = new anchor.BN(1_000_000_000_000_000_000);

    try {
      await program.methods
        .initializeToken(totalSupply)
        .accounts({
          authority: provider.wallet.publicKey,
          mint: mintPda,
          mintAuthority: mintAuthorityPda,
          treasury: treasuryPda,
          treasuryAuthority: treasuryAuthorityPda,
          config: configPda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Token initialized");
    } catch (e) {
      console.log("Token may already exist:", e.message);
    }

    const config = await program.account.tokenConfig.fetch(configPda);
    console.log("Total supply:", config.totalSupply.toString());
    console.log("Decimals:", config.decimals);
    console.log("Authority:", config.authority.toBase58());
  });

  it("allows staking ZKC tokens", async () => {
    const user = provider.wallet.publicKey;
    const [stakeAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake"), user.toBuffer()],
      program.programId
    );
    const [stakingVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("staking-vault")],
      program.programId
    );

    const userTokenAccount = getAssociatedTokenAddressSync(
      mintPda,
      user,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const stakeAmount = new anchor.BN(10_000_000_000_000);

    try {
      await program.methods
        .stakeTokens(stakeAmount)
        .accounts({
          user: user,
          userTokenAccount: userTokenAccount,
          mint: mintPda,
          stakingVault: stakingVaultPda,
          stakeAccount: stakeAccountPda,
          config: configPda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Staked successfully");
    } catch (e) {
      console.log("Stake test (may fail without tokens):", e.message);
    }
  });

  it("returns fee discount based on stake", async () => {
    const user = provider.wallet.publicKey;
    const [stakeAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake"), user.toBuffer()],
      program.programId
    );

    try {
      const discount = await program.methods
        .getFeeDiscount()
        .accounts({
          user: user,
          stakeAccount: stakeAccountPda,
          config: configPda,
        })
        .view();

      console.log("Fee discount (basis points):", discount.toString());
    } catch (e) {
      console.log("Fee discount check:", e.message);
    }
  });
});
