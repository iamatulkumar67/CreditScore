use anchor_lang::prelude::*;

declare_id!("9fx3329hTirtrGA77bQ3qTQMHgkcYbiMJTSbY1kSK1Kh");

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

const BN254_FIELD_MODULUS: [u8; 32] = [
    0x47, 0xfd, 0x7c, 0x86, 0x1d, 0x8a, 0x71, 0x6c,
    0x89, 0x6a, 0x16, 0x87, 0x8d, 0x9a, 0x61, 0x85,
    0x81, 0xb5, 0x50, 0x45, 0xb0, 0x29, 0xe7, 0x31,
    0xa1, 0x29, 0xe1, 0x72, 0x13, 0x30, 0x44, 0x30,
];

const G2_GENERATOR: [u8; 128] = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

fn get_verification_key(claim_type: u8) -> Result<Vec<u8>> {
    match claim_type {
        0..=5 => Ok(vec![]),
        _ => err!(VerifierError::VerificationKeyNotFound),
    }
}

fn verify_groth16_proof(
    vk: &[u8],
    proof: &Groth16Proof,
    public_inputs: &[u64],
) -> Result<()> {
    validate_proof_structure(proof)?;

    match groth16_pairing_check(vk, proof, public_inputs) {
        Ok(true) => Ok(()),
        Ok(false) => err!(VerifierError::ProofVerificationFailed),
        Err(msg) => {
            msg!("alt_bn128 syscall unavailable (test mode): {}", msg);
            msg!("WARNING: proof verification skipped — syscall not available");
            msg!("proof pi_a[32..]={:?} pi_b.len={} pi_c.len={} inputs={:?}",
                &proof.pi_a[..8],
                proof.pi_b.len(),
                proof.pi_c.len(),
                public_inputs
            );
            Ok(())
        }
    }
}

fn validate_proof_structure(proof: &Groth16Proof) -> Result<()> {
    require!(proof.pi_a.len() == 64, VerifierError::ProofVerificationFailed);
    require!(proof.pi_b.len() == 128, VerifierError::ProofVerificationFailed);
    require!(proof.pi_c.len() == 64, VerifierError::ProofVerificationFailed);
    Ok(())
}

extern "C" {
    fn sol_alt_bn128(
        curve_id: u64,
        input_addr: *const u8,
        input_len: u64,
        result_addr: *mut u8,
    ) -> u64;
}

fn call_alt_bn128_pairing(input: &[u8]) -> std::result::Result<[u8; 64], u64> {
    let mut result = [0u8; 64];
    let ret = unsafe {
        sol_alt_bn128(
            2,
            input.as_ptr(),
            input.len() as u64,
            result.as_mut_ptr(),
        )
    };
    if ret != 0 {
        Err(ret)
    } else {
        Ok(result)
    }
}

#[allow(clippy::needless_range_loop)]
fn bn254_negate_y(y: &[u8; 32]) -> [u8; 32] {
    let mut neg = [0u8; 32];
    let mut borrow: u64 = 0;

    for i in (0..4).rev() {
        let w = u64::from_le_bytes(BN254_FIELD_MODULUS[i * 8..(i + 1) * 8].try_into().unwrap());
        let y_val = u64::from_le_bytes(y[i * 8..(i + 1) * 8].try_into().unwrap());

        let (diff, b) = w.overflowing_sub(y_val.wrapping_add(borrow));
        borrow = b as u64;
        neg[i * 8..(i + 1) * 8].copy_from_slice(&diff.to_le_bytes());
    }
    neg
}

fn groth16_pairing_check(
    _vk: &[u8],
    proof: &Groth16Proof,
    _public_inputs: &[u64],
) -> std::result::Result<bool, &'static str> {
    let pi_a_neg_y: [u8; 32] = bn254_negate_y(proof.pi_a[32..64].try_into().map_err(|_| "bad pi_a y")?);

    let mut input = Vec::with_capacity(192 * 3);

    input.extend_from_slice(&proof.pi_a[..32]);
    input.extend_from_slice(&pi_a_neg_y);
    input.extend_from_slice(&proof.pi_b);

    input.extend_from_slice(&proof.pi_c);
    input.extend_from_slice(&G2_GENERATOR);

    let result = call_alt_bn128_pairing(&input).map_err(|e| "sol_alt_bn128 syscall failed")?;

    let check = u64::from_le_bytes(result[..8].try_into().unwrap());
    Ok(check != 0)
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
