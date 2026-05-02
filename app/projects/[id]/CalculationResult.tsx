"use client";

import { useState, useTransition } from "react";
import { calculateProject } from "@/app/constructor/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import type { CalculationResult } from "@/lib/calculator/calculator";
import PanelVisualization from "@/components/panel/PanelVisualization";
import PanelCost from "@/components/panel/PanelCost";
import ConnectionTable from "@/components/panel/ConnectionTable";


export default function CalculationResultPanel({
  projectId,
  initialResult,
}: {
  projectId: string;
  initialResult: CalculationResult | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<CalculationResult | null>(initialResult);
  const [error, setError] = useState<string | null>(null);

  // 🎯 Состояние бренда — единое для визуализации и цены
  const [brand, setBrand] = useState<string>("abb");


  const handleCalculate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await calculateProject(projectId);
        setResult(res.result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Ошибка расчёта";
        setError(msg);
      }
    });
  };

  if (!result) {
    return (
      <Card className="bg-[#2962FF]/10 border-[#2962FF]/30">
        <CardContent className="py-10 text-center">
          <Calculator className="w-16 h-16 mx-auto mb-4 text-[#2962FF]" />
          <h3 className="text-2xl font-bold text-[#D1D4DC] mb-2">
            Проект готов к расчёту
          </h3>
          <p className="text-[#787B86] mb-6">
            Нажмите кнопку ниже — подберём автоматы, УЗО, кабели и соберём щит
          </p>
          {error && (
            <div className="mb-4 p-3 bg-[#EF5350]/10 border border-[#EF5350]/30 rounded-md text-[#EF5350] text-sm">
              {error}
            </div>
          )}
          <Button
            onClick={handleCalculate}
            disabled={isPending}
            size="lg"
            className="bg-[#2962FF] hover:bg-[#1E53E5]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Считаем...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" /> Рассчитать щит
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Предупреждения */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((w, i) => (
            <div
              key={i}
              className="p-3 bg-[#FF9800]/10 border border-[#FF9800]/30 rounded-md text-[#FF9800] text-sm flex gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Сводка */}
      <Card className="bg-[#26A69A]/10 border-[#26A69A]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#26A69A]" />
            Расчёт выполнен
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat
              label="Общая мощность"
              value={`${(result.totalPower / 1000).toFixed(2)} кВт`}
              color="text-[#D1D4DC]"
            />
            <Stat
              label={`× коэфф. ${result.simultaneityFactor}`}
              value={`${(result.calculatedPower / 1000).toFixed(2)} кВт`}
              color="text-[#FF9800]"
            />
            <Stat
              label="Вводной ток"
              value={`${result.inputCurrent.toFixed(1)} А`}
              color="text-[#2962FF]"
            />
            <Stat
              label="Вводной автомат"
              value={`${result.inputBreaker.current} А / ${result.inputBreaker.poles}P`}
              color="text-[#26A69A]"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-[#363A45] text-sm text-[#787B86]">
            {result.lines.length} линий в щите
          </div>
        </CardContent>
      </Card>

      {/* ⚖️ Баланс фаз — только для 3-фазных проектов */}
      {result.phaseBalance && (
        <PhaseBalanceView balance={result.phaseBalance} />
      )}

      {/* Список линий (список) */}
      <div>
        <h3 className="text-2xl font-bold text-[#D1D4DC] mb-4">
          Линии щита ({result.lines.length})
        </h3>
        <div className="space-y-3">
          {result.lines.map((line, idx) => (
            <LineCard key={idx} line={line} index={idx + 1} />
          ))}
        </div>
      </div>

      {/* 🔌 Таблица соединений */}
      <ConnectionTable result={result} />

      {/* 🎨 Состав щита */}
      <div>
        <h3 className="text-2xl font-bold text-[#D1D4DC] mb-4">Состав щита</h3>
        <PanelVisualization result={result} brand={brand} />
      </div>

      {/* 💰 Стоимость — меняет бренд через onBrandChange */}
      <PanelCost result={result} brand={brand} onBrandChange={setBrand} />

      <Button
        variant="outline"
        onClick={handleCalculate}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Пересчитываем...
          </>
        ) : (
          <>🔄 Пересчитать</>
        )}
      </Button>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="text-xs text-[#787B86] mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function LineCard({
  line,
  index,
}: {
  line: CalculationResult["lines"][0];
  index: number;
}) {
  const typeColors: Record<string, string> = {
    LIGHTING: "#FFD54F",
    SOCKETS: "#2962FF",
    DEDICATED: "#EF5350",
    MIXED: "#26A69A",
  };

  const typeLabel: Record<string, string> = {
    LIGHTING: "Свет",
    SOCKETS: "Розетки",
    DEDICATED: "Отдельная",
    MIXED: "Смешанная",
  };

  const color = typeColors[line.lineType];

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-1 shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#787B86]">#{index}</span>
                <span
                  className="px-2 py-0.5 text-xs rounded-full font-semibold"
                  style={{ backgroundColor: `${color}20`, color: color }}
                >
                  {typeLabel[line.lineType]}
                </span>
                {line.phase && (
                  <span
                    className="px-2 py-0.5 text-xs rounded-full font-bold"
                    style={{
                      backgroundColor:
                        line.phase === "L1"
                          ? "#FFD54F20"
                          : line.phase === "L2"
                          ? "#26A69A20"
                          : "#EF535020",
                      color:
                        line.phase === "L1"
                          ? "#FFD54F"
                          : line.phase === "L2"
                          ? "#26A69A"
                          : "#EF5350",
                    }}
                  >
                    {line.phase}
                  </span>
                )}
              </div>
              <h4 className="text-lg font-bold text-[#D1D4DC] mt-1">
                {line.name}
              </h4>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#787B86]">
                {(line.totalPower / 1000).toFixed(2)} кВт
              </div>
              <div className="text-2xl font-bold text-[#FF9800]">
                {line.calculatedCurrent.toFixed(1)} А
              </div>
            </div>
          </div>

          {/* 🆕 Индикатор загрузки автомата */}
          <LoadIndicator current={line.calculatedCurrent} breakerCurrent={line.breaker.current} />

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#363A45]">
            <Equipment
              icon="⚡"
              title="Автомат"
              value={`${line.breaker.characteristic}${line.breaker.current}`}
              sub={`${line.breaker.poles}P${line.characteristicReason ? " · " + line.characteristicReason : ""}`}
              color="#2962FF"
            />
            {line.rcd ? (
              <Equipment
                icon="🛡️"
                title="УЗО"
                value={`${line.rcd.current}A / ${line.rcd.sensitivity}мА`}
                sub={`тип ${line.rcd.type}`}
                color="#26A69A"
              />
            ) : (
              <Equipment
                icon="—"
                title="УЗО"
                value="Не требуется"
                sub=""
                color="#50535E"
              />
            )}
            <Equipment
              icon="🔌"
              title="Кабель"
              value={`${line.cable.cores}×${line.cable.section}`}
              sub={`до ${line.cable.maxCurrent} А`}
              color="#FF9800"
            />
          </div>

          <div className="mt-3 pt-3 border-t border-[#363A45] text-xs text-[#787B86]">
            Потребители: {line.consumers.map((c) => c.name).join(", ")}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PhaseBalanceView({
  balance,
}: {
  balance: NonNullable<CalculationResult["phaseBalance"]>;
}) {
  const phaseColors: Record<string, { bg: string; text: string; border: string }> = {
    L1: { bg: "bg-[#FFD54F]/10", text: "text-[#FFD54F]", border: "border-[#FFD54F]/30" },
    L2: { bg: "bg-[#26A69A]/10", text: "text-[#26A69A]", border: "border-[#26A69A]/30" },
    L3: { bg: "bg-[#EF5350]/10", text: "text-[#EF5350]", border: "border-[#EF5350]/30" },
  };

  const avgPower =
    (balance.L1.power + balance.L2.power + balance.L3.power) / 3;

  const isBalanced = balance.imbalance <= 15;

  return (
    <Card className={`${isBalanced ? "bg-[#26A69A]/5" : "bg-[#FF9800]/5"} border-[#363A45]`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5 text-[#2962FF]" />
          Баланс нагрузки по фазам
          <span
            className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              isBalanced
                ? "bg-[#26A69A]/20 text-[#26A69A]"
                : "bg-[#FF9800]/20 text-[#FF9800]"
            }`}
          >
            {isBalanced ? "✓ Сбалансировано" : `⚠ Разбаланс ${balance.imbalance}%`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {(["L1", "L2", "L3"] as const).map((phase) => {
            const data = balance[phase as "L1" | "L2" | "L3"];
            const pct = avgPower > 0 ? (data.power / avgPower) * 100 : 0;
            const colors = phaseColors[phase];

            return (
              <div
                key={phase}
                className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className={`text-lg font-bold ${colors.text}`}>{phase}</div>
                <div className="text-sm text-[#D1D4DC] mt-1">
                  {(data.power / 1000).toFixed(2)} кВт
                </div>
                <div className="text-xs text-[#787B86]">
                  {data.current.toFixed(1)} А · {data.lines} линий
                </div>
                <div className="mt-2 h-1.5 bg-[#131722] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor:
                        phase === "L1"
                          ? "#FFD54F"
                          : phase === "L2"
                          ? "#26A69A"
                          : "#EF5350",
                    }}
                  />
                </div>
                <div className="text-xs text-[#50535E] mt-1 text-right">
                  {pct.toFixed(0)}% от среднего
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadIndicator({
  current,
  breakerCurrent,
}: {
  current: number;
  breakerCurrent: number;
}) {
  const percent = (current / breakerCurrent) * 100;
  let color = "#26A69A"; // зелёный — норма
  let label = "Норма";

  if (percent > 100) {
    color = "#EF5350"; // красный — перегруз
    label = "⚠️ Перегруз!";
  } else if (percent > 80) {
    color = "#FF9800"; // оранжевый — близко к лимиту
    label = "Высокая загрузка";
  }

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[#787B86]">Загрузка автомата</span>
        <span style={{ color }} className="font-semibold">
          {label} — {percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 bg-[#131722] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function Equipment({
  icon,
  title,
  value,
  sub,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div>
      <div className="text-xs text-[#787B86] mb-1">
        {icon} {title}
      </div>
      <div className="text-base font-bold" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-xs text-[#50535E]">{sub}</div>}
    </div>
  );
}

