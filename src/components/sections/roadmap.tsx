"use client";

import { Rocket, Flag, Target, CheckCircle2, Clock, ArrowRight, CircleDot } from "lucide-react";
import { ROADMAP_PHASES } from "@/lib/types";

const PHASE_ICONS = [Flag, Rocket, Target];
const PHASE_COLORS = [
  { bg: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", text: "text-emerald-400", accent: "#10b981" },
  { bg: "from-teal-500/20 to-cyan-600/10", border: "border-teal-500/30", text: "text-teal-400", accent: "#14b8a6" },
  { bg: "from-cyan-500/20 to-teal-600/10", border: "border-cyan-500/30", text: "text-cyan-400", accent: "#2dd4bf" },
];

export default function Roadmap() {
  return (
    <section className="relative py-24 overflow-hidden" id="roadmap">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Rocket className="h-4 w-4" />
            Roadmap
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Building the Future of{" "}
            <span className="gradient-text">DeFi Credit</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Milestone-driven development from foundation to global expansion.
            Each phase builds on the last to create comprehensive credit infrastructure.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {ROADMAP_PHASES.map((phase, phaseIndex) => {
            const phaseIcon = PHASE_ICONS[phaseIndex];
            const phaseColor = PHASE_COLORS[phaseIndex];
            const PhaseIcon = phaseIcon;

            return (
              <div key={phase.phase}>
                {/* Phase Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${phaseColor.bg} flex items-center justify-center border ${phaseColor.border}`}
                  >
                    <PhaseIcon className={`h-6 w-6 ${phaseColor.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {phase.phase}: {phase.title}
                      </h3>
                    </div>
                    <p className="text-sm text-emerald-100/40">
                      {phaseIndex === 0
                        ? "Budget: $1.2M — Team: 8 people"
                        : phaseIndex === 1
                        ? "Budget: $2.8M + ZKCR community sale revenue"
                        : "Scaling to $500M TVL, 100+ integrations"}
                    </p>
                  </div>
                </div>

                {/* Milestones Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-0 lg:ml-16">
                  {phase.milestones.map((milestone, mIndex) => (
                    <div
                      key={milestone.id}
                      className={`glass-card rounded-xl p-5 hover:border-emerald-500/30 transition-all group relative overflow-hidden`}
                    >
                      {/* Phase accent line */}
                      <div
                        className="absolute top-0 left-0 w-1 h-full opacity-50"
                        style={{ backgroundColor: phaseColor.accent }}
                      />

                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {milestone.status === "done" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : milestone.status === "partial" ? (
                            <CircleDot className="h-5 w-5 text-amber-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-emerald-100/30" />
                          )}
                        </div>
                        <div>
                          <div className="mb-1">
                            <span className="text-xs font-mono text-emerald-100/30">
                              {milestone.id}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {milestone.title}
                          </h4>
                          <p className="text-xs text-emerald-100/40 mt-1">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Phase connector */}
                {phaseIndex < ROADMAP_PHASES.length - 1 && (
                  <div className="flex justify-center my-6">
                    <ArrowRight className="h-6 w-6 text-emerald-500/20 rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-emerald-500/10 text-center">
          <p className="text-sm text-emerald-100/40">
            Follow our journey on{" "}
            <a
              href="https://x.com/ZkCreditScore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              X @ZkCreditScore
            </a>{" "}
            ·{" "}
            <a
              href="https://zkscore.credit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              zkscore.credit
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
