import type { CalculationResult } from "./calculator";

// ═══════════════════════════════════════════════════
// 📐 ТИПЫ
// ═══════════════════════════════════════════════════

export type PanelItem = {
  id: string;
  type: "INPUT" | "RCD" | "BREAKER" | "EMPTY";
  modules: number;
  color: string;
  label: string;
  sublabel?: string;
  lineIndex?: number;
  qfLabel?: string;
  brand?: string;
  characteristic?: "B" | "C" | "D";
  sensitivity?: number;
  rcdType?: "AC" | "A" | "B";
};

export type PanelGroup = {
  id: string;
  title: string;
  color: string;
  items: PanelItem[];
};

export type PanelLayout = {
  groups: PanelGroup[];
  totalModules: number;
  recommendedEnclosure: EnclosureSize;
  reserveModules: number;
  brand: string;
};

export type EnclosureSize = {
  modules: number;
  name: string;
  rails: number;
  modulesPerRail: number;
};

// ═══════════════════════════════════════════════════
// 🏭 СПРАВОЧНИК БРЕНДОВ (slug → display name)
// ═══════════════════════════════════════════════════

export const BRAND_DISPLAY_NAMES: Record<string, string> = {
  iek: "IEK",
  ekf: "EKF",
  dekraft: "DEKraft",
  schneider: "Schneider Electric",
  abb: "ABB",
  legrand: "Legrand",
  dkc: "DKC",
};

export function getBrandDisplayName(slug: string): string {
  return BRAND_DISPLAY_NAMES[slug.toLowerCase()] || "ABB";
}

// ═══════════════════════════════════════════════════
// 📦 КОРПУСА
// ═══════════════════════════════════════════════════

const ENCLOSURES: EnclosureSize[] = [
  { modules: 12, name: "ЩРН-12", rails: 1, modulesPerRail: 12 },
  { modules: 24, name: "ЩРН-24", rails: 2, modulesPerRail: 12 },
  { modules: 36, name: "ЩРН-36", rails: 3, modulesPerRail: 12 },
  { modules: 48, name: "ЩРН-48", rails: 4, modulesPerRail: 12 },
  { modules: 72, name: "ЩРН-72", rails: 6, modulesPerRail: 12 },
  { modules: 96, name: "ЩРН-96", rails: 8, modulesPerRail: 12 },
];

// ═══════════════════════════════════════════════════
// 🏗 ПОСТРОЕНИЕ СХЕМЫ ЩИТА
// ═══════════════════════════════════════════════════

/**
 * Собирает схему щита для ОДНОГО выбранного бренда
 * @param result - результат расчёта
 * @param brandSlug - выбранный бренд ("abb", "iek", "schneider"...)
 */
export function buildPanelLayout(
  result: CalculationResult,
  brandSlug: string = "abb"
): PanelLayout {
  const groups: PanelGroup[] = [];

  const typeColors: Record<string, string> = {
    LIGHTING: "#FFD54F",
    SOCKETS: "#2962FF",
    DEDICATED: "#EF5350",
    MIXED: "#26A69A",
  };

  // 🎯 ОДИН бренд на весь щит — как в реальной жизни
  const panelBrand = getBrandDisplayName(brandSlug);

  // Счётчики для QF/QD
  let qfCounter = 0;
  let qdCounter = 0;

  // 1️⃣ Вводной автомат
  qfCounter++;
  groups.push({
    id: "input",
    title: "Вводной автомат",
    color: "#26A69A",
    items: [
      {
        id: "input-breaker",
        type: "INPUT",
        modules: result.inputBreaker.poles,
        color: "#26A69A",
        label: `C${result.inputBreaker.current}`,
        sublabel: "Ввод",
        qfLabel: `QF${qfCounter}`,
        brand: panelBrand,
        characteristic: "C",
      },
    ],
  });

  // 2️⃣ Линии
  result.lines.forEach((line, idx) => {
    const color = typeColors[line.lineType];
    const items: PanelItem[] = [];

    // УЗО
    if (line.rcd) {
      qdCounter++;
      items.push({
        id: `rcd-${idx}`,
        type: "RCD",
        modules: line.rcd.poles,
        color: "#26A69A",
        label: `${line.rcd.current}A`,
        sublabel: `УЗО ${line.rcd.sensitivity}мА`,
        lineIndex: idx,
        qfLabel: `QD${qdCounter}`,
        brand: panelBrand, // 🎯 тот же бренд
        sensitivity: line.rcd.sensitivity,
        rcdType: line.rcd.type,
      });
    }

    // Автомат
    qfCounter++;
    items.push({
      id: `breaker-${idx}`,
      type: "BREAKER",
      modules: line.breaker.poles,
      color,
      label: `${line.breaker.characteristic}${line.breaker.current}`,
      sublabel: line.name,
      lineIndex: idx,
      qfLabel: `QF${qfCounter}`,
      brand: panelBrand, // 🎯 тот же бренд
      characteristic: line.breaker.characteristic,
    });

    groups.push({
      id: `line-${idx}`,
      title: `Линия ${idx + 1}: ${line.name}`,
      color,
      items,
    });
  });

  const totalModules = groups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.modules, 0),
    0
  );

  const requiredModules = Math.ceil(totalModules * 1.25);
  const recommendedEnclosure =
    ENCLOSURES.find((e) => e.modules >= requiredModules) ||
    ENCLOSURES[ENCLOSURES.length - 1];

  const reserveModules = recommendedEnclosure.modules - totalModules;

  return {
    groups,
    totalModules,
    recommendedEnclosure,
    reserveModules,
    brand: panelBrand,
  };
}

// ═══════════════════════════════════════════════════
// 📏 РАСПРЕДЕЛЕНИЕ ПО РЕЙКАМ
// ═══════════════════════════════════════════════════

export function distributeOnRails(
  items: PanelItem[],
  modulesPerRail: number
): PanelItem[][] {
  const rails: PanelItem[][] = [[]];
  let currentRail = 0;
  let currentWidth = 0;

  for (const item of items) {
    if (currentWidth + item.modules > modulesPerRail) {
      rails.push([]);
      currentRail++;
      currentWidth = 0;
    }
    rails[currentRail].push(item);
    currentWidth += item.modules;
  }

  return rails;
}

