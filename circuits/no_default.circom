pragma circom 2.1.0;

include "poseidon.circom";
include "comparators.circom";

template NoDefaultsHistory(years) {
    signal input totalDefaults;
    signal input creditHistoryLength;
    signal input salt;

    signal input yearsThreshold;
    signal input addressCommitment;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    // Check: totalDefaults == 0
    component iz = IsZero();
    iz.in <== totalDefaults;

    // Check: creditHistoryLength >= years * 365 * 86400
    component historyCheck = GreaterEqThan(64);
    historyCheck.in[0] <== creditHistoryLength;
    historyCheck.in[1] <== years * 365 * 86400;

    // Nullifier verification
    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== totalDefaults;
    nullifierCheck.inputs[1] <== creditHistoryLength;
    nullifierCheck.inputs[2] <== salt;

    component nullifierEq = IsEqual();
    nullifierEq.in[0] <== nullifierCheck.out;
    nullifierEq.in[1] <== nullifier;

    // Combine checks
    signal step1;
    step1 <== iz.out * historyCheck.out;

    isValid <== step1 * nullifierEq.out;
}

component main {public [yearsThreshold, addressCommitment, nullifier, expiryTimestamp]} = NoDefaultsHistory(3);
