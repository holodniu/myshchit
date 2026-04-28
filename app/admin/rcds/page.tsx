import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import PriceEditor from "@/components/admin/PriceEditor";
import ActiveToggle from "@/components/admin/ActiveToggle";

export default async function AdminRcdsPage() {
  const rcds = await prisma.rcd.findMany({
    orderBy: [{ brand: { name: "asc" } }, { current: "asc" }],
    include: {
      brand: { select: { name: true } },
    },
  });

  const byBrand = rcds.reduce((acc, r) => {
    const key = r.brand.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, typeof rcds>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
          <Shield className="w-8 h-8 text-[#26A69A]" />
          УЗО
        </h1>
        <p className="text-[#787B86] mt-1">
          Всего: {rcds.length} моделей от {Object.keys(byBrand).length} брендов
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
                      Серия / Модель
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Ток
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Чувствительность
                    </th>
                    <th className="py-2 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Тип
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
                  {items.map((rcd) => (
                    <tr
                      key={rcd.id}
                      className="border-b border-[#2A2E39] hover:bg-[#1E222D]/60"
                    >
                      <td className="py-2 px-2">
                        <div className="text-[#D1D4DC]">{rcd.series}</div>
                        <div className="text-xs text-[#787B86] font-mono">
                          {rcd.model}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 bg-[#26A69A]/20 text-[#26A69A] rounded font-mono text-xs font-bold">
                          {rcd.current}A
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-[#FF9800] font-mono">
                        {rcd.sensitivity}мА
                      </td>
                      <td className="py-2 px-2 text-center text-[#D1D4DC] font-mono">
                        {rcd.type}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <PriceEditor
                          id={rcd.id}
                          price={rcd.priceRub || 0}
                          type="rcd"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <ActiveToggle
                          id={rcd.id}
                          isActive={rcd.isActive}
                          type="rcd"
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
