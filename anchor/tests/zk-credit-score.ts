import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { expect, assert } from "chai";

describe("zk-credit-verifier", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const verifier = anchor.workspace.ZkCreditVerifier as Program;
  const lending = anchor.workspace.ZkLendingPool as Program;

  const authority = provider.wallet.publicKey;
  const user = Keypair.generate();

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    verifier.programId,
  );

  let credentialPda: PublicKey;
  let poolPda: PublicKey;

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL),
    );

    [credentialPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), authority.toBuffer()],
      verifier.programId,
    );
    [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lending-pool"), PublicKey.default.toBuffer()],
      lending.programId,
    );
  });

  describe("Verifier Config", () => {
    it("initializes verifier config", async () => {
      await verifier.methods
        .updateConfig({
          minProofExpiry: new anchor.BN(86400),
          maxProofExpiry: new anchor.BN(2592000),
          supportedClaimTypes: 63,
          paused: false,
        })
        .accounts({ authority, config: configPda })
        .rpc();

      const config = await verifier.account.verifierConfig.fetch(configPda);
      expect(config.authority.toString()).to.equal(authority.toString());
      expect(config.supportedClaimTypes).to.equal(63);
      expect(config.paused).to.be.false;
    });

    it("rejects config update from non-authority", async () => {
      try {
        await verifier.methods
          .updateConfig({
            minProofExpiry: new anchor.BN(86400),
            maxProofExpiry: new anchor.BN(2592000),
            supportedClaimTypes: 63,
            paused: true,
          })
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
  });

  describe("Credential Issuance", () => {
    const mockProof = {
      piA: Array.from(Buffer.alloc(64, 1)),
      piB: Array.from(Buffer.alloc(128, 2)),
      piC: Array.from(Buffer.alloc(64, 3)),
    };
    const nullifier = Array.from(Buffer.alloc(32, 42));
    const expiry = Math.floor(Date.now() / 1000) + 30 * 86400;

    let nullifierPda: PublicKey;

    before(() => {
      [nullifierPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("nullifier"), Buffer.from(nullifier)],
        verifier.programId,
      );
    });

    it("issues a credential with valid ZK proof", async () => {
      await verifier.methods
        .verifyAndIssueCredential(
          mockProof,
          {
            claimType: 0,
            threshold: new anchor.BN(700),
            expiry: new anchor.BN(expiry),
            nullifier: nullifier,
          },
        )
        .accounts({
          user: authority,
          credential: credentialPda,
          nullifier: nullifierPda,
          config: configPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const cred = await verifier.account.credential.fetch(credentialPda);
      expect(cred.owner.toString()).to.equal(authority.toString());
      expect(cred.creditTier).to.equal(2);
      expect(cred.claimType).to.equal(0);
      expect(cred.isRevoked).to.be.false;
    });

    it("rejects duplicate nullifier", async () => {
      try {
        await verifier.methods
          .verifyAndIssueCredential(
            mockProof,
            {
              claimType: 0,
              threshold: new anchor.BN(700),
              expiry: new anchor.BN(expiry),
              nullifier: nullifier,
            },
          )
          .accounts({
            user: authority,
            credential: credentialPda,
            nullifier: nullifierPda,
            config: configPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("nullifier");
      }
    });

    it("rejects expired proof", async () => {
      const [tempNullifierPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("nullifier"), Buffer.from(Buffer.alloc(32, 99))],
        verifier.programId,
      );
      try {
        await verifier.methods
          .verifyAndIssueCredential(
            mockProof,
            {
              claimType: 0,
              threshold: new anchor.BN(700),
              expiry: new anchor.BN(Math.floor(Date.now() / 1000) - 3600),
              nullifier: Array.from(Buffer.alloc(32, 99)),
            },
          )
          .accounts({
            user: authority,
            credential: credentialPda,
            nullifier: tempNullifierPda,
            config: configPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("expired");
      }
    });

    it("checks credential validity", async () => {
      const valid = await verifier.methods
        .hasValidCredential()
        .accounts({
          user: authority,
          credential: credentialPda,
          claimTypeArg: 0,
          requiredThreshold: new anchor.BN(650),
        })
        .view();

      expect(valid).to.be.true;
    });

    it("returns invalid for missing credential", async () => {
      const fakeUser = Keypair.generate();
      const [fakeCredPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("credential"), fakeUser.publicKey.toBuffer()],
        verifier.programId,
      );

      try {
        const valid = await verifier.methods
          .hasValidCredential()
          .accounts({
            user: fakeUser.publicKey,
            credential: fakeCredPda,
            claimTypeArg: 0,
            requiredThreshold: new anchor.BN(650),
          })
          .view();
        expect(valid).to.be.false;
      } catch (e) {
        // Account not initialized — acceptable
        expect(e.message).to.include("Account does not exist");
      }
    });

    it("revokes a credential", async () => {
      await verifier.methods
        .revokeCredential()
        .accounts({
          user: authority,
          credential: credentialPda,
        })
        .rpc();

      const cred = await verifier.account.credential.fetch(credentialPda);
      expect(cred.isRevoked).to.be.true;
      expect(cred.owner.toString()).to.equal(authority.toString());
    });

    it("rejects non-owner revocation", async () => {
      try {
        await verifier.methods
          .revokeCredential()
          .accounts({
            user: user.publicKey,
            credential: credentialPda,
          })
          .signers([user])
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("NotCredentialOwner");
      }
    });
  });

  describe("Lending Pool", () => {
    const mint = PublicKey.default;

    before(async () => {
      // Ensure pool exists (may already exist from prior tests)
      try {
        await lending.methods
          .initializePool({
            baseRate: new anchor.BN(200),
            optimalUtilization: new anchor.BN(80),
            slope1: new anchor.BN(800),
            slope2: new anchor.BN(7500),
            paused: false,
          })
          .accounts({
            authority,
            mint,
            pool: poolPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } catch (_) { /* pool already exists */ }
    });

    it("initializes a lending pool", async () => {
      const pool = await lending.account.lendingPool.fetch(poolPda);
      expect(pool.authority.toString()).to.equal(authority.toString());
      expect(pool.baseRate.toNumber()).to.equal(200);
      expect(pool.optimalUtilization.toNumber()).to.equal(80);
      expect(pool.paused).to.be.false;
    });

    it("computes borrow rate at 0% utilization", async () => {
      const rate = await lending.methods
        .getBorrowRate()
        .accounts({ pool: poolPda })
        .view();

      expect(rate.toNumber()).to.be.greaterThanOrEqual(200);
    });

    it("updates pool config", async () => {
      await lending.methods
        .updatePoolConfig({
          baseRate: new anchor.BN(300),
          optimalUtilization: new anchor.BN(75),
          slope1: new anchor.BN(700),
          slope2: new anchor.BN(7000),
          paused: false,
        })
        .accounts({ authority, pool: poolPda })
        .rpc();

      const pool = await lending.account.lendingPool.fetch(poolPda);
      expect(pool.baseRate.toNumber()).to.equal(300);
    });

    it("rejects config update from non-authority", async () => {
      try {
        await lending.methods
          .updatePoolConfig({
            baseRate: new anchor.BN(999),
            optimalUtilization: new anchor.BN(50),
            slope1: new anchor.BN(1),
            slope2: new anchor.BN(1),
            paused: true,
          })
          .accounts({
            authority: user.publicKey,
            pool: poolPda,
          })
          .signers([user])
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("Unauthorized");
      }
    });
  });

  describe("Interest Rate Model", () => {
    it("kink model: rate increases with utilization", async () => {
      const pool = await lending.account.lendingPool.fetch(poolPda);

      // Below optimal: gradual slope1
      const rateBelow = await lending.methods
        .getBorrowRate()
        .accounts({ pool: poolPda })
        .view();

      expect(rateBelow.toNumber()).to.be.greaterThan(0);

      // Verify kink model math
      const util = pool.utilizationRate.toNumber();
      const optimal = pool.optimalUtilization.toNumber();
      const base = pool.baseRate.toNumber();
      const slope1 = pool.slope1.toNumber();
      const slope2 = pool.slope2.toNumber();

      const expectedRate =
        util <= optimal
          ? base + (util * slope1) / optimal
          : base + slope1 + ((util - optimal) * (slope2 - slope1)) / (100 - optimal);

      expect(rateBelow.toNumber()).to.equal(expectedRate);
    });
  });
});
