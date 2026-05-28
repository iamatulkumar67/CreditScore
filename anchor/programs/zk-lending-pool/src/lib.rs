use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("HbHw6ib3eCfxbV1tv7X817VZ9J9tR4ZLGpNEQJ2jYDQo");

#[program]
pub mod zk_lending_pool {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        config: LendingPoolConfig,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        pool.authority = ctx.accounts.authority.key();
        pool.mint = ctx.accounts.mint.key();
        pool.total_deposits = 0;
        pool.total_borrows = 0;
        pool.utilization_rate = 0;
        pool.base_rate = config.base_rate;
        pool.optimal_utilization = config.optimal_utilization;
        pool.slope1 = config.slope1;
        pool.slope2 = config.slope2;
        pool.last_update = clock.slot;
        pool.loan_counter = 0;
        pool.paused = false;
        pool.bump = ctx.bumps.pool;

        emit!(PoolInitialized {
            pool: pool.key(),
            mint: ctx.accounts.mint.key(),
            authority: ctx.accounts.authority.key(),
        });

        Ok(())
    }

    pub fn deposit_and_borrow(
        ctx: Context<DepositAndBorrow>,
        collateral_amount: u64,
        borrow_amount: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;

        require!(!ctx.accounts.pool.paused, LendingError::PoolPaused);

        let credential_tier = read_credential_tier(&ctx.accounts.credential)?;
        let (allowed_ratio, max_borrow) = get_applicable_terms(
            credential_tier,
        )?;

        require!(
            borrow_amount <= max_borrow,
            LendingError::ExceedsMaxBorrow
        );

        let required_collateral = borrow_amount
            .checked_mul(allowed_ratio)
            .ok_or(LendingError::MathOverflow)?
            .checked_div(10000)
            .ok_or(LendingError::MathOverflow)?;

        require!(
            collateral_amount >= required_collateral,
            LendingError::InsufficientCollateral
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_collateral_ata.to_account_info(),
                    to: ctx.accounts.vault_collateral.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            collateral_amount,
        )?;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_borrow.to_account_info(),
                    to: ctx.accounts.user_borrow_ata.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                &[&[
                    b"vault",
                    ctx.accounts.borrow_mint.key().as_ref(),
                    &[ctx.accounts.pool.bump],
                ]],
            ),
            borrow_amount,
        )?;

        let loan = &mut ctx.accounts.loan;
        loan.borrower = ctx.accounts.user.key();
        loan.collateral_mint = ctx.accounts.collateral_mint.key();
        loan.collateral_amount = collateral_amount;
        loan.borrow_mint = ctx.accounts.borrow_mint.key();
        loan.borrow_amount = borrow_amount;
        loan.collateral_ratio = allowed_ratio;
        loan.credit_tier_at_issuance = credential_tier;
        loan.interest_rate = get_borrow_rate(ctx.accounts.pool.utilization_rate, loan.credit_tier_at_issuance, &ctx.accounts.pool);
        loan.start_timestamp = clock.unix_timestamp as u64;
        loan.maturity_timestamp = 0;
        loan.status = LoanStatus::Active as u8;
        loan.repaid_amount = 0;
        loan.bump = ctx.bumps.loan;

        let pool = &mut ctx.accounts.pool;
        pool.loan_counter = pool.loan_counter.checked_add(1).ok_or(LendingError::MathOverflow)?;

        emit!(LoanCreated {
            loan_id: loan.key(),
            borrower: ctx.accounts.user.key(),
            amount: borrow_amount,
            credit_tier: loan.credit_tier_at_issuance,
        });

        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, loan_id: u64, amount: u64) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let clock = Clock::get()?;

        require!(
            loan.status == LoanStatus::Active as u8,
            LendingError::LoanNotActive
        );

        let actual_repay = if amount > loan.borrow_amount - loan.repaid_amount {
            loan.borrow_amount - loan.repaid_amount
        } else {
            amount
        };

        require!(actual_repay > 0, LendingError::InsufficientRepayAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_borrow_ata.to_account_info(),
                    to: ctx.accounts.vault_borrow.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            actual_repay,
        )?;

        loan.repaid_amount = loan
            .repaid_amount
            .checked_add(actual_repay)
            .ok_or(LendingError::MathOverflow)?;

        if loan.repaid_amount >= loan.borrow_amount {
            loan.status = LoanStatus::Repaid as u8;
        }

        emit!(LoanRepaid {
            loan_id: loan.key(),
            amount: actual_repay,
            full_repayment: loan.status == LoanStatus::Repaid as u8,
        });

        Ok(())
    }

    pub fn liquidate(ctx: Context<Liquidate>, loan_id: u64, debt_to_cover: u64) -> Result<()> {
        let loan = &mut ctx.accounts.loan;

        require!(
            loan.status == LoanStatus::Active as u8,
            LendingError::LoanNotActive
        );

        let borrow_decimals = ctx.accounts.borrow_mint.decimals as u32;
        let collat_decimals = ctx.accounts.collateral_mint.decimals as u32;

        let borrow_value = (debt_to_cover as u128)
            .checked_mul(100_000_000u128)
            .ok_or(LendingError::MathOverflow)?
            .checked_div(10u128.pow(borrow_decimals))
            .ok_or(LendingError::MathOverflow)?;

        let collat_value = (loan.collateral_amount as u128)
            .checked_mul(100_000_000u128)
            .ok_or(LendingError::MathOverflow)?
            .checked_div(10u128.pow(collat_decimals))
            .ok_or(LendingError::MathOverflow)?;

        let current_ratio = if borrow_value > 0 {
            (collat_value * 10000).checked_div(borrow_value)
                .ok_or(LendingError::MathOverflow)?
        } else {
            0
        };

        let liquidation_threshold = loan
            .collateral_ratio
            .checked_sub(500)
            .ok_or(LendingError::MathOverflow)?;

        require!(
            current_ratio < liquidation_threshold as u128,
            LendingError::NotEligibleForLiquidation
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.liquidator_borrow_ata.to_account_info(),
                    to: ctx.accounts.vault_borrow.to_account_info(),
                    authority: ctx.accounts.liquidator.to_account_info(),
                },
            ),
            debt_to_cover,
        )?;

        let collateral_to_seize = (debt_to_cover as u128)
            .checked_mul(10500u128)
            .ok_or(LendingError::MathOverflow)?
            .checked_div(10000u128)
            .ok_or(LendingError::MathOverflow)?;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_collateral.to_account_info(),
                    to: ctx.accounts.liquidator_collateral_ata.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                &[&[
                    b"vault",
                    ctx.accounts.collateral_mint.key().as_ref(),
                    &[ctx.accounts.pool.bump],
                ]],
            ),
            collateral_to_seize as u64,
        )?;

        loan.status = LoanStatus::Liquidated as u8;

        emit!(Liquidation {
            borrower: loan.borrower,
            liquidator: ctx.accounts.liquidator.key(),
            debt_covered: debt_to_cover,
            collateral_seized: collateral_to_seize as u64,
        });

        Ok(())
    }

    pub fn get_borrow_rate(
        ctx: Context<GetBorrowRate>,
    ) -> Result<u64> {
        let pool = &ctx.accounts.pool;
        let utilization = pool.utilization_rate;

        let rate = if utilization <= pool.optimal_utilization {
            pool.base_rate as u128
                + ((utilization as u128) * (pool.slope1 as u128))
                    .checked_div(pool.optimal_utilization as u128)
                    .ok_or(LendingError::MathOverflow)?
        } else {
            let excess = (utilization as u128)
                .checked_sub(pool.optimal_utilization as u128)
                .ok_or(LendingError::MathOverflow)?;
            let max_util = 100u128;
            pool.base_rate as u128
                + (pool.slope1 as u128)
                + (excess * (pool.slope2 as u128 - pool.slope1 as u128))
                    .checked_div(max_util.checked_sub(pool.optimal_utilization as u128).ok_or(LendingError::MathOverflow)?)
                    .ok_or(LendingError::MathOverflow)?
        };

        Ok(rate as u64)
    }

    pub fn update_pool_config(
        ctx: Context<UpdatePoolConfig>,
        new_config: LendingPoolConfig,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.authority == ctx.accounts.authority.key(),
            LendingError::Unauthorized
        );

        pool.base_rate = new_config.base_rate;
        pool.optimal_utilization = new_config.optimal_utilization;
        pool.slope1 = new_config.slope1;
        pool.slope2 = new_config.slope2;
        pool.paused = new_config.paused;

        emit!(PoolConfigUpdated {
            pool: pool.key(),
            authority: ctx.accounts.authority.key(),
        });

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct LendingPoolConfig {
    pub base_rate: u64,
    pub optimal_utilization: u64,
    pub slope1: u64,
    pub slope2: u64,
    pub paused: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum LoanStatus {
    Active = 0,
    Repaid = 1,
    Liquidated = 2,
}

#[account]
#[derive(InitSpace)]
pub struct LendingPool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_deposits: u64,
    pub total_borrows: u64,
    pub utilization_rate: u64,
    pub base_rate: u64,
    pub optimal_utilization: u64,
    pub slope1: u64,
    pub slope2: u64,
    pub last_update: u64,
    pub loan_counter: u64,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Loan {
    pub borrower: Pubkey,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub borrow_mint: Pubkey,
    pub borrow_amount: u64,
    pub interest_rate: u64,
    pub collateral_ratio: u64,
    pub credit_tier_at_issuance: u8,
    pub start_timestamp: u64,
    pub maturity_timestamp: u64,
    pub status: u8,
    pub repaid_amount: u64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = 8 + LendingPool::INIT_SPACE,
        seeds = [b"lending-pool", mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, LendingPool>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(collateral_amount: u64, borrow_amount: u64)]
pub struct DepositAndBorrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub collateral_mint: Account<'info, Mint>,
    pub borrow_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"lending-pool", borrow_mint.key().as_ref()],
        bump,
    )]
    pub pool: Account<'info, LendingPool>,

    #[account(
        mut,
        seeds = [b"vault", collateral_mint.key().as_ref()],
        bump,
    )]
    pub vault_collateral: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", borrow_mint.key().as_ref()],
        bump,
    )]
    pub vault_borrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = collateral_mint,
        token::authority = user,
    )]
    pub user_collateral_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = borrow_mint,
        token::authority = user,
    )]
    pub user_borrow_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = user,
        space = 8 + Loan::INIT_SPACE,
        seeds = [b"loan", user.key().as_ref(), &pool.loan_counter.to_le_bytes()],
        bump
    )]
    pub loan: Account<'info, Loan>,

    /// CHECK: ZK credential account from zk-credit-verifier program
    #[account(
        seeds = [b"credential", user.key().as_ref()],
        bump,
        seeds::program = verifier_program.key(),
    )]
    pub credential: UncheckedAccount<'info>,

    /// CHECK: zk-credit-verifier program ID — used to derive credential PDA
    pub verifier_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(loan_id: u64, amount: u64)]
