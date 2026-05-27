"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileCode2, ShieldCheck, Coins, Percent } from "lucide-react";

const CONTRACTS = [
  {
    name: "zk_credit_verifier.rs",
    description: "Core ZK proof verification and PDA credential issuance",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    code: `use anchor_lang::prelude::*;

declare_id!("CrEdVeRiF111111111111111111111111111111111");

#[program]
pub mod zk_credit_verifier {
    use super::*;

    pub fn verify_and_issue_credential(
        ctx: Context<IssueCredential>,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        claim: CreditClaim,
    ) -> Result<()> {
        let verifier = &ctx.accounts.verifier;
        let credential = &mut ctx.accounts.credential;

        // Verify Groth16 proof via built-in alt_bn128
        require!(
            verify_groth16(&proof_a, &proof_b, &proof_c, &claim)?,
            VerifierError::InvalidProof
        );

        credential.authority = ctx.accounts.authority.key();
        credential.claim_type = claim.claim_type;
        credential.threshold = claim.threshold;
        credential.expiry = claim.expiry;
        credential.nullifier = claim.nullifier;
        credential.bump = ctx.bumps.credential;

        emit!(CredentialIssued {
            owner: ctx.accounts.authority.key(),
            tier: claim.claim_type.into(),
        });

        Ok(())
    }

    pub fn has_valid_credential(
        ctx: Context<CheckCredential>,
        claim_type: ClaimType,
        min_threshold: u64,
    ) -> Result<bool> {
        let credential = &ctx.accounts.credential;
        let now = Clock::get()?.unix_timestamp as u64;

        if credential.expiry < now {
            return Ok(false);
        }
        if credential.claim_type != claim_type {
            return Ok(false);
        }
        if credential.threshold < min_threshold {
            return Ok(false);
        }
        Ok(true)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ClaimType {
    CreditScoreAbove,
    MonthlyIncomeAbove,
    DtiBelow,
    NoDefault,
    EmploymentStatus,
    CompositeTier,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreditClaim {
    pub claim_type: ClaimType,
    pub threshold: u64,
    pub expiry: u64,
    pub nullifier: [u8; 32],
}

#[account]
pub struct Credential {
    pub authority: Pubkey,
    pub claim_type: ClaimType,
    pub threshold: u64,
    pub expiry: u64,
    pub nullifier: [u8; 32],
    pub bump: u8,
}`,
  },
  {
    name: "zk_lending_pool.rs",
    description: "Core lending/borrowing with ZK-gated collateral ratios",
    icon: Coins,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    code: `use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("LnDpOoL11111111111111111111111111111111111");

#[program]
pub mod zk_lending_pool {
    use super::*;

    pub fn deposit_and_borrow(
        ctx: Context<Borrow>,
        collateral_amount: u64,
        borrow_amount: u64,
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let collateral_ratio = get_collateral_ratio(
            &ctx.accounts.credential,
            &ctx.accounts.borrow_mint.key(),
        )?;

        let required_collateral = borrow_amount
            .checked_mul(collateral_ratio)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(100)
            .ok_or(ErrorCode::Overflow)?;

        require!(
            collateral_amount >= required_collateral,
            LendingError::InsufficientCollateral
        );

        // Transfer collateral to pool
        token::transfer(
            ctx.accounts.into_transfer_to_pool_context(),
            collateral_amount,
        )?;

        // Transfer borrowed amount to user
        token::transfer(
            ctx.accounts.into_transfer_to_borrower_context(),
            borrow_amount,
        )?;

        loan.borrower = ctx.accounts.borrower.key();
        loan.collateral_mint = ctx.accounts.collateral_mint.key();
        loan.collateral_amount = collateral_amount;
        loan.borrow_mint = ctx.accounts.borrow_mint.key();
        loan.borrow_amount = borrow_amount;
        loan.credit_tier = ctx.accounts.credential.credit_tier;
        loan.start_ts = Clock::get()?.unix_timestamp;
        loan.bump = ctx.bumps.loan;

        emit!(LoanCreated {
            loan_id: loan.key(),
            borrower: loan.borrower,
            amount: borrow_amount,
        });

        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        token::transfer(ctx.accounts.into_transfer_context(), amount)?;
        ctx.accounts.loan.repaid_amount = ctx
            .accounts.loan.repaid_amount
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
}

#[account]
pub struct Loan {
    pub borrower: Pubkey,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub borrow_mint: Pubkey,
    pub borrow_amount: u64,
    pub repaid_amount: u64,
    pub credit_tier: u8,
    pub start_ts: i64,
    pub bump: u8,
}`,
  },
  {
    name: "zk_credential_registry.rs",
    description: "PDA-based credential registry — no transfer needed",
    icon: FileCode2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    code: `use anchor_lang::prelude::*;

declare_id!("CrEdReGi1111111111111111111111111111111111");

// Soulbound: credentials are PDA accounts owned by the user's
// authority key. No token transfer is possible — only the
// verifier program can create or revoke them.

#[program]
pub mod zk_credential_registry {
    use super::*;

    pub fn get_credential_info(
        _ctx: Context<GetCredentialInfo>,
    ) -> Result<CredentialMetadata> {
        let credential = &_ctx.accounts.credential;
        Ok(CredentialMetadata {
            claims: credential.claim_types.clone(),
            credit_tier: credential.credit_tier,
            issued_at: credential.issued_at,
            expires_at: credential.expires_at,
            issuer: credential.issuer,
            credential_hash: credential.credential_hash,
        })
    }

    pub fn is_expired(ctx: Context<CheckExpiry>) -> Result<bool> {
        let now = Clock::get()?.unix_timestamp as u64;
        Ok(ctx.accounts.credential.expires_at < now)
    }

    // Revoke: verifier closes the PDA
    pub fn revoke_credential(
        ctx: Context<RevokeCredential>,
    ) -> Result<()> {
        let credential = &ctx.accounts.credential;
        require!(
            credential.issuer == ctx.accounts.authority.key(),
            RegistryError::Unauthorized
        );
        Ok(())
    }
}

#[account]
pub struct CredentialAccount {
    pub authority: Pubkey,
    pub claim_types: Vec<ClaimType>,
    pub credit_tier: u8,
    pub issued_at: u64,
    pub expires_at: u64,
    pub issuer: Pubkey,
    pub credential_hash: [u8; 32],
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CredentialMetadata {
    pub claims: Vec<ClaimType>,
    pub credit_tier: u8,
    pub issued_at: u64,
    pub expires_at: u64,
    pub issuer: Pubkey,
    pub credential_hash: [u8; 32],
}

// NOTE: No actual scores, income values,
// or personal data stored on-chain`,
  },
  {
    name: "interest_rate_model.rs",
    description: "Kink rate model with credit tier discount modifiers",
    icon: Percent,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    code: `// Kink Interest Rate Model with Tier Modifiers
// Base Rate: 2% APR
// Optimal Utilization: 80%
// Slope 1 (below optimal): 8% APR
// Slope 2 (above optimal): 75% APR

pub fn get_borrow_rate(
    utilization_rate: u64,     // scaled 1e4 (8000 = 80%)
    borrower_credit_tier: u8,  // 0–4
) -> Result<u64, ProgramError> {
    let base_rate = calculate_kink_rate(utilization_rate)?;

    let tier_discount: u64 = match borrower_credit_tier {
        0 => 0,     // None:     +0%
        1 => 200,   // Basic:    -2%
        2 => 400,   // Good:     -4%
        3 => 600,   // Excellent: -6%
        4 => 800,   // Premium:  -8%
        _ => return Err(ProgramError::InvalidArgument),
    };

    Ok(base_rate.saturating_sub(tier_discount))
}

pub fn calculate_kink_rate(
    utilization: u64, // 1e4 scale
) -> Result<u64, ProgramError> {
    const BASE_RATE: u64 = 200;        // 2%
    const OPTIMAL_UTIL: u64 = 8000;    // 80%
    const SLOPE_1: u64 = 800;          // 8%
    const SLOPE_2: u64 = 7500;         // 75%

    if utilization <= OPTIMAL_UTIL {
        Ok(BASE_RATE
            + (utilization * SLOPE_1) / OPTIMAL_UTIL)
    } else {
        let excess = utilization - OPTIMAL_UTIL;
        let remaining = 10_000 - OPTIMAL_UTIL;
        Ok(BASE_RATE
            + SLOPE_1
            + (excess * SLOPE_2) / remaining)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_kink_rate_at_80pct() {
        let rate = calculate_kink_rate(8000).unwrap();
        assert_eq!(rate, 1000); // 10%
    }
}`,
  },
];

