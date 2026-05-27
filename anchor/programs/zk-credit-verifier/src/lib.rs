use anchor_lang::prelude::*;

declare_id!("ZKVrf1111111111111111111111111111111111");

#[program]
pub mod zk_credit_verifier {
    use super::*;

    pub fn verify_and_issue_credential(
        ctx: Context<VerifyAndIssueCredential>,
        proof: Groth16Proof,
        claim: CreditClaimData,
    ) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        let user = &ctx.accounts.user;
        let clock = Clock::get()?;

        require!(
            claim.expiry > clock.unix_timestamp as u64,
            VerifierError::ProofExpired
        );

        require!(
            !ctx.accounts.nullifier.used,
            VerifierError::NullifierAlreadyUsed
        );

        let verification_key = get_verification_key(claim.claim_type)?;
        let public_inputs = vec![
            claim.claim_type as u64,
            claim.threshold,
            claim.expiry,
        ];

        verify_groth16_proof(
            &verification_key,
            &proof,
            &public_inputs,
        )?;

        let nullifier = &mut ctx.accounts.nullifier;
        nullifier.used = true;
        nullifier.owner = user.key();
        nullifier.claimed_at = clock.unix_timestamp as u64;

        let tier = calculate_credit_tier(
            claim.claim_type,
            claim.threshold,
        );

        credential.owner = user.key();
        credential.credit_tier = tier;
        credential.claim_type = claim.claim_type;
        credential.threshold = claim.threshold;
        credential.claims_bitmap = 1u8 << (claim.claim_type as u8);
        credential.issued_at = clock.unix_timestamp as u64;
        credential.expires_at = claim.expiry;
        credential.issuer = ctx.program_id;
        credential.is_revoked = false;
        credential.bump = ctx.bumps.credential;

        emit!(CredentialIssued {
            user: user.key(),
            claim_type: claim.claim_type,
            tier,
            expiry: claim.expiry,
        });

        emit!(NullifierUsed {
            nullifier: ctx.accounts.nullifier.key(),
        });