pub struct Repay<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub borrow_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"loan", borrower.key().as_ref(), &loan_id.to_le_bytes()],
        bump,
    )]
    pub loan: Account<'info, Loan>,

    /// CHECK: borrower of the loan
    pub borrower: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"vault", borrow_mint.key().as_ref()],
        bump,
    )]
    pub vault_borrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = borrow_mint,
        token::authority = user,
    )]
    pub user_borrow_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(loan_id: u64, debt_to_cover: u64)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,

    pub collateral_mint: Account<'info, Mint>,
    pub borrow_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"lending-pool", borrow_mint.key().as_ref()],
        bump,
    )]
    pub pool: Account<'info, LendingPool>,

    #[account(
        mut,
        seeds = [b"loan", borrower.key().as_ref(), &loan_id.to_le_bytes()],
        bump,
    )]
    pub loan: Account<'info, Loan>,

    /// CHECK: borrower of the loan
    pub borrower: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"vault", collateral_mint.key().as_ref()],
        bump,
    )]
    pub vault_collateral: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", borrow_mint.key().as_ref()],
        bump,
    )]
    pub vault_borrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = borrow_mint,
        token::authority = liquidator,
    )]
    pub liquidator_borrow_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = collateral_mint,
        token::authority = liquidator,
    )]
    pub liquidator_collateral_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetBorrowRate<'info> {
    pub pool: Account<'info, LendingPool>,
}

