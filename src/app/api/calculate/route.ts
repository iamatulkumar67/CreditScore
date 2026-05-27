import { NextResponse } from "next/server";

const CREDIT_TIERS = [
  { tier: 0, name: "None", collateralRatio: 1.5, interestDiscount: 0 },
  { tier: 1, name: "Basic", collateralRatio: 1.1, interestDiscount: 0.02 },
  { tier: 2, name: "Good", collateralRatio: 0.8, interestDiscount: 0.04 },
  { tier: 3, name: "Excellent", collateralRatio: 0.6, interestDiscount: 0.06 },
  { tier: 4, name: "Premium", collateralRatio: 0.5, interestDiscount: 0.08 },
];

const BASE_RATE = 0.1; // 10% APR

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loanAmount, creditTier = 2, duration = 12 } = body;

    if (!loanAmount || loanAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid loan amount" },
        { status: 400 }
      );
    }

    if (creditTier < 0 || creditTier > 4) {
      return NextResponse.json(
        { success: false, error: "Invalid credit tier (0-4)" },
        { status: 400 }
      );
    }

    const tier = CREDIT_TIERS[creditTier];
    const standardCollateral = loanAmount * 1.5;
    const zkCollateral = loanAmount * tier.collateralRatio;
    const savings = standardCollateral - zkCollateral;
    const savingsPercent = (savings / standardCollateral) * 100;

    const interestRate = Math.max(BASE_RATE - tier.interestDiscount, 0.02);
    const monthlyRate = interestRate / 12;
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
      (Math.pow(1 + monthlyRate, duration) - 1);
    const totalPayment = monthlyPayment * duration;
    const totalInterest = totalPayment - loanAmount;

    return NextResponse.json({
      success: true,
      data: {
        loanAmount,
        creditTier: tier.tier,
        tierName: tier.name,
        collateralRatio: tier.collateralRatio,
        collateralRequired: Math.round(zkCollateral),
        standardCollateral: Math.round(standardCollateral),
        collateralSavings: Math.round(savings),
        savingsPercent: Math.round(savingsPercent * 10) / 10,
        interestRate: Math.round(interestRate * 10000) / 100,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        duration,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
