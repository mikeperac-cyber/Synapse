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

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.stage !== undefined && { stage: body.stage }),
        ...(body.velocityScore !== undefined && { velocityScore: Number(body.velocityScore) }),
        ...(body.healthScore !== undefined && { healthScore: Number(body.healthScore) }),
        ...(body.hourlyRate !== undefined && { hourlyRate: Number(body.hourlyRate) }),
        ...(body.budget !== undefined && { budget: Number(body.budget) }),
        ...(body.markdownDoc !== undefined && { markdownDoc: body.markdownDoc }),
      },
      include: {
        tasks: true,
        timeLogs: true,
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: unknown) {
    console.error("PATCH project error:", error);
    return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 });
  }
}
