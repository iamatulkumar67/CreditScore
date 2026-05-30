pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

template DebtToIncomeBelow() {
    signal input totalMonthlyDebt;
    signal input totalMonthlyIncome;
    signal input salt;

    signal input dtiThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    // DTI check: (debt * 100) <= (threshold * income)
    signal debtNum;
    debtNum <== totalMonthlyDebt * 100;

    signal thresholdIncome;
    thresholdIncome <== dtiThreshold * totalMonthlyIncome;

    component below = LessEqThan(64);
    below.in[0] <== debtNum;
    below.in[1] <== thresholdIncome;

    // Sanity: debt <= income
    component maxCheck = LessEqThan(64);
    maxCheck.in[0] <== totalMonthlyDebt;
    maxCheck.in[1] <== totalMonthlyIncome;

    // Nullifier verification
    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== totalMonthlyDebt;
    nullifierCheck.inputs[1] <== totalMonthlyIncome;
    nullifierCheck.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierCheck.out;
    nullifierEq.in[1] <== nullifier;

    // Combine checks
    signal step1;
    step1 <== below.out * maxCheck.out;

    isValid <== step1 * nullifierEq.out;
}

component main {public [dtiThreshold, addressCommitment, nullifier, expiryTimestamp]} = DebtToIncomeBelow();
