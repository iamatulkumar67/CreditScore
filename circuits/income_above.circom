pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

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

    component gte = GreaterEqThan(64);
    gte.in[0] <== monthlyIncome;
    gte.in[1] <== incomeThreshold;

    signal sumIncome;
    sumIncome <== month1Income + month2Income + month3Income;

    component avgGte = GreaterEqThan(64);
    avgGte.in[0] <== sumIncome;
    avgGte.in[1] <== incomeThreshold * 3;

    component sourceLow = GreaterEqThan(64);
    sourceLow.in[0] <== incomeSource;
    sourceLow.in[1] <== 0;

    component sourceHigh = LessEqThan(64);
    sourceHigh.in[0] <== incomeSource;
    sourceHigh.in[1] <== 2;

    signal sourceValid;
    sourceValid <== sourceLow.out * sourceHigh.out;

    component stable1 = GreaterEqThan(64);
    stable1.in[0] <== month1Income;
    stable1.in[1] <== month2Income;

    component stable2 = GreaterEqThan(64);
    stable2.in[0] <== month2Income;
    stable2.in[1] <== month3Income;

    signal incomeStable;
    incomeStable <== stable1.out * stable2.out;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== monthlyIncome;
    nullifierCheck.inputs[1] <== incomeSource;
    nullifierCheck.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierCheck.out;
    nullifierEq.in[1] <== nullifier;

    isValid <== gte.out * avgGte.out * sourceValid * incomeStable * nullifierEq.out;
}

component main = IncomeAbove();
