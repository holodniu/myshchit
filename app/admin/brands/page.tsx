import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory } from "lucide-react";
import BrandEditor from "./BrandEditor";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { breakers: true, rcds: true, cables: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
          <Factory className="w-8 h-8 text-[#FF9800]" />
          Бренды
        </h1>
        <p className="text-[#787B86] mt-1">
          {brands.length} брендов · Управление производителями
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Каталог брендов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {brands.map((brand) => (
              <BrandEditor
                key={brand.id}
                brand={{
                  id: brand.id,
                  name: brand.name,
                  country: brand.country || "",
                  description: brand.description || "",
                  priceClass: brand.priceClass,
                  website: brand.website || "",
                }}
                counts={{
                  breakers: brand._count.breakers,
                  rcds: brand._count.rcds,
                  cables: brand._count.cables,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#2962FF]/10 border-[#2962FF]/30">
        <CardContent className="p-4 text-sm text-[#787B86]">
          💡 <strong className="text-[#D1D4DC]">Подсказка:</strong> Пока добавление
          новых брендов делается через Prisma Studio или seed-скрипт. Форму добавления
          добавим позже, когда будет понятно, какие именно бренды нужны.
        </CardContent>
      </Card>
    </div>
  );
}
