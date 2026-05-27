import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { expect, assert } from "chai";

describe("zkc-token", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.ZkcToken as Program;

  const authority = provider.wallet.publicKey;
  const [mintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId,
  );
  const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId,
  );
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId,
  );
  const [treasuryAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    program.programId,
  );
  const treasuryPda = getAssociatedTokenAddressSync(
    mintPda,
    treasuryAuthorityPda,
    true,
    TOKEN_2022_PROGRAM_ID,
  );
  const [stakingVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("staking-vault")],
    program.programId,
  );

  const user = Keypair.generate();
  const [userStakePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), user.publicKey.toBuffer()],
    program.programId,
  );

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        user.publicKey,
        10 * anchor.web3.LAMPORTS_PER_SOL,
      ),
    );
  });

  describe("Token Initialization", () => {
    it("initializes the ZKC token with total supply", async () => {
      const totalSupply = new anchor.BN(1_000_000_000_000_000_000);

      const txSig = await program.methods
        .initializeToken(totalSupply)
        .accounts({
          authority,
          mint: mintPda,
          mintAuthority: mintAuthorityPda,
          treasury: treasuryPda,
          treasuryAuthority: treasuryAuthorityPda,
          config: configPda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      expect(txSig).to.be.a("string");

      const config = await program.account.tokenConfig.fetch(configPda);
      expect(config.totalSupply.toString()).to.equal(totalSupply.toString());
      expect(config.decimals).to.equal(9);
      expect(config.authority.toString()).to.equal(authority.toString());
      expect(config.paused).to.be.false;
    });

    it("cannot re-initialize (locks config)", async () => {
      try {
        await program.methods
          .initializeToken(new anchor.BN(1))
          .accounts({
            authority,
            mint: mintPda,
            mintAuthority: mintAuthorityPda,
            treasury: treasuryPda,
            treasuryAuthority: treasuryAuthorityPda,
            config: configPda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("already in use");
      }
    });
  });

  describe("Staking", () => {
    it("rejects stake below minimum", async () => {
      const smallAmount = new anchor.BN(1_000);

      try {
        await program.methods
          .stakeTokens(smallAmount)
          .accounts({
            user: user.publicKey,
            userTokenAccount: getAssociatedTokenAddressSync(
              mintPda, user.publicKey, false, TOKEN_2022_PROGRAM_ID,
            ),
            mint: mintPda,
            stakingVault: stakingVaultPda,
            stakeAccount: userStakePda,
            config: configPda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("InsufficientStakeAmount");
      }
    });

    it("allows staking ZKC tokens", async () => {
      const stakeAmount = new anchor.BN(10_000_000_000_000);
      const userTokenAccount = getAssociatedTokenAddressSync(
        mintPda, user.publicKey, false, TOKEN_2022_PROGRAM_ID,
      );

      // Stake requires user to have tokens → use authority for this test
      const [authorityStakePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), authority.toBuffer()],
        program.programId,
      );

      await program.methods
        .stakeTokens(stakeAmount)
        .accounts({
          user: authority,
          userTokenAccount: getAssociatedTokenAddressSync(
            mintPda, authority, false, TOKEN_2022_PROGRAM_ID,
          ),
          mint: mintPda,
          stakingVault: stakingVaultPda,
          stakeAccount: authorityStakePda,
          config: configPda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const stakeAcc = await program.account.stakeAccount.fetch(authorityStakePda);
      expect(stakeAcc.owner.toString()).to.equal(authority.toString());
      expect(stakeAcc.amount.toString()).to.equal(stakeAmount.toString());
      expect(stakeAcc.pendingRewards.toNumber()).to.equal(0);
    });

    it("rejects unstake from non-owner", async () => {
      const [authorityStakePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), authority.toBuffer()],
        program.programId,
      );

      try {
        await program.methods
          .unstakeTokens(new anchor.BN(1_000_000_000_000))
          .accounts({
            user: user.publicKey,
            userTokenAccount: getAssociatedTokenAddressSync(
              mintPda, user.publicKey, false, TOKEN_2022_PROGRAM_ID,
            ),
            mint: mintPda,
            stakingVault: stakingVaultPda,
            stakeAccount: authorityStakePda,
            config: configPda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("NotStakeOwner");
      }
    });

    it("rejects unstaking more than staked", async () => {
      const [authorityStakePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), authority.toBuffer()],
        program.programId,
      );

      try {
        await program.methods
          .unstakeTokens(new anchor.BN(999_999_999_999_999_999))
          .accounts({
            user: authority,
            userTokenAccount: getAssociatedTokenAddressSync(
              mintPda, authority, false, TOKEN_2022_PROGRAM_ID,
            ),
            mint: mintPda,
            stakingVault: stakingVaultPda,
            stakeAccount: authorityStakePda,
            config: configPda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("InsufficientStakedBalance");
      }
    });
  });

  describe("Fee Discount", () => {
    it("returns 0 fee discount for unstaked user", async () => {
      const [noStakePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), user.publicKey.toBuffer()],
        program.programId,
      );

      try {
        const discount = await program.methods
          .getFeeDiscount()
          .accounts({
            user: user.publicKey,
            stakeAccount: noStakePda,
            config: configPda,
          })
          .view();

        expect(discount.toNumber()).to.equal(0);
      } catch (e) {
        // Account may not exist — acceptable
        expect(e.message).to.include("Account does not exist");
      }
    });

    it("returns non-zero fee discount for staked user", async () => {
      const [authorityStakePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), authority.toBuffer()],
        program.programId,
      );

      const discount = await program.methods
        .getFeeDiscount()
        .accounts({
          user: authority,
          stakeAccount: authorityStakePda,
          config: configPda,
        })
        .view();

      // Tier 1 discount (10,000 ZKC staked) = 1000 bps
      expect(discount.toNumber()).to.equal(1000);
    });
  });

  describe("Config Management", () => {
    it("returns correct config values", async () => {
      const config = await program.account.tokenConfig.fetch(configPda);
      expect(config.paused).to.be.false;
      expect(config.decimals).to.equal(9);
      expect(config.authority.toString()).to.equal(authority.toString());
    });

    it("allows authority to pause", async () => {
      await program.methods
        .updateConfig(null, true)
        .accounts({ authority, config: configPda })
        .rpc();

      const config = await program.account.tokenConfig.fetch(configPda);
      expect(config.paused).to.be.true;
    });

    it("rejects config update from non-authority", async () => {
      try {
        await program.methods
          .updateConfig(null, false)
          .accounts({
            authority: user.publicKey,
            config: configPda,
          })
          .signers([user])
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("Unauthorized");
      }
    });

    it("allows authority to unpause and resume", async () => {
      await program.methods
        .updateConfig(null, false)
        .accounts({ authority, config: configPda })
        .rpc();

      const config = await program.account.tokenConfig.fetch(configPda);
      expect(config.paused).to.be.false;
    });
  });
});
