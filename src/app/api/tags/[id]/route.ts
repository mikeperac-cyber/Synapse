import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        entityTags: true,
      },
    });

    if (!tag) {
      return NextResponse.json({ success: false, error: "Tag not found" }, { status: 404 });
    }

    // Fetch details for each linked entity
    const taskIds = tag.entityTags.filter((e) => e.entityType === "TASK").map((e) => e.entityId);
    const projectIds = tag.entityTags.filter((e) => e.entityType === "PROJECT").map((e) => e.entityId);
    const studentIds = tag.entityTags.filter((e) => e.entityType === "STUDENT").map((e) => e.entityId);
    const lessonIds = tag.entityTags.filter((e) => e.entityType === "LESSON").map((e) => e.entityId);
    const financeIds = tag.entityTags.filter((e) => e.entityType === "FINANCE").map((e) => e.entityId);
    const noteIds = tag.entityTags.filter((e) => e.entityType === "NOTE").map((e) => e.entityId);

    const [tasks, projects, students, lessons, finances, notes] = await Promise.all([
      prisma.task.findMany({ where: { id: { in: taskIds } } }),
      prisma.project.findMany({ where: { id: { in: projectIds } } }),
      prisma.student.findMany({ where: { id: { in: studentIds } } }),
      prisma.lesson.findMany({ where: { id: { in: lessonIds } }, include: { student: true } }),
      prisma.financialRecord.findMany({ where: { id: { in: financeIds } } }),
      prisma.note.findMany({ where: { id: { in: noteIds } } }),
    ]);

    return NextResponse.json({
      success: true,
      tag,
      linkedEntities: {
        tasks,
        projects,
        students,
        lessons,
        finances,
        notes,
      },
    });
  } catch (error: unknown) {
    console.error("GET tag details error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tag details" }, { status: 500 });
  }
}
