export type ClaimType =
  | "CREDIT_SCORE_ABOVE"
  | "MONTHLY_INCOME_ABOVE"
  | "DTI_BELOW"
  | "NO_DEFAULT"
  | "EMPLOYMENT_STATUS"
  | "COMPOSITE_TIER";

export interface CreditTier {
  tier: number;
  name: string;
  description: string;
  collateralRatio: number;
  maxLoan: string;
  interestDiscount: number;
  requiredClaims: string[];
  color: string;
  gradient: string;
}

export interface LoanCalculation {
  loanAmount: number;
  collateralRequired: number;
  collateralSavings: number;
  interestRate: number;
  monthlyPayment: number;
  tier: number;
}

export interface ProtocolStats {
  totalTVL: string;
  totalCredentials: string;
  activeLoans: string;
  totalBorrowed: string;
  avgCreditTier: string;
  defaultRate: string;
  capitalEfficiency: string;
  protocolIntegrations: number;
}

export interface TokenAllocation {
  category: string;
  percentage: number;
  amount: string;
  vesting: string;
  color: string;
}

export type MilestoneStatus = "done" | "partial" | "pending";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  milestones: Milestone[];
}

export const CREDIT_TIERS: CreditTier[] = [
  {
    tier: 0,
    name: "None",
    description: "Standard DeFi lending — no credit credential",
    collateralRatio: 150,
    maxLoan: "$50,000",
    interestDiscount: 0,
    requiredClaims: [],
    color: "#6b7280",
    gradient: "from-gray-500 to-gray-600",
  },
  {
    tier: 1,
    name: "Basic",
    description: "Credit score above 650 verified via ZK proof",
    collateralRatio: 110,
    maxLoan: "$100,000",
    interestDiscount: 2,
    requiredClaims: ["CREDIT_SCORE_ABOVE"],
    color: "#f59e0b",
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    tier: 2,
    name: "Good",
    description: "Score > 700 with income proof verified",
    collateralRatio: 80,
    maxLoan: "$250,000",
    interestDiscount: 4,
    requiredClaims: ["CREDIT_SCORE_ABOVE", "MONTHLY_INCOME_ABOVE"],
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    tier: 3,
    name: "Excellent",
    description: "Score > 750 with low DTI ratio proven",
    collateralRatio: 60,
    maxLoan: "$500,000",
    interestDiscount: 6,
    requiredClaims: ["CREDIT_SCORE_ABOVE", "MONTHLY_INCOME_ABOVE", "DTI_BELOW"],
    color: "#14b8a6",
    gradient: "from-teal-400 to-cyan-500",
  },
  {
    tier: 4,
    name: "Premium",
    description: "All claims verified — maximum capital efficiency",
    collateralRatio: 50,
    maxLoan: "$1,000,000",
    interestDiscount: 8,
    requiredClaims: ["CREDIT_SCORE_ABOVE", "MONTHLY_INCOME_ABOVE", "DTI_BELOW", "NO_DEFAULT", "EMPLOYMENT_STATUS"],
    color: "#2dd4bf",
    gradient: "from-teal-300 to-emerald-400",
  },
];

export const TOKEN_ALLOCATIONS: TokenAllocation[] = [
  { category: "Protocol Treasury", percentage: 30, amount: "300M", vesting: "4 years, quarterly unlock", color: "#10b981" },
  { category: "Team & Advisors", percentage: 20, amount: "200M", vesting: "1yr cliff, 3yr linear", color: "#14b8a6" },
  { category: "Ecosystem / Grants", percentage: 20, amount: "200M", vesting: "5 years, milestone-based", color: "#2dd4bf" },
  { category: "Community Sale / IDO", percentage: 15, amount: "150M", vesting: "20% TGE, 12mo linear", color: "#f59e0b" },
  { category: "Liquidity Provision", percentage: 10, amount: "100M", vesting: "At TGE, locked in LP", color: "#f97316" },
  { category: "Security Council", percentage: 5, amount: "50M", vesting: "2 years, quarterly", color: "#ef4444" },
];

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Foundation",
    milestones: [
      { id: "M1", title: "ZK Circuit Design + Audit", description: "CreditScore + Income circuits", status: "partial" },
      { id: "M2", title: "Smart Contracts v0.1 Testnet", description: "Verifier + SBT deployed", status: "done" },
      { id: "M3", title: "Client App MVP", description: "iOS + Chrome with AA integration", status: "pending" },
      { id: "M4", title: "Lending Pool v0.1 Testnet", description: "USDC only, single collateral", status: "done" },
      { id: "M5", title: "Security Audit", description: "Trail of Bits + OpenZeppelin", status: "pending" },
      { id: "M6", title: "Trusted Setup Ceremony", description: "Public, verifiable ceremony", status: "pending" },
    ],
  },
  {
    phase: "Phase 2",
    title: "Mainnet Launch",
    milestones: [
      { id: "M7", title: "Mainnet Launch on Solana", description: "Permissionless mainnet", status: "pending" },
      { id: "M8", title: "ZKCR Token Launch + Governance", description: "Token + governance activation", status: "done" },
      { id: "M9", title: "Multi-Collateral Support", description: "SOL, USDC, wBTC, mSOL", status: "pending" },
      { id: "M10", title: "Composite Credit Score", description: "Full tier system launch", status: "partial" },
      { id: "M11", title: "Integration SDK v1.0", description: "First 3 protocol integrations", status: "done" },
      { id: "M12", title: "$50M TVL Target", description: "Liquidity mining program", status: "pending" },
    ],
  },
  {
    phase: "Phase 3",
    title: "Expansion",
    milestones: [
      { id: "M13", title: "Eclipse L2 Deployment", description: "Cross-chain credential portability", status: "pending" },
      { id: "M14", title: "Plaid Integration", description: "US/EU market entry", status: "pending" },
      { id: "M15", title: "B2B API Launch", description: "White-label for DeFi protocols", status: "pending" },
      { id: "M16", title: "Under-collateralized Flash Loans", description: "ZK Premium tier feature", status: "pending" },
      { id: "M17", title: "Mobile-First Markets", description: "India, Nigeria, Indonesia, Brazil", status: "pending" },
      { id: "M18", title: "$500M TVL Target", description: "100+ protocol integrations", status: "pending" },
    ],
  },
];
