use anchor_lang::prelude::*;
use anchor_spl::token_2022::{
    self,
    Token2022,
    MintTo,
    TransferChecked,
    BurnChecked,
};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("ZKCToken1111111111111111111111111111111");

const MIN_STAKE_AMOUNT: u64 = 1_000_000_000_000;
const STAKING_REWARD_RATE: u64 = 500;
const PROTOCOL_FEE_DISCOUNT_BASIS: [u64; 5] = [0, 1000, 2000, 2500, 3000];
const SECONDS_IN_YEAR: u64 = 31_536_000;

#[program]
pub mod zkc_token {
    use super::*;

    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        total_supply: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.mint = ctx.accounts.mint.key();
        config.total_supply = total_supply;
        config.decimals = 9;
        config.paused = false;
        config.bump = ctx.bumps.config;

        let seeds = &[
            b"mint",
            &[ctx.bumps.mint],
        ];
        let signer_seeds = &[&seeds[..]];

        anchor_spl::token_2022::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                signer_seeds,
            ),
            total_supply,
        )?;

        emit!(TokenInitialized {
            mint: ctx.accounts.mint.key(),
            total_supply,
            authority: ctx.accounts.authority.key(),
        });

        Ok(())
    }

    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
        require!(
            amount >= MIN_STAKE_AMOUNT,
            TokenError::InsufficientStakeAmount
        );
        require!(!ctx.accounts.config.paused, TokenError::Paused);

        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        if stake_account.amount > 0 {
            let rewards = calculate_rewards(
                stake_account.amount,
                stake_account.staked_at,
                clock.unix_timestamp as u64,
            );
            stake_account.pending_rewards += rewards;
        }

        anchor_spl::token_2022::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.staking_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
            ),
            amount,
            ctx.accounts.mint.decimals,
        )?;

        stake_account.owner = ctx.accounts.user.key();
        stake_account.amount = stake_account.amount.checked_add(amount).ok_or(TokenError::MathOverflow)?;
        stake_account.staked_at = clock.unix_timestamp as u64;
        stake_account.bump = ctx.bumps.stake_account;

        emit!(TokensStaked {
            user: ctx.accounts.user.key(),
            amount,
            total_staked: stake_account.amount,
        });

        Ok(())
    }

    pub fn unstake_tokens(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        require!(
            stake_account.owner == ctx.accounts.user.key(),
            TokenError::NotStakeOwner
        );
        require!(stake_account.amount >= amount, TokenError::InsufficientStakedBalance);

        let rewards = calculate_rewards(
            stake_account.amount,
            stake_account.staked_at,
            clock.unix_timestamp as u64,
        );
        let total_rewards = stake_account.pending_rewards + rewards;

        if total_rewards > 0 {
            let seeds = &[b"mint", &[ctx.accounts.config.bump]];
            let signer_seeds = &[&seeds[..]];

            anchor_spl::token_2022::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    MintTo {
                        mint: ctx.accounts.mint.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: ctx.accounts.mint_authority.to_account_info(),
                    },
                    signer_seeds,
                ),
                total_rewards,
            )?;
        }

        anchor_spl::token_2022::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.staking_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.staking_vault_authority.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                &[&[
                    b"staking-vault",
                    &[ctx.accounts.staking_vault_bump],
                ]],
            ),
            amount,
            ctx.accounts.mint.decimals,
        )?;

        stake_account.amount = stake_account.amount.checked_sub(amount).ok_or(TokenError::MathOverflow)?;
        stake_account.pending_rewards = 0;
        stake_account.staked_at = clock.unix_timestamp as u64;

        emit!(TokensUnstaked {
            user: ctx.accounts.user.key(),
            amount,
            rewards: total_rewards,
            remaining_staked: stake_account.amount,
        });

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        require!(
            stake_account.owner == ctx.accounts.user.key(),
            TokenError::NotStakeOwner
        );

        let rewards = calculate_rewards(
            stake_account.amount,
            stake_account.staked_at,
            clock.unix_timestamp as u64,
        );
        let total_claim = stake_account.pending_rewards + rewards;

        require!(total_claim > 0, TokenError::NoRewardsToClaim);

        let seeds = &[b"mint", &[ctx.accounts.config.bump]];
        let signer_seeds = &[&seeds[..]];

        anchor_spl::token_2022::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                signer_seeds,
            ),
            total_claim,
        )?;

        stake_account.pending_rewards = 0;
        stake_account.staked_at = clock.unix_timestamp as u64;

        emit!(RewardsClaimed {
            user: ctx.accounts.user.key(),
            amount: total_claim,
        });

        Ok(())
    }

    pub fn get_fee_discount(ctx: Context<GetFeeDiscount>) -> Result<u64> {
        let stake_account = &ctx.accounts.stake_account;
        let clock = Clock::get()?;

        if stake_account.owner == Pubkey::default() || stake_account.amount == 0 {
            return Ok(0);
        }

        let duration = clock.unix_timestamp as u64 - stake_account.staked_at;
        let tier = if stake_account.amount >= 1_000_000_000_000_000 { 4 }
            else if stake_account.amount >= 500_000_000_000_000 { 3 }
            else if stake_account.amount >= 100_000_000_000_000 { 2 }
            else if stake_account.amount >= 10_000_000_000_000 { 1 }
            else { 0 };

        let duration_bonus = if duration >= SECONDS_IN_YEAR { 500u64 } else { 0u64 };

        let discount = PROTOCOL_FEE_DISCOUNT_BASIS[tier as usize]
            .checked_add(duration_bonus)
            .ok_or(TokenError::MathOverflow)?
            .min(3000);

        Ok(discount)
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_authority: Option<Pubkey>,
        pause: Option<bool>,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(
            config.authority == ctx.accounts.authority.key(),
            TokenError::Unauthorized
        );

        if let Some(authority) = new_authority {
            config.authority = authority;
        }
        if let Some(paused) = pause {
            config.paused = paused;
        }

        emit!(ConfigUpdated {
            authority: config.authority,
            paused: config.paused,
        });

        Ok(())
    }
}

