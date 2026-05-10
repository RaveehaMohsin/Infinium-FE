"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { refactorApi } from "@/lib/api";
import type { FeedbackMetrics } from "@/lib/api/refactor";

const RANGES = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

const TARGETS = [
  { key: "", label: "All surfaces" },
  { key: "query", label: "Query" },
  { key: "refactor", label: "Refactor" },
  { key: "explain", label: "Explain" },
];

export function ModelAccuracyPanel() {
  const [days, setDays] = useState(30);
  const [targetType, setTargetType] = useState("");
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    refactorApi
      .getFeedbackMetrics({ days, targetType: targetType || undefined })
      .then((m) => {
        if (!cancelled) setMetrics(m);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load metrics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, targetType]);

  const headlinePct = useMemo(() => {
    if (!metrics) return 0;
    return Math.round((metrics.summary.helpfulness_rate || 0) * 100);
  }, [metrics]);

  // Compare against the older half of the window to show a trend arrow.
  const trend = useMemo(() => {
    if (!metrics || metrics.by_day.length < 4) return null;
    const half = Math.floor(metrics.by_day.length / 2);
    const olderRate = avgRate(metrics.by_day.slice(0, half));
    const newerRate = avgRate(metrics.by_day.slice(half));
    if (olderRate === null || newerRate === null) return null;
    return { older: olderRate, newer: newerRate, delta: newerRate - olderRate };
  }, [metrics]);

  return (
    <Card className="border-2 border-[#E2E8F0] p-6 bg-white space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0F172A]">Feedback Analytics</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            User-perceived helpfulness from 👍 / 👎 feedback. Bigger sample = more reliable.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border-2 border-[#E2E8F0] rounded-sm overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1 text-xs ${
                  days === r.days
                    ? "bg-[#1E3A8A] text-white"
                    : "text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="border-2 border-[#E2E8F0] rounded-sm px-2 py-1 text-xs bg-white outline-none focus:border-[#1E3A8A]"
          >
            {TARGETS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-[#64748B]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-sm text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded p-3">
          {error}
        </div>
      ) : !metrics || metrics.summary.total === 0 ? (
        <div className="text-sm text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded p-6 text-center">
          No feedback yet in this window. Rate a few answers / refactors and come back.
        </div>
      ) : (
        <>
          {/* Headline row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat
              label="Helpfulness"
              value={`${headlinePct}%`}
              hint={
                trend
                  ? `${trend.delta >= 0 ? "▲" : "▼"} ${Math.abs(trend.delta * 100).toFixed(0)}pp vs prior half`
                  : `${metrics.summary.up}/${metrics.summary.up + metrics.summary.down} positive`
              }
              icon={
                !trend ? null : trend.delta > 0.02 ? (
                  <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                ) : trend.delta < -0.02 ? (
                  <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                ) : (
                  <Minus className="w-4 h-4 text-[#64748B]" />
                )
              }
            />
            <Stat
              label="Avg Rating"
              value={metrics.summary.average_rating.toFixed(2)}
              hint="out of 5"
            />
            <Stat
              label="Thumbs Up"
              value={String(metrics.summary.up)}
              icon={<ThumbsUp className="w-4 h-4 text-[#16A34A]" />}
            />
            <Stat
              label="Thumbs Down"
              value={String(metrics.summary.down)}
              icon={<ThumbsDown className="w-4 h-4 text-[#DC2626]" />}
            />
          </div>

          {/* Sparkline of daily helpfulness */}
          <div>
            <div className="text-xs text-[#64748B] mb-1">
              Helpfulness over time (last {days} days)
            </div>
            <Sparkline points={metrics.by_day.map((p) => p.helpfulness_rate)} />
            <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
              <span>{metrics.by_day[0]?.date}</span>
              <span>{metrics.by_day[metrics.by_day.length - 1]?.date}</span>
            </div>
          </div>

          {/* Per-target type bars */}
          {Object.keys(metrics.by_target_type).length > 1 && (
            <BreakdownBars title="By surface" data={metrics.by_target_type} />
          )}

          {/* Per-model bars — useful if you compare qwen-coder vs minimax */}
          {Object.keys(metrics.by_model).filter((m) => m !== "unknown").length > 0 && (
            <BreakdownBars title="By model" data={metrics.by_model} />
          )}

          {/* Recent negative feedback — triage list */}
          {metrics.recent_negatives.length > 0 && (
            <div>
              <div className="text-xs text-[#64748B] mb-2">
                Recent 👎 (last {metrics.recent_negatives.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-auto">
                {metrics.recent_negatives.map((n) => (
                  <div
                    key={n.id}
                    className="text-xs border border-[#FECACA] bg-[#FEF2F2] rounded p-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#7F1D1D] capitalize">
                        {n.target_type}
                      </span>
                      <span className="text-[10px] text-[#991B1B]">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    {n.repo_name && (
                      <div className="text-[10px] text-[#991B1B] font-mono mt-0.5">
                        {n.repo_name}
                      </div>
                    )}
                    <div className="text-[#7F1D1D] mt-1 truncate">
                      <span className="text-[#991B1B]">Prompt:</span> {n.query}
                    </div>
                    {n.comment && (
                      <div className="text-[#7F1D1D] mt-1">
                        <span className="text-[#991B1B]">User said:</span> {n.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function avgRate(points: { up: number; down: number }[]): number | null {
  let up = 0;
  let down = 0;
  for (const p of points) {
    up += p.up;
    down += p.down;
  }
  return up + down > 0 ? up / (up + down) : null;
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="border-2 border-[#E2E8F0] rounded-sm p-3 bg-[#F8FAFC]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[#64748B]">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-[#0F172A] mt-1">{value}</div>
      {hint && <div className="text-[10px] text-[#64748B] mt-0.5">{hint}</div>}
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <div className="h-16 bg-[#F8FAFC] rounded border border-[#E2E8F0]" />;
  }
  const w = 600;
  const h = 64;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 0.01);
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });
  const path = coords.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area =
    `M${coords[0][0]},${h} ` +
    coords.map(([x, y]) => `L${x},${y}`).join(" ") +
    ` L${coords[coords.length - 1][0]},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded"
      preserveAspectRatio="none"
    >
      <path d={area} fill="#1E3A8A22" />
      <path d={path} fill="none" stroke="#1E3A8A" strokeWidth="1.5" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#1E3A8A" />
      ))}
    </svg>
  );
}

function BreakdownBars({
  title,
  data,
}: {
  title: string;
  data: Record<string, { total: number; up: number; down: number; helpfulness_rate: number }>;
}) {
  const rows = Object.entries(data)
    .filter(([k, v]) => v.up + v.down > 0 && k !== "unknown")
    .sort((a, b) => b[1].total - a[1].total);
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="text-xs text-[#64748B] mb-2">{title}</div>
      <div className="space-y-2">
        {rows.map(([key, v]) => {
          const pct = Math.round(v.helpfulness_rate * 100);
          return (
            <div key={key} className="flex items-center gap-3 text-xs">
              <div className="w-32 truncate text-[#0F172A]" title={key}>
                {key}
              </div>
              <div className="flex-1 h-3 bg-[#F1F5F9] rounded relative overflow-hidden">
                <div
                  className="h-full bg-[#1E3A8A]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-16 text-right text-[#64748B]">
                {pct}% <span className="text-[#94A3B8]">({v.total})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
