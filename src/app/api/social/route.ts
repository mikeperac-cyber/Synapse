import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Dynamic hashtag scoring matrix
const HASHTAG_WEIGHTS: Record<string, { volume: string; score: number; niche: string }> = {
  "#ieltswriting": { volume: "450K", score: 94, niche: "Academy" },
  "#c1english": { volume: "220K", score: 96, niche: "Academy" },
  "#academicvocabulary": { volume: "180K", score: 92, niche: "Academy" },
  "#englishteacher": { volume: "1.2M", score: 85, niche: "Broad" },
  "#ieltsband8": { volume: "310K", score: 98, niche: "High-Intent" },
  "#buildinpublic": { volume: "850K", score: 91, niche: "Dev" },
  "#indiehackers": { volume: "520K", score: 93, niche: "Dev" },
  "#nextjs": { volume: "680K", score: 90, niche: "Dev" },
  "#typescript": { volume: "940K", score: 88, niche: "Dev" },
  "#fullstack": { volume: "1.5M", score: 84, niche: "Dev" },
  "#productivity": { volume: "3.4M", score: 79, niche: "Broad" },
  "#studymotivation": { volume: "2.1M", score: 82, niche: "Broad" },
};

// Best posting time recommendations
const OPTIMAL_TIMES = [
  { day: "Monday", time: "18:30", reason: "Peak evening focus & study prep" },
  { day: "Tuesday", time: "08:15", reason: "Morning commute technical digest" },
  { day: "Wednesday", time: "19:00", reason: "Mid-week educational retention peak" },
  { day: "Thursday", time: "12:45", reason: "Lunchtime carousel swipe-throughs" },
  { day: "Friday", time: "17:00", reason: "Weekend project inspiration" },
  { day: "Sunday", time: "20:00", reason: "Weekly review & study scheduling" },
];

export async function GET() {
  try {
    const posts = await prisma.instagramPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      posts,
      hashtagDatabase: HASHTAG_WEIGHTS,
      optimalTimes: OPTIMAL_TIMES,
    });
  } catch (error: unknown) {
    console.error("GET social error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch social posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      hook,
      body: postBody,
      cta,
      visualAssetList = [],
      audioTrack,
      status = "DRAFT",
      scheduledFor,
      hashtagCluster = [],
      studentAcquisitionGoal,
    } = body;

    if (!hook || !postBody) {
      return NextResponse.json({ success: false, error: "Hook and body are required" }, { status: 400 });
    }

    const fullContent = `${hook}\n\n${postBody}\n\n${cta || ""}`;
    const charCount = fullContent.length;

    // Calculate algorithmic score
    let score = 75.0;
    if (hook.includes("?") || hook.includes("Stop") || hook.includes("How I") || hook.includes("5")) score += 10;
    if (cta && cta.toLowerCase().includes("comment")) score += 8;
    if (visualAssetList.length >= 3) score += 6;

    // Evaluate hashtags
    if (Array.isArray(hashtagCluster)) {
      for (const tag of hashtagCluster) {
        const item = HASHTAG_WEIGHTS[tag.toLowerCase()];
        if (item) score = Math.min(99.0, score + 1.5);
      }
    }

    const post = await prisma.instagramPost.create({
      data: {
        hook: hook.trim(),
        body: postBody.trim(),
        cta: cta?.trim() || "",
        visualAssetListJson: JSON.stringify(visualAssetList),
        audioTrack: audioTrack?.trim() || null,
        status,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        hashtagClusterJson: JSON.stringify(hashtagCluster),
        charCount,
        estScore: parseFloat(score.toFixed(1)),
        studentAcquisitionGoal: studentAcquisitionGoal?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST social error:", error);
    return NextResponse.json({ success: false, error: "Failed to create social post" }, { status: 500 });
  }
}
