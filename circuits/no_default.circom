pragma circom 2.1.0;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template NoDefaultsHistory(years int) {
    signal private input totalDefaults;
    signal private input creditHistoryLength;
    signal private input salt;

    signal input yearsThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    signal noDefaults <== totalDefaults == 0;

    signal sufficientHistory;
    var SECONDS_PER_YEAR = 365 * 86400;
    sufficientHistory <== creditHistoryLength >= years * SECONDS_PER_YEAR;

    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== totalDefaults;
    nullifierCheck.inputs[1] <== creditHistoryLength;
    nullifierCheck.inputs[2] <== salt;

    signal nullifierMatch <== nullifierCheck.out == nullifier;

    isValid <== noDefaults * sufficientHistory * nullifierMatch;
}

component main = NoDefaultsHistory(3);
