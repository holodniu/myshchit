"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug } from "lucide-react";
import type { CalculationResult } from "@/lib/calculator/calculator";

export default function ConnectionTable({
  result,
}: {
  result: CalculationResult;
}) {
  const rows: {
    from: string;
    to: string;
    wires: string;
    section: string;
    color: string;
  }[] = [];

  // Ввод → каждая линия
  result.lines.forEach((line, idx) => {
    const qfNum = idx + 1;
    const hasRcd = !!line.rcd;

    // Ввод → УЗО (если есть)
    if (hasRcd) {
      rows.push({
        from: `Вводной автомат (${result.inputBreaker.current}A)`,
        to: `УЗО QD${qfNum} (${line.rcd!.current}A / ${line.rcd!.sensitivity}мА)`,
        wires: line.breaker.poles === 3 ? "L1, L2, L3, N, PE" : "L, N, PE",
        section: `${line.cable.section} мм²`,
        color: "#26A69A",
      });
      rows.push({
        from: `УЗО QD${qfNum}`,
        to: `Автомат QF${qfNum} (${line.breaker.characteristic}${line.breaker.current}A)`,
        wires: line.breaker.poles === 3 ? "L1, L2, L3, N" : "L, N",
        section: `${line.cable.section} мм²`,
        color: "#2962FF",
      });
    } else {
      rows.push({
        from: `Вводной автомат (${result.inputBreaker.current}A)`,
        to: `Автомат QF${qfNum} (${line.breaker.characteristic}${line.breaker.current}A)`,
        wires: line.breaker.poles === 3 ? "L1, L2, L3, N, PE" : "L, N, PE",
        section: `${line.cable.section} мм²`,
        color: "#2962FF",
      });
    }

    // Автомат → потребитель
    const phaseStr = line.phase ? line.phase : line.voltage === 380 ? "L1-L2-L3" : "L";
    const consumerNames = line.consumers.map((c) => c.name).join(", ");
    rows.push({
      from: `Автомат QF${qfNum}`,
      to: consumerNames,
      wires: line.phase
        ? `${phaseStr}, N, PE`
        : line.breaker.poles === 3
        ? "L1, L2, L3, N, PE"
        : "L, N, PE",
      section: `${line.cable.cores}×${line.cable.section} мм²`,
      color: "#FF9800",
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plug className="w-5 h-5 text-[#2962FF]" />
          Таблица соединений
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#363A45]">
                <th className="text-left py-2 px-3 text-[#787B86] font-medium">От</th>
                <th className="text-left py-2 px-3 text-[#787B86] font-medium">К</th>
                <th className="text-left py-2 px-3 text-[#787B86] font-medium">Жилы</th>
                <th className="text-left py-2 px-3 text-[#787B86] font-medium">Сечение</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[#363A45]/50 hover:bg-[#1E222D]/50">
                  <td className="py-2 px-3 text-[#D1D4DC]">{row.from}</td>
                  <td className="py-2 px-3 text-[#D1D4DC]">{row.to}</td>
                  <td className="py-2 px-3">
                    <span className="text-xs font-mono" style={{ color: row.color }}>
                      {row.wires}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#787B86]">{row.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
