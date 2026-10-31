"use client";

import { useCanvasStore } from "@/store/canvas";
import { useEffect, useState } from "react";
import { fetchCredits } from "@/lib/api";
import { Activity, Cpu, Cloud, DollarSign, TrendingUp } from "lucide-react";

interface HistoryEntry {
  capability: string;
  model: string;
  backend: string;
  cost_usd: number;
  duration_seconds: number;
  timestamp: string;
}

export function CreditDashboard() {
  const { credits, setCredits } = useCanvasStore();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const load = () => {
      fetchCredits()
        .then(setCredits)
        .catch(() => {});
      fetch("http://localhost:8787/api/credits")
        .then((r) => r.json())
        .then((d) => setHistory(d.entries || []))
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [setCredits]);

  const stats = [
    {
      label: "Total Generations",
      value: credits?.totalGenerations ?? 0,
      icon: Activity,
      color: "text-accent",
    },
    {
      label: "Local (Free)",
      value: credits?.localCount ?? 0,
      icon: Cpu,
      color: "text-success",
    },
    {
      label: "API (Paid)",
      value: credits?.apiCount ?? 0,
      icon: Cloud,
      color: "text-accent2",
    },
    {
      label: "Total Cost",
      value: `$${(credits?.totalCost ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
    },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Generation History
        </h2>
        <div className="flex items-center gap-2 text-xs text-muted">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Auto-refreshing</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-bg rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* History table */}
      {history.length > 0 ? (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted border-b border-border">
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Model</th>
                <th className="text-left py-2 px-3">Backend</th>
                <th className="text-right py-2 px-3">Cost</th>
                <th className="text-right py-2 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(-20).reverse().map((e, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-bg/50"
                >
                  <td className="py-2.5 px-3">
                    <span className="text-accent2 capitalize">
                      {e.capability}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted">{e.model}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs ${
                        e.backend === "local"
                          ? "bg-success/10 text-success"
                          : "bg-accent2/10 text-accent2"
                      }`}
                    >
                      {e.backend}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-success">
                    ${e.cost_usd.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted">
                    {e.duration_seconds.toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted text-sm">
          No generations yet — create something to see history here
        </div>
      )}
    </div>
  );
}
