import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        entityTags: true,
      },
      orderBy: { name: "asc" },
    });

    const enrichedTags = tags.map((t) => ({
      ...t,
      entityCount: t.entityTags.length,
      entityTypes: Array.from(new Set(t.entityTags.map((et) => et.entityType))),
    }));

    return NextResponse.json({ success: true, tags: enrichedTags });
  } catch (error: unknown) {
    console.error("GET tags error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, color = "#0F766E" } = await request.json();
    const clean = name.replace(/^#/, "").trim().toLowerCase();

    const tag = await prisma.tag.upsert({
      where: { name: clean },
      update: { color },
      create: { name: clean, color },
    });

    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST tag error:", error);
    return NextResponse.json({ success: false, error: "Failed to create tag" }, { status: 500 });
  }
}
