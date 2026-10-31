import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { durationMinutes = 0, note = "Pomodoro / Focus session" } = body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true, student: true },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const duration = Math.max(1, Math.round(Number(durationMinutes)));
    // Determine billing rate from project (default $85/h) or student ($65/h)
    const rate = task.project?.hourlyRate ?? task.student?.ratePerHour ?? 85.0;
    const billable = parseFloat(((duration / 60) * rate).toFixed(2));

    const timeLog = await prisma.timeLog.create({
      data: {
        taskId: task.id,
        projectId: task.projectId,
        durationMinutes: duration,
        billableAmount: billable,
        note,
        endTime: new Date(),
        startTime: new Date(Date.now() - duration * 60 * 1000),
      },
    });

    // Roll up tracked minutes to task
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        trackedMinutes: {
          increment: duration,
        },
      },
      include: {
        project: true,
        student: true,
        timeLogs: true,
      },
    });

    return NextResponse.json({ success: true, timeLog, task: updatedTask });
  } catch (error: unknown) {
    console.error("POST timelog error:", error);
    return NextResponse.json({ success: false, error: "Failed to log time" }, { status: 500 });
  }
}
