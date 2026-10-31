import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
        student: true,
        timeLogs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: unknown) {
    console.error("GET tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      priority = "MEDIUM",
      status = "TODO",
      dueDate,
      estimatedMinutes = 30,
      projectId,
      studentId,
      tagNames = [],
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ success: false, error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        projectId: projectId || null,
        studentId: studentId || null,
      },
      include: {
        project: true,
        student: true,
      },
    });

    // Handle polymorphic tags
    if (Array.isArray(tagNames) && tagNames.length > 0) {
      for (const tagName of tagNames) {
        const cleanName = tagName.replace(/^#/, "").trim().toLowerCase();
        if (!cleanName) continue;

        let tag = await prisma.tag.findUnique({ where: { name: cleanName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: cleanName } });
        }

        await prisma.entityTag.create({
          data: {
            tagId: tag.id,
            entityType: "TASK",
            entityId: task.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST task error:", error);
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
  }
}
