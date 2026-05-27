use anchor_lang::prelude::*;

declare_id!("4FE94XY5Az6fS2PCBxd2PZtzPq5EiXYT5EFPzYj53QkT");

pub const PROPOSAL_DESCRIPTION_MAX_LEN: usize = 500;
pub const MIN_VOTING_PERIOD: i64 = 86_400;
pub const MAX_VOTING_PERIOD: i64 = 604_800;
pub const STANDARD_TIMELOCK: i64 = 172_800;
pub const EMERGENCY_TIMELOCK: i64 = 21_600;
pub const QUORUM_BPS: u64 = 1000;
pub const MIN_STAKE_TO_PROPOSE: u64 = 10_000_000_000_000;
pub const MAX_TARGETS: usize = 8;
pub const MAX_INSTRUCTION_DATA: usize = 256;

#[program]
pub mod zk_governance {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.governance_authority = ctx.accounts.authority.key();
        config.proposal_count = 0;
        config.paused = false;
        config.bump = ctx.bumps.config;

        emit!(GovernanceInitialized {
            authority: ctx.accounts.authority.key(),
        });
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        description: String,
        targets: Vec<Pubkey>,
        instruction_datas: Vec<Vec<u8>>,
        emergency: bool,
    ) -> Result<()> {
        require!(!ctx.accounts.config.paused, GovernanceError::Paused);
        require!(
            description.len() <= PROPOSAL_DESCRIPTION_MAX_LEN,
            GovernanceError::DescriptionTooLong
        );
        require!(targets.len() > 0, GovernanceError::NoTargets);
        require!(targets.len() <= MAX_TARGETS, GovernanceError::TooManyTargets);
        require!(
            targets.len() == instruction_datas.len(),
            GovernanceError::TargetsInstructionsMismatch
        );

        let staker = &ctx.accounts.staker;
        require!(
            ctx.accounts.stake_account.owner == staker.key(),
            GovernanceError::NotStakeOwner
        );
        require!(
            ctx.accounts.stake_account.amount >= MIN_STAKE_TO_PROPOSE,
            GovernanceError::InsufficientStakeToPropose
        );

        let config = &mut ctx.accounts.config;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        config.proposal_count = config.proposal_count.checked_add(1).ok_or(GovernanceError::MathOverflow)?;

        proposal.id = config.proposal_count;
        proposal.proposer = staker.key();
        proposal.description = description;
        proposal.target_count = targets.len() as u8;

        let mut buf = [0u8; MAX_TARGETS * 32];
        for (i, pk) in targets.iter().enumerate() {
            buf[i * 32..(i + 1) * 32].copy_from_slice(pk.as_ref());
        }
        proposal.targets = buf;

        let mut idx = 0u8;
        let mut data_buf = [0u8; MAX_TARGETS * MAX_INSTRUCTION_DATA];
        for instr in &instruction_datas {
            let len = instr.len().min(MAX_INSTRUCTION_DATA);
            data_buf[idx as usize..idx as usize + len].copy_from_slice(&instr[..len]);
            idx += MAX_INSTRUCTION_DATA as u8;
        }
        proposal.instruction_data = data_buf;

        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.voting_end = clock.unix_timestamp
            + if emergency { MIN_VOTING_PERIOD } else { MAX_VOTING_PERIOD };
        proposal.executed_at = None;
        proposal.timelock_end = None;
        proposal.emergency = emergency;
        proposal.status = ProposalStatus::Active as u8;
        proposal.bump = ctx.bumps.proposal;

        emit!(ProposalCreated {
            proposal_id: proposal.id,
            proposer: staker.key(),
            description: description[..description.len().min(100)].to_string(),
            emergency,
        });
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, proposal_id: u64, vote: VoteType) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(proposal.status == ProposalStatus::Active as u8, GovernanceError::ProposalNotActive);
        require!(clock.unix_timestamp < proposal.voting_end, GovernanceError::VotingEnded);
        require!(ctx.accounts.stake_account.owner == ctx.accounts.voter.key(), GovernanceError::NotStakeOwner);

        let voting_power = ctx.accounts.stake_account.amount;
        require!(voting_power > 0, GovernanceError::NoVotingPower);

        match vote {
            VoteType::Yes => {
                proposal.yes_votes = proposal.yes_votes.checked_add(voting_power)
                    .ok_or(GovernanceError::MathOverflow)?;
            }
            VoteType::No => {
                proposal.no_votes = proposal.no_votes.checked_add(voting_power)
                    .ok_or(GovernanceError::MathOverflow)?;
            }
        }

        emit!(VoteCast {
            proposal_id,
            voter: ctx.accounts.voter.key(),
            vote,
            voting_power,
        });
        Ok(())
    }

    pub fn queue_proposal(ctx: Context<QueueProposal>, proposal_id: u64) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(proposal.status == ProposalStatus::Active as u8, GovernanceError::ProposalNotActive);
        require!(clock.unix_timestamp >= proposal.voting_end, GovernanceError::VotingStillActive);

        let total_votes = proposal.yes_votes.checked_add(proposal.no_votes)
            .ok_or(GovernanceError::MathOverflow)?;
        let total_staked = ctx.accounts.staking_vault.amount;
        require!(total_staked > 0, GovernanceError::NoStakedTokens);

        let quorum_reached = (total_votes as u128) * 10000u128 >= (total_staked as u128) * (QUORUM_BPS as u128);
        require!(quorum_reached, GovernanceError::QuorumNotMet);
        require!(proposal.yes_votes > proposal.no_votes, GovernanceError::ProposalDefeated);

        proposal.status = ProposalStatus::Queued as u8;
        proposal.timelock_end = Some(
            clock.unix_timestamp + if proposal.emergency { EMERGENCY_TIMELOCK } else { STANDARD_TIMELOCK }
        );

        emit!(ProposalQueued {
            proposal_id,
            timelock_end: proposal.timelock_end.unwrap(),
        });
        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>, proposal_id: u64) -> Result<()> {
        let proposal = &ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(proposal.status == ProposalStatus::Queued as u8, GovernanceError::ProposalNotQueued);
        require!(
            clock.unix_timestamp >= proposal.timelock_end.unwrap(),
            GovernanceError::TimelockNotExpired
        );

        let governance_bump = ctx.bumps.governance_pda;
        let seeds = &[b"governance-pda", &[governance_bump]];
        let signer_seeds = &[&seeds[..]];

        for i in 0..proposal.target_count as usize {
            let start = i * 32;
            let end = start + 32;
            let mut pk_bytes = [0u8; 32];
            pk_bytes.copy_from_slice(&proposal.targets[start..end]);
            let target = Pubkey::new_from_array(pk_bytes);

            let instr_start = i * MAX_INSTRUCTION_DATA;
            let instr_end = instr_start + MAX_INSTRUCTION_DATA;
            let data = proposal.instruction_data[instr_start..instr_end].to_vec();

            let _ = solana_program::program::invoke_signed(
                &solana_program::instruction::Instruction {
                    program_id: target,
                    accounts: vec![],
                    data,
                },
                &[ctx.accounts.governance_pda.to_account_info()],
                signer_seeds,
            );
        }

        proposal.status = ProposalStatus::Executed as u8;
        proposal.executed_at = Some(clock.unix_timestamp);

        emit!(ProposalExecuted {
            proposal_id,
            executed_by: ctx.accounts.executor.key(),
        });
        Ok(())
    }

    pub fn cancel_proposal(ctx: Context<CancelProposal>, proposal_id: u64) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(proposal.status == ProposalStatus::Active as u8, GovernanceError::ProposalNotActive);
        require!(
            proposal.proposer == ctx.accounts.canceller.key()
                || ctx.accounts.config.governance_authority == ctx.accounts.canceller.key(),
            GovernanceError::NotAuthorToCancel
        );

        proposal.status = ProposalStatus::Cancelled as u8;

        emit!(ProposalCancelled {
            proposal_id,
            cancelled_by: ctx.accounts.canceller.key(),
        });
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateGovernanceConfig>,
        new_authority: Option<Pubkey>,
        pause: Option<bool>,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(config.governance_authority == ctx.accounts.authority.key(), GovernanceError::Unauthorized);

        if let Some(authority) = new_authority {
            config.governance_authority = authority;
        }
        if let Some(paused) = pause {
            config.paused = paused;
        }

        emit!(GovernanceConfigUpdated {
            authority: config.governance_authority,
            paused: config.paused,
        });
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum VoteType {
    Yes,
    No,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum ProposalStatus {
    Active = 0,
    Queued = 1,
    Executed = 2,
    Cancelled = 3,
}

#[account]
#[derive(InitSpace)]
pub struct GovernanceConfig {
    pub governance_authority: Pubkey,
    pub proposal_count: u64,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Pubkey,
    #[max_len(PROPOSAL_DESCRIPTION_MAX_LEN)]
    pub description: String,
    pub target_count: u8,
    pub targets: [u8; MAX_TARGETS * 32],
    pub instruction_data: [u8; MAX_TARGETS * MAX_INSTRUCTION_DATA],
    pub yes_votes: u64,
    pub no_votes: u64,
    pub voting_end: i64,
    pub executed_at: Option<i64>,
    pub timelock_end: Option<i64>,
    pub emergency: bool,
    pub status: u8,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + GovernanceConfig::INIT_SPACE,
        seeds = [b"governance-config"],
        bump
    )]
    pub config: Account<'info, GovernanceConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,

    pub config: Account<'info, GovernanceConfig>,

    #[account(
        seeds = [b"stake", staker.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, zkc_token::StakeAccount>,

    #[account(
        init,
        payer = staker,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", &config.proposal_count.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CastVote<'info> {
    pub voter: Signer<'info>,

    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [b"proposal", &proposal_id.to_le_bytes()],
        bump,
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        seeds = [b"stake", voter.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, zkc_token::StakeAccount>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct QueueProposal<'info> {
    pub caller: Signer<'info>,

    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [b"proposal", &proposal_id.to_le_bytes()],
        bump,
    )]
    pub proposal: Account<'info, Proposal>,

    /// CHECK: staking vault ATA — balance used for quorum check
    #[account(
        mut,
        seeds = [b"staking-vault"],
        bump,
    )]
    pub staking_vault: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,

    pub config: Account<'info, GovernanceConfig>,

    /// CHECK: governance PDA — signs as authority for CPI calls
    #[account(
        seeds = [b"governance-pda"],
        bump,
    )]
    pub governance_pda: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"proposal", &proposal_id.to_le_bytes()],
        bump,
    )]
    pub proposal: Account<'info, Proposal>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CancelProposal<'info> {
    #[account(mut)]
    pub canceller: Signer<'info>,

    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [b"proposal", &proposal_id.to_le_bytes()],
        bump,
    )]
    pub proposal: Account<'info, Proposal>,
}

