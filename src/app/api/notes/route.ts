import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function extractBacklinks(content: string): string[] {
  const matches = content.match(/\[\[(.*?)\]\]/g);
  if (!matches) return [];
  const links = matches.map((m) => m.slice(2, -2).trim()).filter(Boolean);
  return Array.from(new Set(links));
}

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ success: true, notes });
  } catch (error: unknown) {
    console.error("GET notes error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, pinned = false } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and content are required" }, { status: 400 });
    }

    const backlinks = extractBacklinks(content);

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        pinned: Boolean(pinned),
        backlinksJson: JSON.stringify(backlinks),
      },
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST note error:", error);
    return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
  }
}
