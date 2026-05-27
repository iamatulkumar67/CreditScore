pragma circom 2.1.0;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template IncomeAbove() {
    signal private input monthlyIncome;
    signal private input incomeSource;
    signal private input month1Income;
    signal private input month2Income;
    signal private input month3Income;
    signal private input salt;

    signal input incomeThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    component gte = GreaterEqThan(32);
    gte.in[0] <== monthlyIncome;
    gte.in[1] <== incomeThreshold;

    signal avgIncome;
    var DIVISOR = 3;
    component div = SafeDiv(48);
    div.numerator <== month1Income + month2Income + month3Income;
    div.denominator <== DIVISOR;
    avgIncome <== div.quotient;

    component avgGte = GreaterEqThan(32);
    avgGte.in[0] <== avgIncome;
    avgGte.in[1] <== incomeThreshold;

    signal sourceValid <== incomeSource >= 0 && incomeSource <= 2;

    component stabilityCheck = GreaterEqThan(32);
    stabilityCheck.in[0] <== month1Income;
    stabilityCheck.in[1] <== month2Income;
    stabilityCheck.in[0] <== month2Income;
    stabilityCheck.in[1] <== month3Income;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== monthlyIncome;
    nullifierCheck.inputs[1] <== incomeSource;
    nullifierCheck.inputs[2] <== salt;

    signal nullifierMatch <== nullifierCheck.out == nullifier;

    isValid <== gte.out * avgGte.out * sourceValid * nullifierMatch;
}

component main = IncomeAbove();
