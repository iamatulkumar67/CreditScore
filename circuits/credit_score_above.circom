pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

template CreditScoreAbove(threshold) {
    signal input creditScore;
    signal input bureauTimestamp;
    signal input salt;

    signal input addressCommitment;
    signal input thresholdPublic;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    // Check: creditScore >= thresholdPublic
    component gte = GreaterEqThan(64);
    gte.in[0] <== creditScore;
    gte.in[1] <== thresholdPublic;

    // Range check: 300 <= creditScore <= 900
    component rangeLow = GreaterEqThan(64);
    rangeLow.in[0] <== creditScore;
    rangeLow.in[1] <== 300;

    component rangeHigh = LessEqThan(64);
    rangeHigh.in[0] <== creditScore;
    rangeHigh.in[1] <== 900;

    signal validRange;
    validRange <== rangeLow.out * rangeHigh.out;

    // Freshness: data not older than 90 days
    signal fresh;
    component ageCheck = LessEqThan(64);
    ageCheck.in[0] <== expiryTimestamp - bureauTimestamp;
    ageCheck.in[1] <== 90 * 86400;
    fresh <== ageCheck.out;

    // Commitment verification
    component commitment = Poseidon(2);
    commitment.inputs[0] <== creditScore;
    commitment.inputs[1] <== salt;

    component commitmentMatch = IsEqual();
    commitmentMatch.in[0] <== commitment.out;
    commitmentMatch.in[1] <== addressCommitment;

    // Nullifier verification
    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== creditScore;
    nullifierCheck.inputs[1] <== bureauTimestamp;
    nullifierCheck.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierCheck.out;
    nullifierEq.in[1] <== nullifier;

    // Combine all checks using intermediate signals (quadratic constraint fix)
    signal step1;
    step1 <== gte.out * validRange;

    signal step2;
    step2 <== step1 * fresh;

    signal step3;
    step3 <== step2 * commitmentMatch.out;

    isValid <== step3 * nullifierEq.out;
}

component main {public [addressCommitment, thresholdPublic, nullifier, expiryTimestamp]} = CreditScoreAbove(700);
