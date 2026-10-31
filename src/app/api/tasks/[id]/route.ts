import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
        ...(body.estimatedMinutes !== undefined && { estimatedMinutes: Number(body.estimatedMinutes) }),
        ...(body.trackedMinutes !== undefined && { trackedMinutes: Number(body.trackedMinutes) }),
        ...(body.isStale !== undefined && { isStale: Boolean(body.isStale) }),
        ...(body.projectId !== undefined && { projectId: body.projectId || null }),
      },
      include: {
        project: true,
        student: true,
        timeLogs: true,
      },
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: unknown) {
    console.error("PATCH task error:", error);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Remove entity tags
    await prisma.entityTag.deleteMany({
      where: { entityType: "TASK", entityId: id },
    });

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE task error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}
