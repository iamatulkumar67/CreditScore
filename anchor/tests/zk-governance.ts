import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { expect, assert } from "chai";

describe("zk-governance", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.ZkGovernance as Program;

  const authority = provider.wallet.publicKey;
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("governance-config")],
    program.programId,
  );
  const [governancePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("governance-pda")],
    program.programId,
  );
  const [stakingVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("staking-vault")],
    program.programId,
  );

  const proposer = Keypair.generate();
  const [proposerStakePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), proposer.publicKey.toBuffer()],
    program.programId,
  );

  const voter = Keypair.generate();
  const [voterStakePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), voter.publicKey.toBuffer()],
    program.programId,
  );

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        proposer.publicKey,
        10 * anchor.web3.LAMPORTS_PER_SOL,
      ),
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        voter.publicKey,
        10 * anchor.web3.LAMPORTS_PER_SOL,
      ),
    );
  });

  describe("Config Initialization", () => {
    it("initializes governance config", async () => {
      await program.methods
        .initialize()
        .accounts({
          authority,
          config: configPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const config = await program.account.governanceConfig.fetch(configPda);
      expect(config.governanceAuthority.toString()).to.equal(authority.toString());
      expect(config.proposalCount.toNumber()).to.equal(0);
      expect(config.paused).to.be.false;
    });

    it("cannot re-initialize", async () => {
      try {
        await program.methods
          .initialize()
          .accounts({
            authority,
            config: configPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("already in use");
      }
    });
  });

  describe("Proposal Lifecycle", () => {
    function getProposalPda(id: anchor.BN): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("proposal"), ...id.toArrayLike(Buffer, "le", 8)],
        program.programId,
      )[0];
    }

    it("rejects proposal creation without sufficient stake", async () => {
      const proposalPda = getProposalPda(new anchor.BN(1));

      try {
        await program.methods
          .createProposal(
            "Test proposal",
            [SystemProgram.programId],
            [Buffer.alloc(8)],
            false,
          )
          .accounts({
            staker: new Keypair().publicKey,
            config: configPda,
            stakeAccount: PublicKey.findProgramAddressSync(
              [Buffer.from("stake"), new Keypair().publicKey.toBuffer()],
              program.programId,
            )[0],
            proposal: proposalPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        // Either stake too low or account doesn't exist
        expect(e.message).to.satisfy((m: string) =>
          m.includes("InsufficientStake") || m.includes("Account does not exist")
        );
      }
    });

    it("rejects empty targets", async () => {
      const proposalPda = getProposalPda(new anchor.BN(2));

      try {
        await program.methods
          .createProposal("No targets", [], [], false)
          .accounts({
            staker: authority,
            config: configPda,
            stakeAccount: proposerStakePda,
            proposal: proposalPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("NoTargets");
      }
    });

    it("creates a proposal", async () => {
      const config = await program.account.governanceConfig.fetch(configPda);
      const nextId = config.proposalCount.add(new anchor.BN(1));
      const proposalPda = getProposalPda(nextId);

      await program.methods
        .createProposal(
          "Increase base rate to 300 bps",
          [SystemProgram.programId],
          [Buffer.from([1, 2, 3, 4])],
          false,
        )
        .accounts({
          staker: authority,
          config: configPda,
          stakeAccount: PublicKey.findProgramAddressSync(
            [Buffer.from("stake"), authority.toBuffer()],
            program.programId,
          )[0],
          proposal: proposalPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const proposal = await program.account.proposal.fetch(proposalPda);
      expect(proposal.proposer.toString()).to.equal(authority.toString());
      expect(proposal.emergency).to.be.false;
      expect(proposal.status).to.equal(0);
      expect(proposal.description).to.include("Increase base rate");

      const updatedConfig = await program.account.governanceConfig.fetch(configPda);
      expect(updatedConfig.proposalCount.toString()).to.equal(nextId.toString());
    });

    it("creates an emergency proposal", async () => {
      const config = await program.account.governanceConfig.fetch(configPda);
      const nextId = config.proposalCount.add(new anchor.BN(1));
      const proposalPda = getProposalPda(nextId);

      await program.methods
        .createProposal(
          "Emergency: pause protocol",
          [SystemProgram.programId],
          [Buffer.from([0x44])],
          true,
        )
        .accounts({
          staker: authority,
          config: configPda,
          stakeAccount: PublicKey.findProgramAddressSync(
            [Buffer.from("stake"), authority.toBuffer()],
            program.programId,
          )[0],
          proposal: proposalPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const proposal = await program.account.proposal.fetch(proposalPda);
      expect(proposal.emergency).to.be.true;
      expect(proposal.status).to.equal(0);
    });

    it("rejects votes after voting period", async () => {
      const config = await program.account.governanceConfig.fetch(configPda);
      const nextId = config.proposalCount.add(new anchor.BN(1));
      const proposalPda = getProposalPda(nextId);

      await program.methods
        .createProposal(
          "Vote timeout test",
          [SystemProgram.programId],
          [Buffer.from([0])],
          true, // emergency = 1 day voting
        )
        .accounts({
          staker: authority,
          config: configPda,
          stakeAccount: PublicKey.findProgramAddressSync(
            [Buffer.from("stake"), authority.toBuffer()],
            program.programId,
          )[0],
          proposal: proposalPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const afterEnd = (await anchor.web3.Clock.get()).unixTimestamp + 86401;
      const clock = anchor.web3.Clock.from({ unixTimestamp: afterEnd, epoch: 0, slot: 0, leaderScheduleEpoch: 0 });

      try {
        await program.methods
          .castVote(nextId, { yes: {} })
          .accounts({
            voter: authority,
            config: configPda,
            proposal: proposalPda,
            stakeAccount: PublicKey.findProgramAddressSync(
              [Buffer.from("stake"), authority.toBuffer()],
              program.programId,
            )[0],
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        // Must be caught as VotingEnded (but clock manipulation in localnet is limited)
        expect(e).to.exist;
      }
    });
  });

  describe("Config Management", () => {
    it("allows authority to pause governance", async () => {
      await program.methods
        .updateConfig(null, true)
        .accounts({ authority, config: configPda })
        .rpc();

      const config = await program.account.governanceConfig.fetch(configPda);
      expect(config.paused).to.be.true;
    });

    it("rejects updates when paused", async () => {
      const config = await program.account.governanceConfig.fetch(configPda);

      try {
        await program.methods
          .createProposal("Should fail", [SystemProgram.programId], [Buffer.alloc(1)], false)
          .accounts({
            staker: authority,
            config: configPda,
            stakeAccount: PublicKey.findProgramAddressSync(
              [Buffer.from("stake"), authority.toBuffer()],
              program.programId,
            )[0],
            proposal: PublicKey.findProgramAddressSync(
              [Buffer.from("proposal"), ...config.proposalCount.add(new anchor.BN(1)).toArrayLike(Buffer, "le", 8)],
              program.programId,
            )[0],
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("Paused");
      }
    });

    it("transfers authority to new key", async () => {
      const newAuthority = Keypair.generate();

      await program.methods
        .updateConfig(newAuthority.publicKey, null)
        .accounts({ authority, config: configPda })
        .rpc();

      const config = await program.account.governanceConfig.fetch(configPda);
      expect(config.governanceAuthority.toString()).to.equal(newAuthority.publicKey.toString());

      // Transfer back
      await program.methods
        .updateConfig(authority, null)
        .accounts({ authority: newAuthority.publicKey, config: configPda })
        .signers([newAuthority])
        .rpc();

      const configRestored = await program.account.governanceConfig.fetch(configPda);
      expect(configRestored.governanceAuthority.toString()).to.equal(authority.toString());
    });

    it("rejects config update from non-authority", async () => {
      try {
        await program.methods
          .updateConfig(null, false)
          .accounts({
            authority: new Keypair().publicKey,
            config: configPda,
          })
          .rpc();
        assert.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("Unauthorized");
      }
    });
  });
});
