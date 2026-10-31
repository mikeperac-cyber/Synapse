import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutonomousCycle } from "@/lib/autonomousManager";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await prisma.agentActionLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 25,
    });

    // Compute live capacity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.timeLog.findMany({
      where: { startTime: { gte: sevenDaysAgo } },
    });
    const weeklyTrackedMinutes = recentLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
    const weeklyTrackedHours = parseFloat((weeklyTrackedMinutes / 60).toFixed(1));

    return NextResponse.json({
      success: true,
      logs,
      capacity: {
        weeklyTrackedHours,
        weeklyTargetHours: 40.0,
        utilizationPercent: Math.round((weeklyTrackedHours / 40.0) * 100),
      },
    });
  } catch (error: unknown) {
    console.error("GET autonomous error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch autonomous logs" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await runAutonomousCycle();
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: unknown) {
    console.error("POST autonomous error:", error);
    return NextResponse.json({ success: false, error: "Failed to run autonomous cycle" }, { status: 500 });
  }
}