#[derive(Accounts)]
pub struct UpdateGovernanceConfig<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"governance-config"],
        bump,
    )]
    pub config: Account<'info, GovernanceConfig>,
}

#[error_code]
pub enum GovernanceError {
    #[msg("Protocol is paused")]
    Paused,
    #[msg("Description exceeds maximum length")]
    DescriptionTooLong,
    #[msg("No target programs specified")]
    NoTargets,
    #[msg("Too many target programs (max 8)")]
    TooManyTargets,
    #[msg("Targets and instructions length mismatch")]
    TargetsInstructionsMismatch,
    #[msg("User is not the stake account owner")]
    NotStakeOwner,
    #[msg("Insufficient stake to create a proposal")]
    InsufficientStakeToPropose,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Proposal is not active")]
    ProposalNotActive,
    #[msg("Voting period has ended")]
    VotingEnded,
    #[msg("No voting power — stake ZKC tokens first")]
    NoVotingPower,
    #[msg("Voting is still active")]
    VotingStillActive,
    #[msg("Quorum not reached")]
    QuorumNotMet,
    #[msg("Proposal was defeated")]
    ProposalDefeated,
    #[msg("Proposal is not queued")]
    ProposalNotQueued,
    #[msg("Timelock has not expired yet")]
    TimelockNotExpired,
    #[msg("Not authorized to cancel")]
    NotAuthorToCancel,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("No staked tokens in the staking vault")]
    NoStakedTokens,
}

#[event]
pub struct GovernanceInitialized {
    pub authority: Pubkey,
}

#[event]
pub struct ProposalCreated {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub description: String,
    pub emergency: bool,
}

#[event]
pub struct VoteCast {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub vote: VoteType,
    pub voting_power: u64,
}

#[event]
pub struct ProposalQueued {
    pub proposal_id: u64,
    pub timelock_end: i64,
}

#[event]
pub struct ProposalExecuted {
    pub proposal_id: u64,
    pub executed_by: Pubkey,
}

#[event]
pub struct ProposalCancelled {
    pub proposal_id: u64,
    pub cancelled_by: Pubkey,
}

#[event]
pub struct GovernanceConfigUpdated {
    pub authority: Pubkey,
    pub paused: bool,
}
