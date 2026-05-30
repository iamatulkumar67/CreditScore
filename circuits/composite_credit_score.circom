pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

// Standalone composite circuit that evaluates all 4 credit dimensions
// and outputs a tier (1-4) based on weighted scoring
template CompositeCreditScore() {
    // Credit score inputs
    signal input creditScore;
    signal input bureauTimestamp;

    // Income inputs
    signal input monthlyIncome;
    signal input incomeSource;
    signal input month1Income;
    signal input month2Income;
    signal input month3Income;

    // DTI inputs
    signal input totalMonthlyDebt;
    signal input totalMonthlyIncome;

    // Default history inputs
    signal input totalDefaults;
    signal input creditHistoryLength;

    // Common inputs
    signal input salt;

    // Public inputs (thresholds + identity)
    signal input scoreThreshold;
    signal input incomeThreshold;
    signal input dtiThreshold;
    signal input historyYearsThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output creditTier;

    // === Credit Score Check ===
    component scoreGte = GreaterEqThan(64);
    scoreGte.in[0] <== creditScore;
    scoreGte.in[1] <== scoreThreshold;

    component rangeLow = GreaterEqThan(64);
    rangeLow.in[0] <== creditScore;
    rangeLow.in[1] <== 300;

    component rangeHigh = LessEqThan(64);
    rangeHigh.in[0] <== creditScore;
    rangeHigh.in[1] <== 900;

    signal validRange;
    validRange <== rangeLow.out * rangeHigh.out;

    signal scorePass;
    scorePass <== scoreGte.out * validRange;

    // === Income Check ===
    component incomeGte = GreaterEqThan(64);
    incomeGte.in[0] <== monthlyIncome;
    incomeGte.in[1] <== incomeThreshold;

    signal sumIncome;
    sumIncome <== month1Income + month2Income + month3Income;

    component avgGte = GreaterEqThan(64);
    avgGte.in[0] <== sumIncome;
    avgGte.in[1] <== incomeThreshold * 3;

    signal incomePass;
    incomePass <== incomeGte.out * avgGte.out;

    // === DTI Check ===
    signal debtNum;
    debtNum <== totalMonthlyDebt * 100;

    signal thresholdIncome;
    thresholdIncome <== dtiThreshold * totalMonthlyIncome;

    component dtiBelow = LessEqThan(64);
    dtiBelow.in[0] <== debtNum;
    dtiBelow.in[1] <== thresholdIncome;

    signal dtiPass;
    dtiPass <== dtiBelow.out;

    // === No Defaults Check ===
    component iz = IsZero();
    iz.in <== totalDefaults;

    component historyCheck = GreaterEqThan(64);
    historyCheck.in[0] <== creditHistoryLength;
    historyCheck.in[1] <== historyYearsThreshold * 365 * 86400;

    signal defaultPass;
    defaultPass <== iz.out * historyCheck.out;

    // === Nullifier ===
    component nullifierHash = Poseidon(3);
    nullifierHash.inputs[0] <== creditScore;
    nullifierHash.inputs[1] <== monthlyIncome;
    nullifierHash.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierHash.out;
    nullifierEq.in[1] <== nullifier;

    // === Weighted Composite Score ===
    // Weights: score=40, income=30, dti=20, history=10 (total=100)
    signal compositeScore;
    signal w1;
    w1 <== scorePass * 40;
    signal w2;
    w2 <== incomePass * 30;
    signal w3;
    w3 <== dtiPass * 20;
    signal w4;
    w4 <== defaultPass * 10;
    compositeScore <== w1 + w2 + w3 + w4;

    // === Tier Calculation ===
    // Tier 4: score > 90 (all pass)
    // Tier 3: score > 70
    // Tier 2: score > 50
    // Tier 1: score > 30
    // Tier 0: below 30
    component gt90 = GreaterThan(64);
    gt90.in[0] <== compositeScore;
    gt90.in[1] <== 90;

    component gt70 = GreaterThan(64);
    gt70.in[0] <== compositeScore;
    gt70.in[1] <== 70;

    component gt50 = GreaterThan(64);
    gt50.in[0] <== compositeScore;
    gt50.in[1] <== 50;

    component gt30 = GreaterThan(64);
    gt30.in[0] <== compositeScore;
    gt30.in[1] <== 30;

    // Tier = sum of all thresholds passed (0-4)
    creditTier <== gt90.out + gt70.out + gt50.out + gt30.out;
}

component main {public [scoreThreshold, incomeThreshold, dtiThreshold, historyYearsThreshold, addressCommitment, nullifier, expiryTimestamp]} = CompositeCreditScore();
