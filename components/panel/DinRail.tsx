"use client";

import type { PanelItem } from "@/lib/calculator/panel-layout";
import BreakerSVG from "./BreakerSVG";

export default function DinRail({
  items,
  railIndex,
  modulesPerRail,
}: {
  items: (PanelItem & {
    sublabel?: string;
    qfLabel?: string;
    brand?: string;
    characteristic?: "B" | "C" | "D";
    sensitivity?: number;
    rcdType?: "AC" | "A" | "B";
  })[];
  railIndex: number;
  modulesPerRail: number;
}) {
  const usedModules = items.reduce((sum, i) => sum + i.modules, 0);
  const emptyModules = modulesPerRail - usedModules;
  const MODULE_WIDTH = 50;

  return (
    <div className="mb-8">
      {/* Номер рейки */}
      <div className="text-xs text-[#787B86] mb-2 font-mono">
        РЕЙКА {railIndex + 1} · {usedModules}/{modulesPerRail} модулей
      </div>

      {/* DIN-рейка с фоном */}
      <div className="relative bg-[#fafafa] rounded-md p-4 border-2 border-[#cfd8dc] shadow-inner">
        {/* Сама DIN-рейка (серая металлическая полоса) */}
        <div
          className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[140px] bg-gradient-to-b from-[#9e9e9e] via-[#bdbdbd] to-[#757575] rounded-sm shadow-inner pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* Крепёжные пазы рейки */}
          {Array.from({ length: Math.floor(modulesPerRail / 3) }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-[#424242]"
              style={{ left: `${(i + 1) * (100 / Math.floor(modulesPerRail / 3 + 1))}%` }}
            />
          ))}
        </div>

        {/* Модули на рейке */}
        <div className="relative flex gap-0.5 items-center justify-start min-h-[200px]" style={{ zIndex: 1 }}>
          {items.map((item) => {
            // Определяем параметры модуля из label
            const match = item.label.match(/([A-D])?(\d+)/);
            const characteristic = (item.characteristic || match?.[1] || "C") as "B" | "C" | "D";
            const current = parseInt(match?.[2] || "16");

            const isRcd = item.type === "RCD";
            const isInput = item.type === "INPUT";

            return (
              <BreakerSVG
                key={item.id}
                poles={item.modules as 1 | 2 | 3 | 4}
                current={current}
                characteristic={characteristic}
                brand={item.brand || "ABB"}
                label={item.qfLabel}
                sublabel={item.sublabel}
                type={item.type as "BREAKER" | "RCD" | "INPUT"}
                sensitivity={item.sensitivity}
                rcdType={item.rcdType}
              />
            );
          })}

          {/* Пустое место (резерв) */}
          {emptyModules > 0 && (
            <div
              className="h-[180px] border-2 border-dashed border-[#90a4ae] rounded flex items-center justify-center text-[#607d8b] text-xs bg-white/50"
              style={{ width: `${emptyModules * MODULE_WIDTH}px`, minWidth: `${emptyModules * MODULE_WIDTH}px` }}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🔋</div>
                <div>Резерв</div>
                <div className="font-mono">{emptyModules} мод.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
