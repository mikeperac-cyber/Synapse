import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      tasks,
      projects,
      goals,
      students,
      lessons,
      homeworks,
      finances,
      voiceMemos,
      notes,
      instagramPosts,
      repoBundles,
      tags,
      agentLogs,
    ] = await Promise.all([
      prisma.task.findMany({
        include: {
          project: true,
          student: true,
          timeLogs: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        include: {
          tasks: true,
          timeLogs: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.goal.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.findMany({
        include: {
          lessons: true,
          homeworks: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.lesson.findMany({
        include: {
          student: true,
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.homework.findMany({
        include: {
          student: true,
          lesson: true,
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.financialRecord.findMany({
        include: {
          student: true,
          project: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.voiceMemo.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.note.findMany({
        orderBy: { updatedAt: "desc" },
      }),
      prisma.instagramPost.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.repoBundle.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.tag.findMany({
        include: {
          entityTags: true,
        },
      }),
      prisma.agentActionLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 15,
      }),
    ]);

    // Compute key financial metrics
    let totalIncome = 0;
    let totalExpense = 0;
    let totalDebt = 0;
    let monthlyBurn = 0;

    for (const f of finances) {
      if (f.type === "INCOME" && f.isPaid) totalIncome += f.amount;
      if (f.type === "EXPENSE") {
        totalExpense += f.amount;
        if (f.isRecurring) monthlyBurn += f.amount;
      }
      if (f.type === "DEBT" && !f.isPaid) totalDebt += f.amount;
    }

    const netCash = totalIncome - totalExpense;
    // Default estimated runway in months (if burn > 0)
    const runwayMonths = monthlyBurn > 0 ? Math.max(0, (netCash / monthlyBurn)).toFixed(1) : "12+";

    // Weekly tracked hours
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.timeLog.findMany({
      where: { startTime: { gte: sevenDaysAgo } },
    });
    const weeklyTrackedMinutes = recentLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
    const weeklyTrackedHours = parseFloat((weeklyTrackedMinutes / 60).toFixed(1));

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        projects,
        goals,
        students,
        lessons,
        homeworks,
        finances,
        voiceMemos,
        notes,
        instagramPosts,
        repoBundles,
        tags,
        agentLogs,
        metrics: {
          netCash,
          totalIncome,
          totalExpense,
          totalDebt,
          monthlyBurn,
          runwayMonths,
          weeklyTrackedHours,
          weeklyCapacityLimit: 40.0,
          pendingTasksCount: tasks.filter((t) => t.status !== "DONE").length,
          activeStudentsCount: students.filter((s) => s.status === "ACTIVE").length,
          urgentTasksCount: tasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE").length,
          nextLesson: lessons.find((l) => l.status === "SCHEDULED" && new Date(l.scheduledAt) > new Date()) || null,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch overview operational metrics" },
      { status: 500 }
    );
  }
}
