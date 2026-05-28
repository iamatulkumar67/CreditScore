pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

template CreditScoreAbove(threshold int) {
    signal private input creditScore;
    signal private input bureauTimestamp;
    signal private input salt;

    signal input addressCommitment;
    signal input thresholdPublic;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    component gte = GreaterEqThan(64);
    gte.in[0] <== creditScore;
    gte.in[1] <== thresholdPublic;

    component rangeLow = GreaterEqThan(64);
    rangeLow.in[0] <== creditScore;
    rangeLow.in[1] <== 300;

    component rangeHigh = LessEqThan(64);
    rangeHigh.in[0] <== creditScore;
    rangeHigh.in[1] <== 900;

    signal validRange;
    validRange <== rangeLow.out * rangeHigh.out;

    signal fresh;
    component ageCheck = LessEqThan(64);
    ageCheck.in[0] <== expiryTimestamp - bureauTimestamp;
    ageCheck.in[1] <== 90 * 86400;
    fresh <== ageCheck.out;

    component commitment = Poseidon(2);
    commitment.inputs[0] <== creditScore;
    commitment.inputs[1] <== salt;

    component commitmentMatch = IsEqual();
    commitmentMatch.in[0] <== commitment.out;
    commitmentMatch.in[1] <== addressCommitment;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== creditScore;
    nullifierCheck.inputs[1] <== bureauTimestamp;
    nullifierCheck.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierCheck.out;
    nullifierEq.in[1] <== nullifier;

    isValid <== gte.out * validRange * fresh * commitmentMatch.out * nullifierEq.out;
}

component main = CreditScoreAbove(700);