#[derive(Accounts)]
pub struct UpdatePoolConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lending-pool", pool.mint.key().as_ref()],
        bump,
    )]
    pub pool: Account<'info, LendingPool>,
}

#[error_code]
pub enum LendingError {
    #[msg("Pool is paused")]
    PoolPaused,
    #[msg("Borrow amount exceeds maximum")]
    ExceedsMaxBorrow,
    #[msg("Insufficient collateral provided")]
    InsufficientCollateral,
    #[msg("Loan is not active")]
    LoanNotActive,
    #[msg("Loan is not eligible for liquidation")]
    NotEligibleForLiquidation,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid collateral price")]
    InvalidCollateralPrice,
    #[msg("Invalid borrow price")]
    InvalidBorrowPrice,
    #[msg("Repay amount must be greater than zero")]
    InsufficientRepayAmount,
}

#[event]
pub struct PoolInitialized {
    pub pool: Pubkey,
    pub mint: Pubkey,
    pub authority: Pubkey,
}

#[event]
pub struct LoanCreated {
    pub loan_id: Pubkey,
    pub borrower: Pubkey,
    pub amount: u64,
    pub credit_tier: u8,
}

#[event]
pub struct LoanRepaid {
    pub loan_id: Pubkey,
    pub amount: u64,
    pub full_repayment: bool,
}

