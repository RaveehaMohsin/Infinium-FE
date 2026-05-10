"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { refactorApi } from "@/lib/api";

type TargetType = "query" | "refactor" | "explain" | "rewrite" | "search";

interface Props {
  /** Which surface this feedback belongs to. Drives the per-target memory bucket. */
  targetType: TargetType;
  /** Opaque link back to the rated thing — e.g. conversation_id, repo:file:symbol */
  targetId?: string;
  /** The user-visible prompt/question/instruction shown in the UI. */
  query: string;
  /** The model output (full or preview). */
  answer: string;
  /** Optional repo scope so memory is bucketed per-repo. */
  repoName?: string;
  /** Anything extra to log (model name, granularity, …). */
  metadata?: Record<string, unknown>;
  /** Optional note shown above the buttons. */
  label?: string;
  /** Compact (icon-only) layout vs labeled. */
  compact?: boolean;
}

export function FeedbackButtons({
  targetType,
  targetId,
  query,
  answer,
  repoName,
  metadata,
  label,
  compact = false,
}: Props) {
  const [state, setState] = useState<"idle" | "sending" | "up" | "down">("idle");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");

  const send = async (rating: 1 | 5, withComment?: string) => {
    if (state === "sending" || state === "up" || state === "down") return;
    setState("sending");
    try {
      await refactorApi.submitFeedback({
        target_type: targetType,
        target_id: targetId,
        query,
        answer: answer.slice(0, 4000),
        rating,
        comment: withComment ?? comment ?? "",
        repo_name: repoName,
        metadata,
      });
      setState(rating === 5 ? "up" : "down");
      setShowCommentBox(false);
    } catch {
      setState("idle");
    }
  };

  const isLocked = state === "up" || state === "down";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {label && (
          <span className="text-[10px] uppercase tracking-wide text-[#64748B]">
            {label}
          </span>
        )}
        <Button
          onClick={() => send(5)}
          variant="ghost"
          size="sm"
          disabled={isLocked || state === "sending"}
          className={`${
            state === "up"
              ? "text-[#16A34A]"
              : "text-[#64748B] hover:text-[#16A34A]"
          }`}
          title="This was helpful"
        >
          {state === "sending" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsUp className="w-4 h-4" />
          )}
          {!compact && <span className="ml-1 text-xs">Helpful</span>}
        </Button>
        <Button
          onClick={() => {
            if (isLocked) return;
            setShowCommentBox((v) => !v);
          }}
          variant="ghost"
          size="sm"
          disabled={isLocked || state === "sending"}
          className={`${
            state === "down"
              ? "text-[#DC2626]"
              : "text-[#64748B] hover:text-[#DC2626]"
          }`}
          title="This wasn't helpful"
        >
          <ThumbsDown className="w-4 h-4" />
          {!compact && <span className="ml-1 text-xs">Not helpful</span>}
        </Button>
        {state === "up" && (
          <span className="text-xs text-[#16A34A]">Thanks — saved.</span>
        )}
        {state === "down" && (
          <span className="text-xs text-[#DC2626]">Logged — we&apos;ll do better.</span>
        )}
      </div>

      {showCommentBox && !isLocked && (
        <div className="flex flex-col gap-2 border-2 border-[#FECACA] rounded-sm p-2 bg-[#FEF2F2]">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What was wrong? (optional, helps the model improve)"
            className="text-xs border border-[#CBD5E1] rounded-sm p-2 min-h-[60px] focus:border-[#1E3A8A] outline-none"
          />
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCommentBox(false);
                setComment("");
              }}
              className="text-[#64748B]"
            >
              <X className="w-3 h-3 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => send(1, comment)}
              className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            >
              <Check className="w-3 h-3 mr-1" /> Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
