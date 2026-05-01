import { PrismaClient, PriceClass, Characteristic, RcdType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Заполняем базу данных...");

  // Удаляем старые данные (на случай повторного запуска)
  await prisma.cable.deleteMany();
  await prisma.rcd.deleteMany();
  await prisma.breaker.deleteMany();
  await prisma.brand.deleteMany();

  // ═══════════════════════════════════════════════
  // 🏭 БРЕНДЫ
  // ═══════════════════════════════════════════════
  const abb = await prisma.brand.create({
    data: {
      name: "ABB",
      slug: "abb",
      country: "Швейцария",
      priceClass: PriceClass.PREMIUM,
      description: "Премиум-бренд, лидер промышленной автоматики",
    },
  });

  const schneider = await prisma.brand.create({
    data: {
      name: "Schneider Electric",
      slug: "schneider",
      country: "Франция",
      priceClass: PriceClass.PREMIUM,
      description: "Мировой лидер энергоменеджмента",
    },
  });

  await prisma.brand.create({
    data: {
      name: "Legrand",
      slug: "legrand",
      country: "Франция",
      priceClass: PriceClass.PREMIUM,
    },
  });

  const iek = await prisma.brand.create({
    data: {
      name: "IEK",
      slug: "iek",
      country: "Россия",
      priceClass: PriceClass.BUDGET,
      description: "Крупнейший российский производитель",
    },
  });

  const ekf = await prisma.brand.create({
    data: {
      name: "EKF",
      slug: "ekf",
      country: "Россия",
      priceClass: PriceClass.BUDGET,
    },
  });

  await prisma.brand.create({
    data: {
      name: "DEKraft",
      slug: "dekraft",
      country: "Россия",
      priceClass: PriceClass.MID,
    },
  });

  console.log("✅ 6 брендов добавлено");

  // ═══════════════════════════════════════════════
  // ⚡ АВТОМАТЫ — стандартный ряд
  // ═══════════════════════════════════════════════
  const standardCurrents = [6, 10, 16, 20, 25, 32, 40, 50, 63];

  // ABB серия S200 (премиум)
  for (const current of standardCurrents) {
    await prisma.breaker.create({
      data: {
        brandId: abb.id,
        series: "S200",
        model: `S201-C${current}`,
        sku: `2CDS251001R00${String(current).padStart(2, "0")}`,
        current,
        characteristic: Characteristic.C,
        poles: 1,
        breakingCapacity: 6000,
        priceRub: 350 + current * 8,
      },
    });
  }

  // Schneider Easy9 (премиум)
  for (const current of standardCurrents) {
    await prisma.breaker.create({
      data: {
        brandId: schneider.id,
        series: "Easy9",
        model: `EZ9F34${String(current).padStart(3, "0")}`,
        current,
        characteristic: Characteristic.C,
        poles: 1,
        breakingCapacity: 4500,
        priceRub: 280 + current * 7,
      },
    });
  }

  // IEK ВА47-29 (бюджет)
  for (const current of standardCurrents) {
    await prisma.breaker.create({
      data: {
        brandId: iek.id,
        series: "ВА47-29",
        model: `MVA20-1-0${String(current).padStart(2, "0")}-C`,
        current,
        characteristic: Characteristic.C,
        poles: 1,
        breakingCapacity: 4500,
        priceRub: 110 + current * 3,
      },
    });
  }

  // EKF ВА47-29 (бюджет)
  for (const current of standardCurrents) {
    await prisma.breaker.create({
      data: {
        brandId: ekf.id,
        series: "ВА47-29",
        model: `mcb4729-1-${String(current).padStart(2, "0")}C`,
        current,
        characteristic: Characteristic.C,
        poles: 1,
        breakingCapacity: 4500,
        priceRub: 100 + current * 3,
      },
    });
  }

  console.log("✅ Автоматы добавлены (4 бренда × 9 номиналов = 36 моделей)");

  // ═══════════════════════════════════════════════
  // 🛡️ УЗО
  // ═══════════════════════════════════════════════
  const rcdCurrents = [25, 40, 63];
  const sensitivities = [10, 30, 100];

  for (const current of rcdCurrents) {
    for (const sensitivity of sensitivities) {
      await prisma.rcd.create({
        data: {
          brandId: abb.id,
          series: "F200",
          model: `F202-${current}/0.0${sensitivity === 10 ? "1" : sensitivity === 30 ? "3" : "1"}`,
          current,
          sensitivity,
          poles: 2,
          type: RcdType.AC,
          priceRub: 1800 + current * 20,
        },
      });

      await prisma.rcd.create({
        data: {
          brandId: iek.id,
          series: "ВД1-63",
          model: `MDV10-2-0${current}-030`,
          current,
          sensitivity,
          poles: 2,
          type: RcdType.AC,
          priceRub: 700 + current * 10,
        },
      });
    }
  }

  console.log("✅ УЗО добавлены");

  // ═══════════════════════════════════════════════
  // 🔌 КАБЕЛИ
  // ═══════════════════════════════════════════════
  const cableVariants = [
    { section: 1.5, maxCurrent: 19, priceBase: 45 },
    { section: 2.5, maxCurrent: 27, priceBase: 70 },
    { section: 4, maxCurrent: 38, priceBase: 110 },
    { section: 6, maxCurrent: 46, priceBase: 160 },
    { section: 10, maxCurrent: 70, priceBase: 260 },
    { section: 16, maxCurrent: 85, priceBase: 410 },
  ];

  // ВВГнг(А)-LS — стандарт для квартир (3-жильный)
  for (const cable of cableVariants) {
    await prisma.cable.create({
      data: {
        brandId: iek.id,
        model: "ВВГнг(А)-LS",
        cores: 3,
        section: cable.section,
        maxCurrent: cable.maxCurrent,
        insulation: "ПВХ пониженной горючести",
        pricePerMeter: cable.priceBase,
      },
    });

    // 5-жильный для 3-фазных линий
    await prisma.cable.create({
      data: {
        brandId: iek.id,
        model: "ВВГнг(А)-LS",
        cores: 5,
        section: cable.section,
        maxCurrent: cable.maxCurrent,
        insulation: "ПВХ пониженной горючести",
        pricePerMeter: cable.priceBase * 1.6,
      },
    });
  }

  console.log("✅ Кабели добавлены");
  console.log("🎉 База данных заполнена!");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });