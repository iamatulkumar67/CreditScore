pragma circom 2.1.0;

include "credit_score_above.circom";
include "income_above.circom";
include "dti_below.circom";
include "no_default.circom";

template CompositeCreditScore() {
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output creditTier;

    component creditScoreCheck = CreditScoreAbove(650);
    component incomeCheck = IncomeAbove();
    component dtiCheck = DebtToIncomeBelow();
    component noDefaultsCheck = NoDefaultsHistory(3);

    creditScoreCheck.addressCommitment <== addressCommitment;
    creditScoreCheck.nullifier <== nullifier;
    creditScoreCheck.expiryTimestamp <== expiryTimestamp;

    incomeCheck.addressCommitment <== addressCommitment;
    incomeCheck.nullifier <== nullifier;
    incomeCheck.expiryTimestamp <== expiryTimestamp;

    dtiCheck.addressCommitment <== addressCommitment;
    dtiCheck.nullifier <== nullifier;
    dtiCheck.expiryTimestamp <== expiryTimestamp;

    noDefaultsCheck.addressCommitment <== addressCommitment;
    noDefaultsCheck.nullifier <== nullifier;
    noDefaultsCheck.expiryTimestamp <== expiryTimestamp;

    var weightScore = 40;
    var weightIncome = 30;
    var weightDti = 20;
    var weightHistory = 10;

    signal compositeScore;
    compositeScore <== (creditScoreCheck.isValid * weightScore)
                     + (incomeCheck.isValid * weightIncome)
                     + (dtiCheck.isValid * weightDti)
                     + (noDefaultsCheck.isValid * weightHistory);

    component tier0 = LessEqThan(8);
    tier0.in[0] <== compositeScore;
    tier0.in[1] <== 30;

    component tier1 = LessEqThan(8);
    tier1.in[0] <== compositeScore;
    tier1.in[1] <== 50;

    component tier2 = LessEqThan(8);
    tier2.in[0] <== compositeScore;
    tier2.in[1] <== 70;

    component tier3 = LessEqThan(8);
    tier3.in[0] <== compositeScore;
    tier3.in[1] <== 90;

    signal tierSelect;
    tierSelect <== (compositeScore > 90) * 4
                + (compositeScore > 70 && compositeScore <= 90) * 3
                + (compositeScore > 50 && compositeScore <= 70) * 2
                + (compositeScore > 30 && compositeScore <= 50) * 1
                + (compositeScore <= 30) * 0;

    creditTier <== tierSelect;
}

component main = CompositeCreditScore();
