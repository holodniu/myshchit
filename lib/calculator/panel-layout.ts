import type { CalculationResult } from "./calculator";

// Элемент на DIN-рейке
export type PanelItem = {
  id: string;
  type: "INPUT" | "RCD" | "BREAKER" | "EMPTY";
  modules: number;
  color: string;
  label: string;
  sublabel?: string;
  lineIndex?: number;
  // 🆕 Новые поля
  qfLabel?: string;           // "QF1", "QD1", "KV1"
  brand?: string;             // "ABB", "Schneider", "IEK"
  characteristic?: "B" | "C" | "D";
  sensitivity?: number;       // для УЗО
  rcdType?: "AC" | "A" | "B"; // для УЗО
};

export type PanelGroup = {
  id: string;
  title: string;       // "Линия 1: Свет Кухня"
  color: string;
  items: PanelItem[];  // модули этой группы
};

export type PanelLayout = {
  groups: PanelGroup[];
  totalModules: number;
  recommendedEnclosure: EnclosureSize;
  reserveModules: number;
};

export type EnclosureSize = {
  modules: number;
  name: string;        // "ЩРН-36"
  rails: number;       // количество DIN-реек
  modulesPerRail: number;
};

// Стандартные корпуса
const ENCLOSURES: EnclosureSize[] = [
  { modules: 12, name: "ЩРН-12", rails: 1, modulesPerRail: 12 },
  { modules: 24, name: "ЩРН-24", rails: 2, modulesPerRail: 12 },
  { modules: 36, name: "ЩРН-36", rails: 3, modulesPerRail: 12 },
  { modules: 48, name: "ЩРН-48", rails: 4, modulesPerRail: 12 },
  { modules: 72, name: "ЩРН-72", rails: 6, modulesPerRail: 12 },
  { modules: 96, name: "ЩРН-96", rails: 8, modulesPerRail: 12 },
];

/**
 * Превращает результат расчёта в схему щита
 */
export function buildPanelLayout(result: CalculationResult): PanelLayout {
  const groups: PanelGroup[] = [];

  // Цвета для типов линий
  const typeColors: Record<string, string> = {
    LIGHTING: "#FFD54F",
    SOCKETS: "#2962FF",
    DEDICATED: "#EF5350",
    MIXED: "#26A69A",
  };

// Вводной автомат
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
      sublabel: `Ввод`,
      qfLabel: "QF1",
      brand: "ABB",
      characteristic: "C",
    },
  ],
});

// Счётчик QF (общий)
let qfCounter = 1;
let qdCounter = 1;

// Линии
result.lines.forEach((line, idx) => {
  const color = typeColors[line.lineType];
  const items: PanelItem[] = [];

  // УЗО
  if (line.rcd) {
    items.push({
      id: `rcd-${idx}`,
      type: "RCD",
      modules: line.rcd.poles,
      color: "#26A69A",
      label: `${line.rcd.current}A`,
      sublabel: `${line.rcd.sensitivity}мА`,
      lineIndex: idx,
      qfLabel: `QD${qdCounter++}`,
      brand: "ABB",
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
    brand: line.lineType === "DEDICATED" ? "Schneider" : "ABB",
    characteristic: line.breaker.characteristic,
  });

  groups.push({
    id: `line-${idx}`,
    title: `Линия ${idx + 1}: ${line.name}`,
    color,
    items,
  });
});

  // Считаем общие модули
  const totalModules = groups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.modules, 0),
    0
  );

  // Подбираем корпус (с запасом 25%)
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

/**
 * Разбивает модули по DIN-рейкам
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
