import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const memos = await prisma.voiceMemo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, memos });
  } catch (error: unknown) {
    console.error("GET voice memos error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch voice memos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      audioUrl,
      durationSeconds = 0,
      transcription,
      autoExtractTasks = true,
    } = body;

    const text = transcription?.trim() || "Voice recording processed without speech detected.";

    // Intelligent heuristic action item extractor:
    // Looks for imperative sentences, "need to", "must", "follow up", "review", "draft", "prepare"
    const actionItems: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      const clean = sentence.trim();
      if (
        /^(need to|must|should|prepare|review|draft|finalize|follow up|schedule|audit|send|call)/i.test(
          clean
        ) ||
        clean.toLowerCase().includes("need to") ||
        clean.toLowerCase().includes("make sure") ||
        clean.toLowerCase().includes("follow up")
      ) {
        actionItems.push(clean.replace(/^(and\s+|also\s+)/i, ""));
      }
    }

    if (actionItems.length === 0 && text.length > 10) {
      actionItems.push(`Review notes from: "${title || "Voice Memo"}"`);
    }

    // Infer tag clusters from keywords
    const tagCluster: string[] = [];
    const lower = text.toLowerCase();
    if (lower.includes("student") || lower.includes("lesson") || lower.includes("ielts") || lower.includes("drill")) {
      tagCluster.push("ielts-prep", "academy");
    }
    if (lower.includes("code") || lower.includes("nextjs") || lower.includes("sqlite") || lower.includes("bug")) {
      tagCluster.push("react-perf", "dev");
    }
    if (lower.includes("invoice") || lower.includes("money") || lower.includes("payment") || lower.includes("tax")) {
      tagCluster.push("financial-q3");
    }
    if (lower.includes("urgent") || lower.includes("asap") || lower.includes("today")) {
      tagCluster.push("urgent");
    }

    const memo = await prisma.voiceMemo.create({
      data: {
        title: title?.trim() || `Memo ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        audioUrl: audioUrl || null,
        durationSeconds: Number(durationSeconds) || 0,
        transcription: text,
        actionItemsJson: JSON.stringify(actionItems),
        clusteredTagsJson: JSON.stringify(tagCluster),
      },
    });

    // Optionally auto-create tasks for high confidence action items
    if (autoExtractTasks && actionItems.length > 0) {
      for (const item of actionItems.slice(0, 2)) {
        await prisma.task.create({
          data: {
            title: item,
            description: `Extracted from Voice Memo: "${memo.title}"`,
            priority: tagCluster.includes("urgent") ? "URGENT" : "MEDIUM",
            status: "TODO",
            estimatedMinutes: 30,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      memo,
      extractedCount: actionItems.length,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST voice memo error:", error);
    return NextResponse.json({ success: false, error: "Failed to create voice memo" }, { status: 500 });
  }
}