fn calculate_rewards(amount: u64, staked_at: u64, now: u64) -> u64 {
    let duration = now.saturating_sub(staked_at);
    if duration == 0 || amount == 0 {
        return 0;
    }
    (amount as u128)
        .checked_mul(STAKING_REWARD_RATE as u128)
        .and_then(|v| v.checked_mul(duration as u128))
        .and_then(|v| v.checked_div(SECONDS_IN_YEAR as u128))
        .and_then(|v| v.checked_div(10000u128))
        .map(|v| v as u64)
        .unwrap_or(0)
}

#[account]
#[derive(InitSpace)]
pub struct TokenConfig {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_supply: u64,
    pub decimals: u8,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub amount: u64,
    pub staked_at: u64,
    pub pending_rewards: u64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
        mint::token_program = token_program,
    )]
    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    /// CHECK: mint authority PDA
    #[account(
        seeds = [b"mint"],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = treasury_authority,
        associated_token::token_program = token_program,
    )]
    pub treasury: InterfaceAccount<'info, anchor_spl::token_interface::TokenAccount>,

    /// CHECK: treasury authority PDA
    #[account(
        seeds = [b"treasury"],
        bump,
    )]
    pub treasury_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + TokenConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, TokenConfig>,

    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = user,
        token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, anchor_spl::token_interface::TokenAccount>,

    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    #[account(
        mut,
        seeds = [b"staking-vault"],
        bump,
    )]
    pub staking_vault: InterfaceAccount<'info, anchor_spl::token_interface::TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [b"stake", user.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, TokenConfig>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = user,
        token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, anchor_spl::token_interface::TokenAccount>,

    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    #[account(
        mut,
        seeds = [b"staking-vault"],
        bump,
    )]
    pub staking_vault: InterfaceAccount<'info, anchor_spl::token_interface::TokenAccount>,

    #[account(
        mut,
        seeds = [b"stake", user.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, TokenConfig>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = user,
        token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, anchor_spl::token_interface::TokenAccount>,

    pub mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,

    #[account(
        seeds = [b"mint"],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"stake", user.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, TokenConfig>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetFeeDiscount<'info> {
    pub user: Signer<'info>,

    #[account(
        seeds = [b"stake", user.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    pub config: Account<'info, TokenConfig>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, TokenConfig>,
}

#[error_code]
pub enum TokenError {
    #[msg("Insufficient stake amount. Minimum 1,000 ZKC required.")]
    InsufficientStakeAmount,
    #[msg("Protocol is paused")]
    Paused,
    #[msg("User is not the stake account owner")]
    NotStakeOwner,
    #[msg("Insufficient staked balance")]
    InsufficientStakedBalance,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unauthorized access")]
    Unauthorized,
}

#[event]
pub struct TokenInitialized {
    pub mint: Pubkey,
    pub total_supply: u64,
    pub authority: Pubkey,
}

#[event]
pub struct TokensStaked {
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
}

#[event]
pub struct TokensUnstaked {
    pub user: Pubkey,
    pub amount: u64,
    pub rewards: u64,
    pub remaining_staked: u64,
}

#[event]
pub struct RewardsClaimed {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ConfigUpdated {
    pub authority: Pubkey,
    pub paused: bool,
}
