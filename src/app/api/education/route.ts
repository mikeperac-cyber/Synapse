import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [students, lessons, homeworks] = await Promise.all([
      prisma.student.findMany({
        include: {
          lessons: {
            orderBy: { scheduledAt: "desc" },
            take: 5,
          },
          homeworks: {
            orderBy: { dueDate: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.lesson.findMany({
        include: {
          student: true,
          homeworks: true,
        },
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.homework.findMany({
        include: {
          student: true,
          lesson: true,
        },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      students,
      lessons,
      homeworks,
    });
  } catch (error: unknown) {
    console.error("GET education error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch education data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "STUDENT") {
      const { name, email, phone, level = "Intermediate", ratePerHour = 65, targetExamDate, diagnosticNotes } = body;
      const student = await prisma.student.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
          level,
          ratePerHour: Number(ratePerHour) || 65,
          targetExamDate: targetExamDate ? new Date(targetExamDate) : null,
          diagnosticNotes: diagnosticNotes?.trim() || null,
        },
      });
      return NextResponse.json({ success: true, student }, { status: 201 });
    }

    if (type === "LESSON") {
      const {
        studentId,
        title,
        scheduledAt,
        durationMinutes = 60,
        feeAmount = 65,
        objectives,
        vocabDrills = [],
      } = body;

      const lesson = await prisma.lesson.create({
        data: {
          studentId,
          title: title.trim(),
          scheduledAt: new Date(scheduledAt),
          durationMinutes: Number(durationMinutes) || 60,
          feeAmount: Number(feeAmount) || 65,
          objectives: objectives?.trim() || null,
          vocabDrillJson: JSON.stringify(vocabDrills),
        },
        include: { student: true },
      });
      return NextResponse.json({ success: true, lesson }, { status: 201 });
    }

    if (type === "HOMEWORK") {
      const { studentId, lessonId, title, description, dueDate, weakSpotCategory } = body;
      const homework = await prisma.homework.create({
        data: {
          studentId,
          lessonId: lessonId || null,
          title: title.trim(),
          description: description?.trim() || null,
          dueDate: new Date(dueDate),
          weakSpotCategory: weakSpotCategory?.trim() || "General Practice",
        },
        include: { student: true, lesson: true },
      });
      return NextResponse.json({ success: true, homework }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "Unknown entity type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("POST education error:", error);
    return NextResponse.json({ success: false, error: "Failed to create education record" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { entity, id, ...updates } = body;

    if (entity === "LESSON") {
      const lesson = await prisma.lesson.update({
        where: { id },
        data: {
          ...(updates.status && { status: updates.status }),
          ...(updates.isPaid !== undefined && { isPaid: Boolean(updates.isPaid) }),
        },
      });
      return NextResponse.json({ success: true, lesson });
    }

    if (entity === "HOMEWORK") {
      const homework = await prisma.homework.update({
        where: { id },
        data: {
          ...(updates.status && { status: updates.status }),
          ...(updates.score !== undefined && { score: Number(updates.score) }),
          ...(updates.reminderQueued !== undefined && { reminderQueued: Boolean(updates.reminderQueued) }),
        },
      });
      return NextResponse.json({ success: true, homework });
    }

    return NextResponse.json({ success: false, error: "Invalid entity type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("PATCH education error:", error);
    return NextResponse.json({ success: false, error: "Failed to update record" }, { status: 500 });
  }
}
