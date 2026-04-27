import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Это СЕРВЕРНЫЙ компонент — он выполняется на сервере Next.js
// и имеет прямой доступ к БД
export default async function BrandsPage() {
  // Запрос к БД через Prisma
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          breakers: true,
          rcds: true,
          cables: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-[#D1D4DC] mb-4 text-center">
            Бренды оборудования
          </h1>
          <p className="text-xl text-[#787B86] mb-12 text-center">
            {brands.length} брендов в каталоге
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="p-6 bg-[#1E222D] border border-[#363A45] rounded-lg hover:border-[#2962FF] transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[#D1D4DC]">
                      {brand.name}
                    </h3>
                    {brand.country && (
                      <p className="text-sm text-[#787B86]">{brand.country}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-md font-semibold ${
                      brand.priceClass === "PREMIUM"
                        ? "bg-[#FF9800]/20 text-[#FF9800]"
                        : brand.priceClass === "MID"
                        ? "bg-[#2962FF]/20 text-[#2962FF]"
                        : "bg-[#26A69A]/20 text-[#26A69A]"
                    }`}
                  >
                    {brand.priceClass === "PREMIUM"
                      ? "Премиум"
                      : brand.priceClass === "MID"
                      ? "Средний"
                      : "Бюджет"}
                  </span>
                </div>

                {brand.description && (
                  <p className="text-sm text-[#787B86] mb-4">
                    {brand.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#363A45]">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2962FF]">
                      {brand._count.breakers}
                    </div>
                    <div className="text-xs text-[#787B86]">Автоматов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#26A69A]">
                      {brand._count.rcds}
                    </div>
                    <div className="text-xs text-[#787B86]">УЗО</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF9800]">
                      {brand._count.cables}
                    </div>
                    <div className="text-xs text-[#787B86]">Кабелей</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}