#[event]
pub struct Liquidation {
    pub borrower: Pubkey,
    pub liquidator: Pubkey,
    pub debt_covered: u64,
    pub collateral_seized: u64,
}

#[event]
pub struct PoolConfigUpdated {
    pub pool: Pubkey,
    pub authority: Pubkey,
}

fn read_credential_tier(credential: &UncheckedAccount) -> Result<u8> {
    let data = credential.try_borrow_data()?;
    if data.len() < 41 {
        return Ok(0);
    }
    // Anchor discriminator (8) + owner Pubkey (32) = offset 40 for credit_tier
    Ok(data[40])
}

fn get_applicable_terms(
    credit_tier: u8,
) -> Result<(u64, u64)> {
    let tier_ratios: [u64; 5] = [15000, 11000, 8000, 6000, 5000];
    let max_loans: [u64; 5] = [50000, 100000, 250000, 500000, 1_000_000];

    let tier = credit_tier as usize;
    let ratio = if tier < tier_ratios.len() {
        tier_ratios[tier]
    } else {
        tier_ratios[0]
    };
    let max_loan = if tier < max_loans.len() {
        max_loans[tier]
    } else {
        max_loans[0]
    };

    Ok((ratio, max_loan))
}

fn get_borrow_rate(
    utilization: u64,
    _credit_tier: u8,
    pool: &Account<LendingPool>,
) -> u64 {
    let base = if utilization <= pool.optimal_utilization {
        pool.base_rate
            + (utilization * pool.slope1) / pool.optimal_utilization
    } else {
        let excess = utilization - pool.optimal_utilization;
        pool.base_rate
            + pool.slope1
            + (excess * (pool.slope2 - pool.slope1))
                / (100 - pool.optimal_utilization)
    };

    let tier_discounts: [u64; 5] = [0, 200, 400, 600, 800];
    let discount = tier_discounts[_credit_tier as usize];

    if base > discount { base - discount } else { 50 }
}


