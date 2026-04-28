import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import PriceEditor from "@/components/admin/PriceEditor";
import ActiveToggle from "@/components/admin/ActiveToggle";

export default async function AdminBreakersPage() {
  const breakers = await prisma.breaker.findMany({
    orderBy: [{ brand: { name: "asc" } }, { current: "asc" }],
    include: {
      brand: { select: { name: true, priceClass: true } },
    },
  });

  // Группировка по брендам
  const byBrand = breakers.reduce((acc, b) => {
    const key = b.brand.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {} as Record<string, typeof breakers>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
          <Zap className="w-8 h-8 text-[#EF5350]" />
          Автоматические выключатели
        </h1>
        <p className="text-[#787B86] mt-1">
          Всего: {breakers.length} моделей от {Object.keys(byBrand).length} брендов
        </p>
      </div>

      {Object.entries(byBrand).map(([brandName, items]) => (
        <Card key={brandName}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{brandName}</span>
              <span className="text-sm font-normal text-[#787B86]">
                {items.length} моделей
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#363A45] text-left">
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Серия
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Модель
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Номинал
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Характер.
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Полюсов
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-right">
                      Цена
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Активен
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((breaker) => (
                    <tr
                      key={breaker.id}
                      className="border-b border-[#2A2E39] hover:bg-[#1E222D]/60"
                    >
                      <td className="py-2 px-2 text-[#D1D4DC]">
                        {breaker.series}
                      </td>
                      <td className="py-2 px-2 font-mono text-xs text-[#787B86]">
                        {breaker.model}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 bg-[#2962FF]/20 text-[#2962FF] rounded font-mono text-xs font-bold">
                          {breaker.current}A
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-[#D1D4DC] font-mono">
                        {breaker.characteristic}
                      </td>
                      <td className="py-2 px-2 text-center text-[#787B86]">
                        {breaker.poles}P
                      </td>
                      <td className="py-2 px-2 text-right">
                        <PriceEditor
                          id={breaker.id}
                          price={breaker.priceRub || 0}
                          type="breaker"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <ActiveToggle
                          id={breaker.id}
                          isActive={breaker.isActive}
                          type="breaker"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
