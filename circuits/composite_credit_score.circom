pragma circom 2.1.0;

include "credit_score_above.circom";
include "income_above.circom";
include "dti_below.circom";
include "no_default.circom";
include "comparators.circom";

template CompositeCreditScore() {
    signal input scoreThreshold;
    signal input incomeThreshold;
    signal input dtiThreshold;
    signal input historyYearsThreshold;

    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output creditTier;

    component creditScoreCheck = CreditScoreAbove(650);
    component incomeCheck = IncomeAbove();
    component dtiCheck = DebtToIncomeBelow();
    component noDefaultsCheck = NoDefaultsHistory(3);

    creditScoreCheck.thresholdPublic <== scoreThreshold;
    creditScoreCheck.addressCommitment <== addressCommitment;
    creditScoreCheck.nullifier <== nullifier;
    creditScoreCheck.expiryTimestamp <== expiryTimestamp;

    incomeCheck.incomeThreshold <== incomeThreshold;
    incomeCheck.addressCommitment <== addressCommitment;
    incomeCheck.nullifier <== nullifier;
    incomeCheck.expiryTimestamp <== expiryTimestamp;

    dtiCheck.dtiThreshold <== dtiThreshold;
    dtiCheck.addressCommitment <== addressCommitment;
    dtiCheck.nullifier <== nullifier;
    dtiCheck.expiryTimestamp <== expiryTimestamp;

    noDefaultsCheck.yearsThreshold <== historyYearsThreshold;
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

    component gt30 = GreaterThan(64);
    gt30.in[0] <== compositeScore;
    gt30.in[1] <== 30;

    component gt50 = GreaterThan(64);
    gt50.in[0] <== compositeScore;
    gt50.in[1] <== 50;

    component gt70 = GreaterThan(64);
    gt70.in[0] <== compositeScore;
    gt70.in[1] <== 70;

    component gt90 = GreaterThan(64);
    gt90.in[0] <== compositeScore;
    gt90.in[1] <== 90;

    creditTier <== gt90.out * 4
                 + gt70.out * (1 - gt90.out) * 3
                 + gt50.out * (1 - gt70.out) * 2
                 + gt30.out * (1 - gt50.out) * 1;
}

component main = CompositeCreditScore();
