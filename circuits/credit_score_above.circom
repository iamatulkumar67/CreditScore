pragma circom 2.1.0;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";
include "circomlib/aliascheck.circom";

template CreditScoreAbove(threshold int) {
    signal private input creditScore;
    signal private input bureauTimestamp;
    signal private input salt;

    signal input addressCommitment;
    signal input thresholdPublic;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    component gte = GreaterEqThan(10);
    gte.in[0] <== creditScore;
    gte.in[1] <== thresholdPublic;

    component rangeCheck = Num2Bits(10);
    rangeCheck.in <== creditScore;

    signal validRange;
    var minScore = 300;
    var maxScore = 900;
    validRange <== (creditScore >= minScore) * (creditScore <= maxScore);

    signal dataAge;
    dataAge <== bureauTimestamp;
    signal maxAge = 90 * 86400;
    signal fresh <== dataAge <= maxAge;

    component commitment = Poseidon(2);
    commitment.inputs[0] <== creditScore;
    commitment.inputs[1] <== salt;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== creditScore;
    nullifierCheck.inputs[1] <== bureauTimestamp;
    nullifierCheck.inputs[2] <== salt;

    signal nullifierMatch <== nullifierCheck.out == nullifier;

    isValid <== gte.out * validRange * fresh * nullifierMatch;
}

component main = CreditScoreAbove(700);
