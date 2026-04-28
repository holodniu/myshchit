import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cable } from "lucide-react";
import PriceEditor from "@/components/admin/PriceEditor";
import ActiveToggle from "@/components/admin/ActiveToggle";

export default async function AdminCablesPage() {
  const cables = await prisma.cable.findMany({
    orderBy: [{ brand: { name: "asc" } }, { section: "asc" }],
    include: {
      brand: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
          <Cable className="w-8 h-8 text-[#FF9800]" />
          Кабели
        </h1>
        <p className="text-[#787B86] mt-1">Всего: {cables.length} моделей</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Каталог кабелей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#363A45] text-left">
                  <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                    Бренд
                  </th>
                  <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs">
                    Модель
                  </th>
                  <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                    Жил × Сечение
                  </th>
                  <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                    Макс. ток
                  </th>
                  <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-right">
                    Цена за метр
                  </th>
                  <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                    Активен
                  </th>
                </tr>
              </thead>
              <tbody>
                {cables.map((cable) => (
                  <tr
                    key={cable.id}
                    className="border-b border-[#2A2E39] hover:bg-[#1E222D]/60"
                  >
                    <td className="py-2 px-2 text-[#D1D4DC]">
                      {cable.brand.name}
                    </td>
                    <td className="py-2 px-2 font-mono text-xs text-[#787B86]">
                      {cable.model}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="inline-block px-2 py-0.5 bg-[#FF9800]/20 text-[#FF9800] rounded font-mono text-xs font-bold">
                        {cable.cores}×{cable.section} мм²
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-[#D1D4DC] font-mono">
                      {cable.maxCurrent}A
                    </td>
                    <td className="py-2 px-2 text-right">
                      <PriceEditor
                        id={cable.id}
                        price={cable.pricePerMeter || 0}
                        type="cable"
                        unit="₽/м"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <ActiveToggle
                        id={cable.id}
                        isActive={cable.isActive}
                        type="cable"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