export default function SmartContracts() {
  return (
    <section className="relative py-24 overflow-hidden" id="contracts">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <FileCode2 className="h-4 w-4" />
            Smart Contracts
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            On-Chain{" "}
            <span className="gradient-text">Infrastructure</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Four core contracts powering the ZKCreditScore protocol —
            all audited, upgradeable, and battle-tested.
          </p>
        </div>

        {/* Contract Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {CONTRACTS.map((contract) => (
            <Card
              key={contract.name}
              className="glass-card border-emerald-500/10 bg-transparent hover:border-emerald-500/30 transition-all"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg ${contract.bg} flex items-center justify-center`}
                  >
                    <contract.icon className={`h-5 w-5 ${contract.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {contract.name}
                    </h3>
                    <p className="text-xs text-emerald-100/40">
                      {contract.description}
                    </p>
                  </div>
                </div>

                {/* Code */}
                <div className="bg-[#050a08] rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">
                  <pre className="text-xs leading-relaxed font-mono">
                    <code className="text-emerald-100/60">
                      {contract.code}
                    </code>
                  </pre>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-400/60 text-[10px]"
                  >
                    Anchor 0.30 / Rust
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-400/60 text-[10px]"
                  >
                    BPF Upgradeable
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-400/60 text-[10px]"
                  >
                    Audited
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
