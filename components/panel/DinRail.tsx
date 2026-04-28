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

const MODULE_WIDTH = 50;
const RAIL_PADDING = 20;

// 📏 Координаты проводов
const Y_PHASE_CHAIN = 52;
const Y_PHASE_STUB_START = 55;
const Y_PHASE_STUB_HEIGHT = 10;
const Y_N_STUB_BOTTOM = 35;
const Y_N_STUB_HEIGHT = 10;
const Y_N_CHAIN_BOTTOM = 29;
const Y_PE_CHAIN_BOTTOM = 18;

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
  const usedWidth = usedModules * MODULE_WIDTH;

  // Центр каждого полюса каждого модуля — для стиков проводов
  const wireStubs: number[] = [];
  let currentX = 0;
  for (const item of items) {
    for (let p = 0; p < item.modules; p++) {
      wireStubs.push(currentX + p * MODULE_WIDTH + MODULE_WIDTH / 2);
    }
    currentX += item.modules * MODULE_WIDTH;
  }

  return (
    <div className="mb-8">
      {/* Заголовок рейки */}
      <div className="flex items-center gap-2 mb-2">
        <div className="px-2 py-0.5 bg-[#2962FF]/20 border border-[#2962FF] rounded text-xs text-[#2962FF] font-mono font-bold">
          РЕЙКА {railIndex + 1}
        </div>
        <div className="text-xs text-[#787B86]">
          {usedModules}/{modulesPerRail} модулей
        </div>
        <div className="flex-1 h-px bg-[#363A45]" />
      </div>

      {/* Контейнер рейки */}
      <div className="relative bg-gradient-to-b from-[#e8eaed] to-[#d0d3d8] rounded-lg p-5 border-2 border-[#90a4ae] shadow-inner overflow-hidden">
        {/* 🟤 Фазная шина (L) — коричневый провод сверху */}
        {usedModules > 0 && (
          <>
            {/* Горизонтальный коричневый провод */}
            <div
              className="absolute rounded-full"
              style={{
                top: `${Y_PHASE_CHAIN}px`,
                left: `${RAIL_PADDING}px`,
                width: `${usedWidth}px`,
                height: "4px",
                background:
                  "linear-gradient(to bottom, #A0522D 0%, #8B4513 50%, #5D2E0B 100%)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                zIndex: 3,
              }}
            />
            {/* Вертикальные стики от провода вниз к клеммам */}
            {wireStubs.map((x, idx) => (
              <div
                key={`phase-stub-${idx}`}
                className="absolute"
                style={{
                  top: `${Y_PHASE_STUB_START}px`,
                  left: `${RAIL_PADDING + x - 1.5}px`,
                  width: "3px",
                  height: `${Y_PHASE_STUB_HEIGHT}px`,
                  background:
                    "linear-gradient(to right, #6B3410, #8B4513, #6B3410)",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.3)",
                  zIndex: 3,
                }}
              />
            ))}
          </>
        )}

        {/* 🏗 Металлическая DIN-рейка за модулями */}
        <div
          className="absolute left-5 right-5 pointer-events-none rounded-sm shadow-inner"
          style={{
            top: "95px",
            height: "130px",
            background:
              "linear-gradient(to bottom, #9e9e9e 0%, #eeeeee 20%, #bdbdbd 50%, #757575 80%, #424242 100%)",
            zIndex: 0,
          }}
        />

        {/* ⚡ Модули (БЕЗ sublabel — униформная ширина!) */}
        <div
          className="relative flex items-start justify-start"
          style={{ zIndex: 1, minHeight: "220px" }}
        >
          {items.map((item) => {
            const match = item.label.match(/([A-D])?(\d+)/);
            const characteristic = (item.characteristic ||
              match?.[1] ||
              "C") as "B" | "C" | "D";
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
                type={itemType}
                sensitivity={item.sensitivity}
                rcdType={item.rcdType}
              />
            );
          })}

          {/* Резерв (пустые модули) */}
          {emptyModules > 0 && (
            <div
              className="h-[185px] border-2 border-dashed border-[#90a4ae] rounded flex items-center justify-center text-[#607d8b] text-xs bg-white/40"
              style={{
                width: `${emptyModules * MODULE_WIDTH}px`,
                minWidth: `${emptyModules * MODULE_WIDTH}px`,
                marginTop: "33px",
              }}
            >
              <div className="text-center">
                <div className="text-3xl mb-1 opacity-50">🔋</div>
                <div className="font-semibold">Резерв</div>
                <div className="font-mono text-[#37474F]">
                  {emptyModules} мод.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🔵 N-шина (синий провод снизу) */}
        {usedModules > 0 && (
          <>
            {/* Вертикальные стики от модулей вниз к N-шине */}
            {wireStubs.map((x, idx) => (
              <div
                key={`n-stub-${idx}`}
                className="absolute"
                style={{
                  bottom: `${Y_N_STUB_BOTTOM}px`,
                  left: `${RAIL_PADDING + x - 1.5}px`,
                  width: "3px",
                  height: `${Y_N_STUB_HEIGHT}px`,
                  background:
                    "linear-gradient(to right, #0D47A1, #1976D2, #0D47A1)",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.3)",
                  zIndex: 3,
                }}
              />
            ))}
            {/* Горизонтальная синяя N-шина */}
            <div
              className="absolute rounded-full"
              style={{
                bottom: `${Y_N_CHAIN_BOTTOM}px`,
                left: `${RAIL_PADDING}px`,
                width: `${usedWidth}px`,
                height: "4px",
                background:
                  "linear-gradient(to bottom, #42A5F5 0%, #1976D2 50%, #0D47A1 100%)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                zIndex: 3,
              }}
            />
          </>
        )}

        {/* 🟡🟢 PE-шина (зелёно-жёлтая полосатая — земля) */}
        {usedModules > 0 && (
          <div
            className="absolute rounded-full"
            style={{
              bottom: `${Y_PE_CHAIN_BOTTOM}px`,
              left: `${RAIL_PADDING}px`,
              width: `${usedWidth}px`,
              height: "3px",
              background:
                "repeating-linear-gradient(90deg, #FFD54F 0px, #FFD54F 5px, #4CAF50 5px, #4CAF50 10px)",
              boxShadow: "0 1px 1px rgba(0,0,0,0.3)",
              zIndex: 3,
            }}
          />
        )}
      </div>
    </div>
  );
}



