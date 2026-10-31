import { prisma } from "./prisma";

export interface AutonomousRunResult {
  timestamp: string;
  reconciledLessonsCount: number;
  staleTasksCount: number;
  homeworkNagsCount: number;
  capacityStatus: {
    weeklyTrackedHours: number;
    weeklyTargetHours: number;
    utilizationPercent: number;
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "BURNOUT_WARNING";
  };
  actionsTaken: Array<{
    type: string;
    description: string;
    status: "SUCCESS" | "WARNING" | "INFO";
  }>;
}

export async function runAutonomousCycle(): Promise<AutonomousRunResult> {
  const actionsTaken: Array<{
    type: string;
    description: string;
    status: "SUCCESS" | "WARNING" | "INFO";
  }> = [];

  const now = new Date();

  // 1. END-OF-DAY LEDGER RECONCILER
  // Scan completed lessons that haven't been reconciled to income
  const completedLessons = await prisma.lesson.findMany({
    where: {
      status: "COMPLETED",
    },
    include: {
      student: true,
    },
  });

  let reconciledCount = 0;
  for (const lesson of completedLessons) {
    // Check if an income record already exists for this lesson
    const existingIncome = await prisma.financialRecord.findFirst({
      where: {
        studentId: lesson.studentId,
        description: {
          contains: lesson.title,
        },
      },
    });

    if (!existingIncome) {
      await prisma.financialRecord.create({
        data: {
          type: "INCOME",
          category: "STUDENT_LESSON",
          description: `Autonomous Reconciled Fee: ${lesson.title} (${lesson.student.name})`,
          amount: lesson.feeAmount,
          dueDate: lesson.scheduledAt,
          isPaid: lesson.isPaid,
          studentId: lesson.studentId,
        },
      });
      reconciledCount++;
    }
  }

  if (reconciledCount > 0) {
    const desc = `Reconciled ${reconciledCount} completed lesson(s) into financial income ledger entries.`;
    actionsTaken.push({
      type: "RECONCILE_LEDGER",
      description: desc,
      status: "SUCCESS",
    });
    await prisma.agentActionLog.create({
      data: {
        actionType: "RECONCILE_LEDGER",
        description: desc,
        status: "SUCCESS",
        metadataJson: JSON.stringify({ count: reconciledCount }),
      },
    });
  } else {
    actionsTaken.push({
      type: "RECONCILE_LEDGER",
      description: "Ledger is synchronized. No unreconciled completed lessons detected.",
      status: "INFO",
    });
  }

  // 2. TASK PRIORITIZATION & SNOOZE AUDITOR
  // Detect tasks in progress with no update in 3 days or created > 3 days ago in IN_PROGRESS
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const staleCandidates = await prisma.task.findMany({
    where: {
      status: "IN_PROGRESS",
      updatedAt: {
        lt: threeDaysAgo,
      },
      isStale: false,
    },
  });

  let staleCount = 0;
  for (const task of staleCandidates) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "CLARIFY_OR_DISCARD",
        isStale: true,
      },
    });
    staleCount++;
  }

  if (staleCount > 0) {
    const desc = `Audited ${staleCount} stale tasks (>3 days in progress). Moved to 'Clarify or Discard' inbox.`;
    actionsTaken.push({
      type: "STALE_TASK_AUDIT",
      description: desc,
      status: "WARNING",
    });
    await prisma.agentActionLog.create({
      data: {
        actionType: "STALE_TASK_AUDIT",
        description: desc,
        status: "WARNING",
        metadataJson: JSON.stringify({
          staleTaskIds: staleCandidates.map((t) => t.id),
        }),
      },
    });
  } else {
    actionsTaken.push({
      type: "STALE_TASK_AUDIT",
      description: "Task pipeline healthy. No stale in-progress tasks found.",
      status: "INFO",
    });
  }

  // 3. HOMEWORK NAG ENGINE
  // Flag pending student submissions within 24h of upcoming lessons or past due
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const pendingHomeworks = await prisma.homework.findMany({
    where: {
      status: "ASSIGNED",
      dueDate: {
        lte: in24Hours,
      },
      reminderQueued: false,
    },
    include: {
      student: true,
    },
  });

  let nagsCount = 0;
  for (const hw of pendingHomeworks) {
    await prisma.homework.update({
      where: { id: hw.id },
      data: {
        reminderQueued: true,
      },
    });
    nagsCount++;
  }

  if (nagsCount > 0) {
    const desc = `Queued ${nagsCount} homework reminders for assignments due within 24 hours (${pendingHomeworks
      .map((h) => `${h.student.name}: ${h.title}`)
      .join(", ")}).`;
    actionsTaken.push({
      type: "HOMEWORK_NAG",
      description: desc,
      status: "WARNING",
    });
    await prisma.agentActionLog.create({
      data: {
        actionType: "HOMEWORK_NAG",
        description: desc,
        status: "WARNING",
        metadataJson: JSON.stringify({
          homeworkIds: pendingHomeworks.map((h) => h.id),
        }),
      },
    });
  } else {
    actionsTaken.push({
      type: "HOMEWORK_NAG",
      description: "All upcoming homework assignments are either submitted or outside the 24h alert window.",
      status: "INFO",
    });
  }

  // 4. CAPACITY GUARDIAN
  // Check total tracked time in the past 7 days against weekly target ceiling (40 hrs standard)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentTimeLogs = await prisma.timeLog.findMany({
    where: {
      startTime: {
        gte: sevenDaysAgo,
      },
    },
  });

  const totalMinutes = recentTimeLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const weeklyTrackedHours = parseFloat((totalMinutes / 60).toFixed(1));
  const weeklyTargetHours = 40.0;
  const utilizationPercent = Math.round((weeklyTrackedHours / weeklyTargetHours) * 100);

  let riskLevel: "LOW" | "MODERATE" | "HIGH" | "BURNOUT_WARNING" = "LOW";
  let capacityStatus: "SUCCESS" | "WARNING" | "INFO" = "INFO";
  let capDesc = `Capacity Guardian: ${weeklyTrackedHours}h tracked this week (${utilizationPercent}% of ${weeklyTargetHours}h ceiling). Load is optimal.`;

  if (utilizationPercent > 105) {
    riskLevel = "BURNOUT_WARNING";
    capacityStatus = "WARNING";
    capDesc = `⚠️ Burn-out Risk: ${weeklyTrackedHours}h tracked this week (${utilizationPercent}% of ${weeklyTargetHours}h target). Guardian recommends rescheduling low-priority tasks.`;
  } else if (utilizationPercent >= 85) {
    riskLevel = "HIGH";
    capacityStatus = "WARNING";
    capDesc = `Capacity Alert: Approaching weekly limit with ${weeklyTrackedHours}h logged (${utilizationPercent}%).`;
  } else if (utilizationPercent >= 50) {
    riskLevel = "MODERATE";
    capDesc = `Active velocity: ${weeklyTrackedHours}h logged (${utilizationPercent}%). Pace is balanced.`;
  }

  actionsTaken.push({
    type: "CAPACITY_GUARDIAN",
    description: capDesc,
    status: capacityStatus,
  });

  await prisma.agentActionLog.create({
    data: {
      actionType: "CAPACITY_GUARDIAN",
      description: capDesc,
      status: capacityStatus,
      metadataJson: JSON.stringify({
        weeklyTrackedHours,
        weeklyTargetHours,
        utilizationPercent,
        riskLevel,
      }),
    },
  });

  return {
    timestamp: now.toISOString(),
    reconciledLessonsCount: reconciledCount,
    staleTasksCount: staleCount,
    homeworkNagsCount: nagsCount,
    capacityStatus: {
      weeklyTrackedHours,
      weeklyTargetHours,
      utilizationPercent,
      riskLevel,
    },
    actionsTaken,
  };
}
