import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          include: {
            timeLogs: true,
          },
        },
        timeLogs: true,
        financeItems: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, projects });
  } catch (error: unknown) {
    console.error("GET projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      stage = "BUILD",
      budget = 5000,
      hourlyRate = 85,
      targetDate,
      markdownDoc,
      tagNames = [],
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Project title is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        stage,
        budget: Number(budget) || 0,
        hourlyRate: Number(hourlyRate) || 85,
        targetDate: targetDate ? new Date(targetDate) : null,
        markdownDoc: markdownDoc || "# Ideation & Blueprint\n\nOutline core architecture and milestones.",
      },
    });

    if (Array.isArray(tagNames) && tagNames.length > 0) {
      for (const tagName of tagNames) {
        const clean = tagName.replace(/^#/, "").trim().toLowerCase();
        if (!clean) continue;
        let tag = await prisma.tag.findUnique({ where: { name: clean } });
        if (!tag) tag = await prisma.tag.create({ data: { name: clean } });
        await prisma.entityTag.create({
          data: { tagId: tag.id, entityType: "PROJECT", entityId: project.id },
        });
      }
    }

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST project error:", error);
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
  }
}
