pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

template DebtToIncomeBelow() {
    signal private input totalMonthlyDebt;
    signal private input totalMonthlyIncome;
    signal private input salt;

    signal input dtiThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    signal debtNum;
    debtNum <== totalMonthlyDebt * 100;

    component below = LessEqThan(64);
    below.in[0] <== debtNum;
    below.in[1] <== dtiThreshold * totalMonthlyIncome;

    signal maxDti;
    component maxCheck = LessEqThan(64);
    maxCheck.in[0] <== totalMonthlyDebt;
    maxCheck.in[1] <== totalMonthlyIncome;
    maxDti <== maxCheck.out;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== totalMonthlyDebt;
    nullifierCheck.inputs[1] <== totalMonthlyIncome;
    nullifierCheck.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierCheck.out;
    nullifierEq.in[1] <== nullifier;

    isValid <== below.out * maxDti * nullifierEq.out;
}

component main = DebtToIncomeBelow();
