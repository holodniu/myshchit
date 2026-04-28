import type { CalculationResult } from "./calculator";

// ═══════════════════════════════════════════════════
// 📐 ТИПЫ
// ═══════════════════════════════════════════════════

// Элемент на DIN-рейке
export type PanelItem = {
  id: string;
  type: "INPUT" | "RCD" | "BREAKER" | "EMPTY";
  modules: number;
  color: string;
  label: string;
  sublabel?: string;
  lineIndex?: number;
  // Дополнительные поля для реалистичной графики
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
};

export type EnclosureSize = {
  modules: number;
  name: string;
  rails: number;
  modulesPerRail: number;
};

// ═══════════════════════════════════════════════════
// 📦 СТАНДАРТНЫЕ КОРПУСА ЩИТОВ
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

export function buildPanelLayout(result: CalculationResult): PanelLayout {
  const groups: PanelGroup[] = [];

  // Цвета линий по типу
  const typeColors: Record<string, string> = {
    LIGHTING: "#FFD54F",
    SOCKETS: "#2962FF",
    DEDICATED: "#EF5350",
    MIXED: "#26A69A",
  };

  // Счётчики для QF/QD номеров
  let qfCounter = 0;
  let qdCounter = 0;

  // Чередование брендов для разнообразия
  const BRANDS_CYCLE = ["ABB", "Schneider Electric", "IEK"];
  const getBrandForLine = (index: number) =>
    BRANDS_CYCLE[index % BRANDS_CYCLE.length];

  // 1️⃣ Вводной автомат (всегда первый)
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
        brand: "ABB",
        characteristic: "C",
      },
    ],
  });

  // 2️⃣ Обрабатываем линии
  result.lines.forEach((line, idx) => {
    const color = typeColors[line.lineType];
    const lineBrand = getBrandForLine(idx);
    const items: PanelItem[] = [];

    // УЗО (если есть) — идёт ПЕРЕД автоматом
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
        brand: lineBrand,
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
      brand: lineBrand,
      characteristic: line.breaker.characteristic,
    });

    groups.push({
      id: `line-${idx}`,
      title: `Линия ${idx + 1}: ${line.name}`,
      color,
      items,
    });
  });

  // 3️⃣ Считаем общие модули и корпус
  const totalModules = groups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.modules, 0),
    0
  );

  // Подбираем корпус с запасом 25%
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
  };
}

// ═══════════════════════════════════════════════════
// 📏 РАСПРЕДЕЛЕНИЕ ПО DIN-РЕЙКАМ
// ═══════════════════════════════════════════════════

/**
 * Разбивает модули по DIN-рейкам с учётом вместимости
 * Не разрывает группы (УЗО + автомат остаются вместе)
 */
export function distributeOnRails(
  items: PanelItem[],
  modulesPerRail: number
): PanelItem[][] {
  const rails: PanelItem[][] = [[]];
  let currentRail = 0;
  let currentWidth = 0;

  for (const item of items) {
    // Если не влезает — новая рейка
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
