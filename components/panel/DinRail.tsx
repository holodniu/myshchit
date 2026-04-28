"use client";

import type { PanelItem } from "@/lib/calculator/panel-layout";
import BreakerSVG from "./BreakerSVG";

type EnrichedPanelItem = PanelItem & {
  sublabel?: string;
  qfLabel?: string;
  brand?: string;
  characteristic?: "B" | "C" | "D";
  sensitivity?: number;
  rcdType?: "AC" | "A" | "B";
};

export default function DinRail({
  items,
  railIndex,
  modulesPerRail,
}: {
  items: EnrichedPanelItem[];
  railIndex: number;
  modulesPerRail: number;
}) {
  const usedModules = items.reduce((sum, i) => sum + i.modules, 0);
  const emptyModules = modulesPerRail - usedModules;
  const MODULE_WIDTH = 50;

  return (
    <div className="mb-8">
      {/* Номер рейки */}
      <div className="flex items-center gap-2 mb-2">
        <div className="px-2 py-0.5 bg-[#2962FF]/20 border border-[#2962FF] rounded text-xs text-[#2962FF] font-mono font-bold">
          РЕЙКА {railIndex + 1}
        </div>
        <div className="text-xs text-[#787B86]">
          {usedModules}/{modulesPerRail} модулей
        </div>
        <div className="flex-1 h-px bg-[#363A45]" />
      </div>

      {/* Контейнер рейки с фоном */}
      <div className="relative bg-gradient-to-b from-[#e8eaed] to-[#d0d3d8] rounded-lg p-5 border-2 border-[#90a4ae] shadow-inner">
        {/* Стальная DIN-рейка */}
        <div
          className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-[155px] pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* Металлическая рейка с градиентом */}
          <div
            className="absolute inset-0 rounded-sm shadow-inner"
            style={{
              background: "linear-gradient(to bottom, #9e9e9e 0%, #eeeeee 20%, #bdbdbd 50%, #757575 80%, #424242 100%)",
            }}
          />
          
          {/* Блик сверху */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-sm" />
          
          {/* Крепёжные пазы (отверстия) */}
          {Array.from({ length: Math.floor(modulesPerRail / 3) }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-5 bg-[#263238] rounded-sm shadow"
              style={{
                left: `${(i + 1) * (100 / (Math.floor(modulesPerRail / 3) + 1))}%`,
              }}
            >
              <div className="absolute inset-1 bg-black rounded-sm" />
            </div>
          ))}
        </div>

        {/* Модули */}
        <div
          className="relative flex gap-0.5 items-center justify-start min-h-[210px]"
          style={{ zIndex: 1 }}
        >
          {items.map((item) => {
            const match = item.label.match(/([A-D])?(\d+)/);
            const characteristic = (item.characteristic || match?.[1] || "C") as
              | "B"
              | "C"
              | "D";
            const current = parseInt(match?.[2] || "16");
            const itemType = (item.type === "INPUT" ||
            item.type === "RCD" ||
            item.type === "BREAKER"
              ? item.type
              : "BREAKER") as "BREAKER" | "RCD" | "INPUT";

            return (
              <BreakerSVG
                key={item.id}
                poles={item.modules as 1 | 2 | 3 | 4}
                current={current}
                characteristic={characteristic}
                brand={item.brand || "ABB"}
                label={item.qfLabel}
                sublabel={item.sublabel}
                type={itemType}
                sensitivity={item.sensitivity}
                rcdType={item.rcdType}
              />
            );
          })}

          {/* Пустое место (резерв) */}
          {emptyModules > 0 && (
            <div
              className="h-[185px] border-2 border-dashed border-[#90a4ae] rounded flex items-center justify-center text-[#607d8b] text-xs bg-white/40 backdrop-blur-sm"
              style={{
                width: `${emptyModules * MODULE_WIDTH}px`,
                minWidth: `${emptyModules * MODULE_WIDTH}px`,
              }}
            >
              <div className="text-center">
                <div className="text-3xl mb-1 opacity-50">🔋</div>
                <div className="font-semibold">Резерв</div>
                <div className="font-mono text-[#37474F]">{emptyModules} мод.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

