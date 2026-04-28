"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import type { PanelGroup, PanelItem } from "@/lib/calculator/panel-layout";

type EnrichedItem = PanelItem & {
  qfLabel?: string;
  brand?: string;
  sensitivity?: number;
  rcdType?: "AC" | "A" | "B";
  groupTitle: string;
};

export default function PanelSpecification({
  groups,
}: {
  groups: PanelGroup[];
}) {
  // Собираем все элементы с описанием их группы
  const allItems: EnrichedItem[] = groups.flatMap((g) =>
    g.items.map((item) => ({
      ...item,
      groupTitle: g.title,
    }))
  );

  // Сортировка как в щите: Input → УЗО (по чувствительности) → Автоматы (по току DESC)
  const inputs = allItems.filter((i) => i.type === "INPUT");
  const uzos = allItems
    .filter((i) => i.type === "RCD")
    .sort((a, b) => (a.sensitivity || 99) - (b.sensitivity || 99));
  const breakers = allItems
    .filter((i) => i.type === "BREAKER" && i.type !== inputs[0]?.type)
    .filter((i) => !inputs.includes(i))
    .sort((a, b) => {
      const extractCurrent = (label: string) => {
        const match = label.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      return extractCurrent(b.label) - extractCurrent(a.label);
    });

  const orderedItems = [...inputs, ...uzos, ...breakers];

  // Формирование читаемого описания
  const formatRating = (item: EnrichedItem): string => {
    if (item.type === "RCD") {
      return `${item.label} / ${item.sensitivity}мА${
        item.rcdType ? ` тип ${item.rcdType}` : ""
      }`;
    }
    return `${item.label}, ${item.modules}P`;
  };

  const formatPurpose = (item: EnrichedItem): string => {
    if (item.type === "INPUT") return "Ввод";
    if (item.type === "RCD") {
      return `УЗО ${item.sensitivity}мА`;
    }
    // Вырезаем префикс "Линия: " из названия группы
    return item.groupTitle.replace(/^Линия:\s*/i, "");
  };

  // Цвет метки QF/QD
  const getLabelColors = (type: string) => {
    switch (type) {
      case "INPUT":
        return "bg-[#26A69A]/20 border-[#26A69A] text-[#26A69A]";
      case "RCD":
        return "bg-[#FF9800]/20 border-[#FF9800] text-[#FF9800]";
      default:
        return "bg-[#FFEB3B]/20 border-[#F9A825] text-[#F9A825]";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-[#2962FF]" />
          <h3 className="text-xl font-bold text-[#D1D4DC]">
            Спецификация щита
          </h3>
          <div className="ml-auto text-sm text-[#787B86]">
            {orderedItems.length} позиций
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#363A45]">
                <th className="text-left py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                  Поз.
                </th>
                <th className="text-left py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                  Номинал
                </th>
                <th className="text-left py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                  Бренд / Модель
                </th>
                <th className="text-left py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                  Назначение
                </th>
                <th className="text-right py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                  Мод.
                </th>
              </tr>
            </thead>
            <tbody>
              {orderedItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#2A2E39] hover:bg-[#1E222D]/60 transition"
                >
                  <td className="py-2 px-2">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 border rounded text-xs font-mono font-bold min-w-[40px] ${getLabelColors(item.type)}`}
                    >
                      {item.qfLabel || "—"}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-mono text-[#D1D4DC]">
                    {formatRating(item)}
                  </td>
                  <td className="py-2 px-2 text-[#787B86]">
                    {item.brand || "—"}
                  </td>
                  <td className="py-2 px-2 text-[#D1D4DC]">
                    {formatPurpose(item)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-[#787B86]">
                    {item.modules}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-[#363A45] flex items-center justify-between text-xs text-[#787B86]">
          <div>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-[#26A69A]/40 border border-[#26A69A]" />
              Ввод
            </span>
            <span className="inline-flex items-center gap-1 ml-4">
              <span className="w-3 h-3 rounded-sm bg-[#FF9800]/40 border border-[#FF9800]" />
              УЗО / Дифавтомат
            </span>
            <span className="inline-flex items-center gap-1 ml-4">
              <span className="w-3 h-3 rounded-sm bg-[#FFEB3B]/40 border border-[#F9A825]" />
              Автоматический выключатель
            </span>
          </div>
          <div className="font-mono">
            Всего модулей:{" "}
            {orderedItems.reduce((sum, i) => sum + i.modules, 0)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
