"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileCode2, ShieldCheck, Coins, Percent } from "lucide-react";

const CONTRACTS = [
  {
    name: "ZKCreditVerifier.sol",
    description: "Core ZK proof verification and SBT credential issuance",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    code: `interface IZKCreditVerifier {
    struct Proof {
        uint[2] a;
        uint[2][2] b;
        uint[2] c;
    }
    
    struct CreditClaim {
        ClaimType claimType;
        uint256 threshold;
        uint256 expiry;
        bytes32 nullifier;
        address userAddress;
    }
    
    enum ClaimType {
        CREDIT_SCORE_ABOVE,
        MONTHLY_INCOME_ABOVE,
        DTI_BELOW,
        NO_DEFAULT,
        EMPLOYMENT_STATUS,
        COMPOSITE_TIER
    }
    
    function verifyAndIssueCredential(
        Proof calldata proof,
        CreditClaim calldata claim
    ) external returns (uint256 sbtTokenId);
    
    function hasValidCredential(
        address user,
        ClaimType claimType,
        uint256 requiredThreshold
    ) external view returns (bool);
    
    function getCreditTier(address user) 
        external view returns (uint8 tier, uint256 expiry);
    
    function revokeCredential(uint256 tokenId) external;
}`,
  },
  {
    name: "ZKLendingPool.sol",
    description: "Core lending/borrowing with ZK-gated collateral ratios",
    icon: Coins,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    code: `interface IZKLendingPool {
    struct LoanTerms {
        address borrower;
        address collateralAsset;
        uint256 collateralAmount;
        address borrowAsset;
        uint256 borrowAmount;
        uint256 interestRate;
        uint256 collateralRatio;
        uint8 creditTier;
        uint256 startTimestamp;
        uint256 maturityTimestamp;
    }
    
    function getCollateralRatio(
        address user, address borrowAsset
    ) external view returns (uint256 ratio, uint256 maxBorrow);
    
    function depositAndBorrow(
        address collateralAsset,
        uint256 collateralAmount,
        address borrowAsset,
        uint256 borrowAmount
    ) external returns (uint256 loanId);
    
    function repay(uint256 loanId, uint256 amount) external;
    
    function liquidate(
        address borrower,
        address collateralAsset,
        address debtAsset,
        uint256 debtToCover
    ) external returns (uint256 collateralReceived);
    
    function getBorrowRate(address asset) 
        external view returns (uint256 aprBasisPoints);
}`,
  },
  {
    name: "ZKCreditSBT.sol",
    description: "Non-transferable Soulbound Token for ZK credentials",
    icon: FileCode2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    code: `interface IZKCreditSBT {
    struct TokenMetadata {
        ClaimType[] claims;
        uint8 creditTier;
        uint256 issuedAt;
        uint256 expiresAt;
        address issuer;
        bytes32 credentialHash;
        // NOTE: No actual scores, income values,
        // or personal data stored on-chain
    }
    
    // Soulbound — transfer always reverts
    function transferFrom(
        address, address, uint256
    ) external pure;
    // → revert("Soulbound: non-transferable");
    
    function getCredentialInfo(
        uint256 tokenId
    ) external view returns (TokenMetadata memory);
    
    function getUserTokenId(
        address user
    ) external view returns (uint256);
    
    function isExpired(
        uint256 tokenId
    ) external view returns (bool);
}`,
  },
  {
    name: "InterestRateModel.sol",
    description: "Kink model with credit tier discount modifiers",
    icon: Percent,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    code: `// Kink Interest Rate Model with Tier Modifiers
// Base Rate: 2% APR
// Optimal Utilization: 80%
// Slope 1 (below optimal): 8% APR
// Slope 2 (above optimal): 75% APR

function getBorrowRate(
    uint256 utilizationRate,
    uint8 borrowerCreditTier
) external pure returns (uint256 annualRate) {
    uint256 baseRate = calculateKinkRate(
        utilizationRate
    );
    uint256 tierDiscount = tierDiscounts[
        borrowerCreditTier
    ];
    // Tier 0: +0% | Tier 1: -2% 
    // Tier 2: -4% | Tier 3: -6%
    // Tier 4: -8%
    return baseRate > tierDiscount 
        ? baseRate - tierDiscount 
        : MIN_RATE;
}`,
  },
];

export default function SmartContracts() {
  return (
    <section className="relative py-24 overflow-hidden" id="contracts">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <FileCode2 className="h-4 w-4" />
            Smart Contracts
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            On-Chain{" "}
            <span className="gradient-text">Infrastructure</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Four core contracts powering the ZKCreditScore protocol —
            all audited, upgradeable, and battle-tested.
          </p>
        </div>

        {/* Contract Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {CONTRACTS.map((contract) => (
            <Card
              key={contract.name}
              className="glass-card border-emerald-500/10 bg-transparent hover:border-emerald-500/30 transition-all"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg ${contract.bg} flex items-center justify-center`}
                  >
                    <contract.icon className={`h-5 w-5 ${contract.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {contract.name}
                    </h3>
                    <p className="text-xs text-emerald-100/40">
                      {contract.description}
                    </p>
                  </div>
                </div>

                {/* Code */}
                <div className="bg-[#050a08] rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">
                  <pre className="text-xs leading-relaxed font-mono">
                    <code className="text-emerald-100/60">
                      {contract.code}
                    </code>
                  </pre>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-400/60 text-[10px]"
                  >
                    Solidity 0.8.x
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-400/60 text-[10px]"
                  >
                    UUPS Proxy
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-400/60 text-[10px]"
                  >
                    Audited
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