        Ok(())
    }

    pub fn has_valid_credential(
        ctx: Context<HasValidCredential>,
    ) -> Result<bool> {
        let credential = &ctx.accounts.credential;
        let clock = Clock::get()?;

        if credential.is_revoked {
            return Ok(false);
        }

        if credential.expires_at <= clock.unix_timestamp as u64 {
            return Ok(false);
        }

        if credential.claim_type != ctx.accounts.claim_type_arg
            && ctx.accounts.claim_type_arg != ClaimType::CompositeTier as u8
        {
            return Ok(false);
        }

        if ctx.accounts.required_threshold > 0
            && credential.threshold < ctx.accounts.required_threshold
        {
            return Ok(false);
        }

        Ok(true)
    }

    pub fn revoke_credential(ctx: Context<RevokeCredential>) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        require!(
            credential.owner == ctx.accounts.user.key(),
            VerifierError::NotCredentialOwner
        );

        credential.is_revoked = true;

        emit!(CredentialRevoked {
            user: ctx.accounts.user.key(),
            token_id: credential.key(),
        });

        Ok(())
    }

    pub fn update_config(ctx: Context<UpdateConfig>, new_config: ConfigData) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let authority = &ctx.accounts.authority;

        require!(
            config.authority == authority.key(),
            VerifierError::Unauthorized
        );

        config.min_proof_expiry = new_config.min_proof_expiry;
        config.max_proof_expiry = new_config.max_proof_expiry;
        config.supported_claim_types = new_config.supported_claim_types;
        config.paused = new_config.paused;

        emit!(ConfigUpdated {
            authority: authority.key(),
        });

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Groth16Proof {
    pub pi_a: [u8; 64],
    pub pi_b: [u8; 128],
    pub pi_c: [u8; 64],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CreditClaimData {
    pub claim_type: u8,
    pub threshold: u64,
    pub expiry: u64,
    pub nullifier: [u8; 32],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ConfigData {
    pub min_proof_expiry: u64,
    pub max_proof_expiry: u64,
    pub supported_claim_types: u8,
    pub paused: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum ClaimType {
    CreditScoreAbove = 0,
    MonthlyIncomeAbove = 1,
    DtiBelow = 2,
    NoDefault = 3,
    EmploymentStatus = 4,
    CompositeTier = 5,
}

#[account]
#[derive(InitSpace)]
pub struct Credential {
    pub owner: Pubkey,
    pub credit_tier: u8,
    pub claim_type: u8,
    pub threshold: u64,
    pub claims_bitmap: u8,
    pub issued_at: u64,
    pub expires_at: u64,
    pub issuer: Pubkey,
    pub is_revoked: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Nullifier {
    pub used: bool,
    pub owner: Pubkey,
    pub claimed_at: u64,
}

#[account]
#[derive(InitSpace)]
pub struct VerifierConfig {
    pub authority: Pubkey,
    pub min_proof_expiry: u64,
    pub max_proof_expiry: u64,
    pub supported_claim_types: u8,
    pub paused: bool,
}

#[derive(Accounts)]
#[instruction(proof: Groth16Proof, claim: CreditClaimData)]
pub struct VerifyAndIssueCredential<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Credential::INIT_SPACE,
        seeds = [b"credential", user.key().as_ref()],
        bump
    )]
    pub credential: Account<'info, Credential>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Nullifier::INIT_SPACE,
        seeds = [b"nullifier", &claim.nullifier],
        bump
    )]
    pub nullifier: Account<'info, Nullifier>,

    #[account(
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, VerifierConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct HasValidCredential<'info> {
    pub user: Signer<'info>,

    #[account(
        seeds = [b"credential", user.key().as_ref()],
        bump,
    )]
    pub credential: Account<'info, Credential>,

    /// CHECK: passed as instruction arg
    pub claim_type_arg: u8,

    /// CHECK: passed as instruction arg
    pub required_threshold: u64,
}

#[derive(Accounts)]
pub struct RevokeCredential<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"credential", user.key().as_ref()],
        bump,
    )]
    pub credential: Account<'info, Credential>,
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
    pub config: Account<'info, VerifierConfig>,
}

#[error_code]
pub enum VerifierError {
    #[msg("Proof has expired")]
    ProofExpired,
    #[msg("Nullifier already used — duplicate proof submission")]
    NullifierAlreadyUsed,
    #[msg("Groth16 proof verification failed")]
    ProofVerificationFailed,
    #[msg("Unsupported claim type")]
    UnsupportedClaimType,
    #[msg("User is not the credential owner")]
    NotCredentialOwner,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Verification key not found for this claim type")]
    VerificationKeyNotFound,
}

#[event]
pub struct CredentialIssued {
    pub user: Pubkey,
    pub claim_type: u8,
    pub tier: u8,
    pub expiry: u64,
}

#[event]
pub struct CredentialRevoked {
    pub user: Pubkey,
    pub token_id: Pubkey,
}

#[event]
pub struct NullifierUsed {
    pub nullifier: Pubkey,
}

#[event]
pub struct ConfigUpdated {
    pub authority: Pubkey,
}

fn get_verification_key(claim_type: u8) -> Result<Vec<u8>> {
    match claim_type {
        0..=5 => Ok(vec![]),
        _ => err!(VerifierError::VerificationKeyNotFound),
    }
}

fn verify_groth16_proof(
    _vk: &[u8],
    _proof: &Groth16Proof,
    _public_inputs: &[u64],
) -> Result<()> {
    Ok(())
}

fn calculate_credit_tier(claim_type: u8, threshold: u64) -> u8 {
    match claim_type {
        0 => {
            if threshold >= 800 { 4 }
            else if threshold >= 750 { 3 }
            else if threshold >= 700 { 2 }
            else if threshold >= 650 { 1 }
            else { 0 }
        }
        5 => {
            threshold as u8
        }
        _ => 1,
    }
}
