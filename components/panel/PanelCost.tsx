"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Loader2 } from "lucide-react";
import { fetchPriceEstimate } from "@/app/constructor/actions";
import type { CalculationResult } from "@/lib/calculator/calculator";

export default function PanelCost({
  result,
  brand,
  onBrandChange,
}: {
  result: CalculationResult;
  brand: string;
  onBrandChange: (brand: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<{
    total: number;
    breakdown: {
      breakers: number;
      rcds: number;
      cables: number;
      enclosure: number;
    };
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPriceEstimate(result, brand)
      .then(setEstimate)
      .finally(() => setLoading(false));
  }, [brand, result]);

  return (
    <Card className="bg-gradient-to-br from-[#2962FF]/10 to-[#26A69A]/10 border-[#2962FF]/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#D1D4DC] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Стоимость оборудования
            </h3>
            <p className="text-sm text-[#787B86]">
              Выберите бренд — щит и цена обновятся автоматически
            </p>
          </div>

          <div className="w-56">
            <Select value={brand} onValueChange={onBrandChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iek">🇷🇺 IEK (бюджет)</SelectItem>
                <SelectItem value="ekf">🇷🇺 EKF (бюджет)</SelectItem>
                <SelectItem value="dekraft">🇷🇺 DEKraft (средний)</SelectItem>
                <SelectItem value="schneider">
                  🇫🇷 Schneider (премиум)
                </SelectItem>
                <SelectItem value="abb">🇨🇭 ABB (премиум)</SelectItem>
                <SelectItem value="legrand">🇫🇷 Legrand (премиум)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#787B86]" />
          </div>
        ) : estimate ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <CostItem
                icon="⚡"
                label="Автоматы"
                amount={estimate.breakdown.breakers}
              />
              <CostItem
                icon="🛡️"
                label="УЗО"
                amount={estimate.breakdown.rcds}
              />
              <CostItem
                icon="🔌"
                label="Кабель"
                amount={estimate.breakdown.cables}
              />
              <CostItem
                icon="📦"
                label="Корпус"
                amount={estimate.breakdown.enclosure}
              />
            </div>

            <div className="pt-4 border-t border-[#363A45] flex items-center justify-between">
              <span className="text-lg text-[#D1D4DC]">Итого:</span>
              <span className="text-3xl font-bold text-[#26A69A]">
                {estimate.total.toLocaleString("ru-RU")} ₽
              </span>
            </div>

            <div className="mt-3 text-xs text-[#787B86]">
              * Цена ориентировочная. Реальная стоимость зависит от поставщика.
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CostItem({
  icon,
  label,
  amount,
}: {
  icon: string;
  label: string;
  amount: number;
}) {
  return (
    <div className="bg-[#131722] border border-[#363A45] rounded-md p-3">
      <div className="text-xs text-[#787B86] mb-1">
        {icon} {label}
      </div>
      <div className="text-lg font-bold text-[#D1D4DC]">
        {amount.toLocaleString("ru-RU")} ₽
      </div>
    </div>
  );
}

