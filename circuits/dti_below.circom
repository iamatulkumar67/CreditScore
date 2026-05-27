pragma circom 2.1.0;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template DebtToIncomeBelow() {
    signal private input totalMonthlyDebt;
    signal private input totalMonthlyIncome;
    signal private input salt;

    signal input dtiThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    signal dtiRatio;
    component div = SafeDiv(48);
    div.numerator <== totalMonthlyDebt * 100;
    div.denominator <== totalMonthlyIncome;
    dtiRatio <== div.quotient;

    component below = LessEqThan(16);
    below.in[0] <== dtiRatio;
    below.in[1] <== dtiThreshold;

    signal dtiValid <== dtiRatio >= 0 && dtiRatio <= 100;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== totalMonthlyDebt;
    nullifierCheck.inputs[1] <== totalMonthlyIncome;
    nullifierCheck.inputs[2] <== salt;

    signal nullifierMatch <== nullifierCheck.out == nullifier;

    isValid <== below.out * dtiValid * nullifierMatch;
}

component main = DebtToIncomeBelow();
