import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, goals });
  } catch (error: unknown) {
    console.error("GET goals error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      targetCategory = "DEVELOPMENT",
      targetHoursPerWeek = 10,
      targetDate,
      smartSpecific,
      smartMeasurable,
      smartAchievable,
      smartRelevant,
      smartTimeBound,
    } = body;

    const hours = Number(targetHoursPerWeek) || 10;
    let realismStatus: "REALISTIC" | "OVERCAPACITY" | "UNDERUTILIZED" = "REALISTIC";
    let rationale = `Audited against 40h standard weekly ceiling. Target load of ${hours}h/week is sustainable.`;

    if (hours > 25) {
      realismStatus = "OVERCAPACITY";
      rationale = `⚠️ S.M.A.R.T. Audit Alert: Target of ${hours}h/week for a single goal risks severe burnout when combined with baseline operations. Flagged as Overcapacity.`;
    } else if (hours < 3) {
      realismStatus = "UNDERUTILIZED";
      rationale = `Target of ${hours}h/week provides minimal momentum. Consider consolidating with an existing milestone.`;
    }

    const goal = await prisma.goal.create({
      data: {
        title: title.trim(),
        targetCategory,
        targetHoursPerWeek: hours,
        targetDate: targetDate ? new Date(targetDate) : null,
        smartSpecific: smartSpecific?.trim() || null,
        smartMeasurable: smartMeasurable?.trim() || null,
        smartAchievable: smartAchievable?.trim() || null,
        smartRelevant: smartRelevant?.trim() || null,
        smartTimeBound: smartTimeBound?.trim() || null,
        realismStatus,
        rationale,
      },
    });

    return NextResponse.json({ success: true, goal }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST goal error:", error);
    return NextResponse.json({ success: false, error: "Failed to create goal" }, { status: 500 });
  }
}
