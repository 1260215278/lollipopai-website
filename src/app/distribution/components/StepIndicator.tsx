import React from "react";
import { Check } from "lucide-react";

interface Step {
  label: string;
}
interface StepIndicatorProps {
  steps: Step[];
  /** 当前步骤索引（0-based）；小于该索引为已完成 */
  current: number;
}

/** 步骤指示器（移植自原型，纯展示，文案由调用方传入） */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, current }) => (
  <div className="flex items-center">
    {steps.map((step, idx) => {
      const done = idx < current;
      const active = idx === current;
      const last = idx === steps.length - 1;
      return (
        <React.Fragment key={idx}>
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: done || active ? "#111111" : "#F3F4F6",
                border: active && !done ? "2px solid #111111" : "none",
              }}
            >
              {done ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="text-xs" style={{ fontWeight: 600, color: active ? "white" : "#9CA3AF" }}>
                  {idx + 1}
                </span>
              )}
            </div>
            <span
              className="text-sm whitespace-nowrap"
              style={{
                fontWeight: active ? 600 : 400,
                color: active ? "#111111" : done ? "#6B7280" : "#9CA3AF",
              }}
            >
              {step.label}
            </span>
          </div>
          {!last && (
            <div
              className="flex-1 h-px mx-4 transition-colors"
              style={{ background: done ? "#111111" : "#E5E7EB", opacity: done ? 0.3 : 1 }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
