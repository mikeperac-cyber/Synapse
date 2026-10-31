import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json();

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        lessons: {
          orderBy: { scheduledAt: "desc" },
          take: 3,
        },
        homeworks: {
          orderBy: { assignedDate: "desc" },
          take: 5,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    // Determine targeted weak spot based on diagnostic notes or recent homework
    const diag = (student.diagnosticNotes || "").toLowerCase();
    let title = "Academic Writing & Lexical Precision Drill";
    let weakSpot = "Lexical Resource";
    let description = "Draft a 300-word argumentative response utilizing 5 academic collocations and varied syntactic structures.";

    if (diag.includes("inversion") || diag.includes("part 3")) {
      weakSpot = "Negative Inversions & Part 3 Discourse";
      title = "Mastery Assignment: Inversion in Spoken & Written Argumentation";
      description = "Write 8 complex sentences using formal inversion triggers (e.g. 'Seldom', 'Not only', 'Scarcely', 'Under no circumstances') and record a 2-minute audio response addressing abstract global policy questions.";
    } else if (diag.includes("cohesion") || diag.includes("passive") || diag.includes("chart")) {
      weakSpot = "Academic Task 1 Cohesion & Passive Synthesis";
      title = "Data Synthesis Report: Multi-Variable Trends & Passive Formulations";
      description = "Summarize provided statistical dataset using accurate passive voice structures without repeating lexical verbs. Focus on eliminating sentence fragments.";
    } else if (diag.includes("reading") || diag.includes("speed")) {
      weakSpot = "Reading Section 3 Skimming & Inferences";
      title = "Speed Diagnostics: Academic Prose & True/False/Not Given";
      description = "Complete timed Passage 3 diagnostic drill within 18 minutes, highlighting textual evidence for each inference item.";
    }

    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // due in 3 days

    const homework = await prisma.homework.create({
      data: {
        studentId: student.id,
        title,
        description,
        assignedDate: new Date(),
        dueDate,
        status: "ASSIGNED",
        weakSpotCategory: weakSpot,
        reminderQueued: false,
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Autonomously generated targeted assignment for ${student.name} focusing on '${weakSpot}'`,
      homework,
    });
  } catch (error: unknown) {
    console.error("Generate homework error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate homework" }, { status: 500 });
  }
}
