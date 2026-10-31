"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { InstagramPost } from "@/lib/types";
import {
  Instagram,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Hash,
  Music,
  Image as ImageIcon,
  Plus,
} from "lucide-react";

interface InstagramEngineViewProps {
  posts: InstagramPost[];
  onRefreshData: () => void;
}

export const InstagramEngineView: React.FC<InstagramEngineViewProps> = ({
  posts,
  onRefreshData,
}) => {
  const { showToast } = useAppStore();

  const [hook, setHook] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [cta, setCta] = useState("");
  const [audioTrack, setAudioTrack] = useState("");
  const [studentAcquisitionGoal, setStudentAcquisitionGoal] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "#ieltswriting",
    "#c1english",
    "#academicvocabulary",
  ]);

  const availableHashtags = [
    { tag: "#ieltswriting", score: 94, category: "Academy" },
    { tag: "#c1english", score: 96, category: "Academy" },
    { tag: "#academicvocabulary", score: 92, category: "Academy" },
    { tag: "#ieltsband8", score: 98, category: "High-Intent" },
    { tag: "#buildinpublic", score: 91, category: "Dev" },
    { tag: "#indiehackers", score: 93, category: "Dev" },
    { tag: "#nextjs", score: 90, category: "Dev" },
  ];

  const optimalHeatmap = [
    { day: "Monday", time: "18:30", efficiency: "98%", status: "OPTIMAL" },
    { day: "Tuesday", time: "08:15", efficiency: "92%", status: "HIGH" },
    { day: "Wednesday", time: "19:00", efficiency: "95%", status: "OPTIMAL" },
    { day: "Thursday", time: "12:45", efficiency: "88%", status: "MODERATE" },
    { day: "Sunday", time: "20:00", efficiency: "99%", status: "PEAK" },
  ];

  const charCount = `${hook}\n\n${bodyText}\n\n${cta}`.length;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hook.trim() || !bodyText.trim()) return;

    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook: hook.trim(),
          body: bodyText.trim(),
          cta: cta.trim(),
          audioTrack: audioTrack.trim() || "Nordic Minimalist Lo-Fi Beat",
          studentAcquisitionGoal: studentAcquisitionGoal.trim() || "Acquire 2 new C1 Speaking candidates",
          hashtagCluster: selectedTags,
          visualAssetList: ["Hook slide", "Insight breakdown", "CTA slide"],
          status: "SCHEDULED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("📱 Instagram Post & Reel scheduled and optimized!");
        setHook("");
        setBodyText("");
        setCta("");
        onRefreshData();
      }
    } catch {
      showToast("Failed to schedule post");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-nordic-border dark:border-zen-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-nordic-text dark:text-zen-text flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          <span>Instagram Content Engine & Heatmap Optimizer</span>
        </h1>
        <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
          Post & Reel Planner (Hook/Body/CTA), dynamic hashtag cluster scoring, and posting-time heatmap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Post Composer & Matrix */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
              Content Matrix Composer
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              {/* Hook */}
              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  1. Hook (First 3 seconds / Headline)
                </label>
                <input
                  type="text"
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="e.g. Stop saying 'Very important' in your IELTS essays..."
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  2. Educational Core / Value Body
                </label>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Bullet points, C1 alternatives, or code breakdown..."
                  rows={4}
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
              </div>

              {/* CTA */}
              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  3. Call-to-Action (CTA)
                </label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g. Comment 'C1' to receive our vocabulary sheet..."
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
              </div>

              {/* Audio & Target */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                    Audio Inspiration
                  </label>
                  <input
                    type="text"
                    value={audioTrack}
                    onChange={(e) => setAudioTrack(e.target.value)}
                    placeholder="Lo-Fi Piano"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                    Student Target
                  </label>
                  <input
                    type="text"
                    value={studentAcquisitionGoal}
                    onChange={(e) => setStudentAcquisitionGoal(e.target.value)}
                    placeholder="2 C1 Leads"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                  />
                </div>
              </div>

              {/* Hashtag cluster picker */}
              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  Dynamic Hashtag Clusters
                </label>
                <div className="flex flex-wrap gap-1">
                  {availableHashtags.map((h) => {
                    const isSelected = selectedTags.includes(h.tag);
                    return (
                      <button
                        type="button"
                        key={h.tag}
                        onClick={() => toggleTag(h.tag)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                          isSelected
                            ? "bg-pink-500 text-white border-pink-500 font-bold"
                            : "bg-nordic-card dark:bg-zen-card text-nordic-muted border-nordic-border"
                        }`}
                      >
                        {h.tag} ({h.score})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-nordic-muted dark:text-zen-muted font-mono pt-1">
                <span>{charCount} characters</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Algorithmic Score: ~95.0</span>
              </div>

              <button
                type="submit"
                disabled={!hook.trim() || !bodyText.trim()}
                className="w-full py-2 rounded-lg bg-pink-500 text-white font-medium disabled:opacity-50"
              >
                Schedule & Optimize Post
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Posting-Time Heatmap & Scheduled Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Posting Heatmap Card */}
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>Posting-Time Heatmap Recommendation Engine</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Peak Algorithm Slots
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {optimalHeatmap.map((slot, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border/70 dark:border-zen-border/70 space-y-1"
                >
                  <div className="text-[11px] font-bold text-nordic-text dark:text-zen-text">
                    {slot.day}
                  </div>
                  <div className="text-sm font-mono font-bold text-pink-500">
                    {slot.time}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    {slot.efficiency} reach
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled & Published Posts List */}
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
              Scheduled Posts & Performance
            </h3>

            <div className="space-y-3">
              {posts.map((p) => {
                const tags = p.hashtagClusterJson ? JSON.parse(p.hashtagClusterJson) : [];
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border/70 dark:border-zen-border/70 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold">
                          {p.status}
                        </span>
                        <div className="font-bold text-nordic-text dark:text-zen-text mt-1 text-sm">
                          &ldquo;{p.hook}&rdquo;
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-nordic-teal dark:text-zen-mint bg-nordic-surface dark:bg-zen-surface px-2 py-0.5 rounded-full border border-nordic-border">
                        Score: {p.estScore}
                      </span>
                    </div>

                    <p className="text-nordic-muted dark:text-zen-muted leading-relaxed whitespace-pre-line">
                      {p.body}
                    </p>

                    {p.cta && (
                      <div className="font-semibold text-nordic-text dark:text-zen-text">
                        CTA: {p.cta}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 pt-1">
                      {tags.map((tg: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono text-pink-600 dark:text-pink-400"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
