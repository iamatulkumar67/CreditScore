pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

template NoDefaultsHistory(years int) {
    signal private input totalDefaults;
    signal private input creditHistoryLength;
    signal private input salt;

    signal input yearsThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    component iz = IsZero();
    iz.in <== totalDefaults;

    signal sufficientHistory;
    component historyCheck = GreaterEqThan(64);
    historyCheck.in[0] <== creditHistoryLength;
    historyCheck.in[1] <== years * 365 * 86400;
    sufficientHistory <== historyCheck.out;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== totalDefaults;
    nullifierCheck.inputs[1] <== creditHistoryLength;
    nullifierCheck.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierCheck.out;
    nullifierEq.in[1] <== nullifier;

    isValid <== iz.out * sufficientHistory * nullifierEq.out;
}

component main = NoDefaultsHistory(3);
