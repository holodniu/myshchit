"use client";

import type { PanelItem } from "@/lib/calculator/panel-layout";

export default function DinModule({ item }: { item: PanelItem }) {
  const width = item.modules * 40; // 40px на 1 модуль

  return (
    <div
      className="relative h-24 rounded-sm flex flex-col items-center justify-center text-white shadow-md cursor-grab active:cursor-grabbing select-none transition-all hover:brightness-110"
      style={{
        width: `${width}px`,
        backgroundColor: item.color,
        minWidth: `${width}px`,
      }}
    >
      {/* Верхняя полоска (имитация клавиши автомата) */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-black/20 rounded-t-sm" />

      {/* Тип */}
      <div className="absolute top-3 right-1 text-[8px] opacity-70 uppercase">
        {item.type === "INPUT" && "IN"}
        {item.type === "RCD" && "УЗО"}
        {item.type === "BREAKER" && "АВТ"}
      </div>

      {/* Основная надпись */}
      <div className="text-sm font-bold mt-2 font-mono">{item.label}</div>

      {/* Подпись */}
      {item.sublabel && (
        <div className="text-[10px] opacity-80 font-mono">{item.sublabel}</div>
      )}

      {/* Индикатор модулей */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
        {Array.from({ length: item.modules }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-black/30 rounded-full" />
        ))}
      </div>

      {/* Нижняя полоска */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20 rounded-b-sm" />
    </div>
  );
}
