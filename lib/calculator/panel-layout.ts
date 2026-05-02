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
  phase?: string; // 🆕 L1/L2/L3 для однофазных линий в 3-фазной сети
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
// 🏭 БРЕНДЫ
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
// 🎯 ПРИОРИТЕТ РАЗМЕЩЕНИЯ В ЩИТЕ (как делают электрики в РФ)
// ═══════════════════════════════════════════════════

/**
 * Возвращает приоритет линии для сортировки в щите.
 * Меньший номер = раньше в щите.
 * 
 * Порядок (по российской практике):
 * 1. Ввод — всегда первым (обрабатывается отдельно)
 * 2. Выделенные линии с 10мА УЗО (критичные: бойлер, стиралка, тёплый пол)
 * 3. Выделенные линии с 30мА УЗО (варочная, духовка, кондёр, холодильник, ЭМ)
 * 4. Розеточные группы по комнатам (розетки кухня, зал, спальня)
 * 5. Смешанные
 * 6. Свет — в самом конце (обычно меньший номинал, менее критичны)
 */
function getLineDisplayPriority(line: {
  lineType: string;
  rcd?: { sensitivity: number } | null | undefined;
}): number {
  const { lineType, rcd } = line;

  // Приоритет 2: Выделенные с 10мА (мокрые зоны, критично)
  if (lineType === "DEDICATED" && rcd?.sensitivity === 10) {
    return 2;
  }

  // Приоритет 3: Остальные выделенные (варочная, кондёр, холодильник)
  if (lineType === "DEDICATED") {
    return 3;
  }

  // Приоритет 4: Розетки по комнатам
  if (lineType === "SOCKETS") {
    return 4;
  }

  // Приоритет 5: Смешанные линии
  if (lineType === "MIXED") {
    return 5;
  }

  // Приоритет 6: Свет — в конце
  if (lineType === "LIGHTING") {
    return 6;
  }

  return 7; // прочее
}

// ═══════════════════════════════════════════════════
// 🏗 ПОСТРОЕНИЕ СХЕМЫ ЩИТА
// ═══════════════════════════════════════════════════

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

  // 🎯 ОДИН бренд на весь щит
  const panelBrand = getBrandDisplayName(brandSlug);

  // Счётчики для QF/QD
  let qfCounter = 0;
  let qdCounter = 0;

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
        brand: panelBrand,
        characteristic: "C",
      },
    ],
  });

  // 2️⃣ Сортируем линии по приоритету (как у российских электриков!)
  const sortedLines = [...result.lines]
    .map((line, originalIdx) => ({ line, originalIdx }))
    .sort((a, b) => {
      const priorityA = getLineDisplayPriority(a.line);
      const priorityB = getLineDisplayPriority(b.line);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // При одинаковом приоритете — сортировка по мощности (большие первыми)
      return b.line.totalPower - a.line.totalPower;
    });

  // 3️⃣ Обрабатываем линии в правильном порядке
  sortedLines.forEach(({ line, originalIdx }) => {
    const color = typeColors[line.lineType];
    const items: PanelItem[] = [];

    // УЗО перед автоматом
    if (line.rcd) {
      qdCounter++;
      items.push({
        id: `rcd-${originalIdx}`,
        type: "RCD",
        modules: line.rcd.poles,
        color: "#26A69A",
        label: `${line.rcd.current}A`,
        sublabel: `УЗО ${line.rcd.sensitivity}мА`,
        lineIndex: originalIdx,
        qfLabel: `QD${qdCounter}`,
        brand: panelBrand,
        sensitivity: line.rcd.sensitivity,
        rcdType: line.rcd.type,
        phase: line.phase || undefined,
      });
    }

    // Автомат
    qfCounter++;
    items.push({
      id: `breaker-${originalIdx}`,
      type: "BREAKER",
      modules: line.breaker.poles,
      color,
      label: `${line.breaker.characteristic}${line.breaker.current}`,
      sublabel: line.name,
      lineIndex: originalIdx,
      qfLabel: `QF${qfCounter}`,
      brand: panelBrand,
      characteristic: line.breaker.characteristic,
      phase: line.phase || undefined,
    });

    groups.push({
      id: `line-${originalIdx}`,
      title: `Линия: ${line.name}`,
      color,
      items,
    });
  });

  // 4️⃣ Итоги
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
// 📏 РАСПРЕДЕЛЕНИЕ ПО РЕЙКАМ (с учётом группировки)
// ═══════════════════════════════════════════════════

/**
 * Разбивает модули по DIN-рейкам.
 * Важно: УЗО+Автомат (пара из одной группы) НЕ разрывается между рейками.
 */
export function distributeOnRails(
  items: PanelItem[],
  modulesPerRail: number,
  groups?: PanelGroup[]
): PanelItem[][] {
  const rails: PanelItem[][] = [[]];
  let currentRail = 0;
  let currentWidth = 0;

  // Если переданы группы — размещаем группами (не разрываем УЗО+автомат)
  if (groups && groups.length > 0) {
    for (const group of groups) {
      const groupWidth = group.items.reduce((s, i) => s + i.modules, 0);

      // Если вся группа не влезает на текущую рейку — начинаем новую
      if (currentWidth + groupWidth > modulesPerRail && currentWidth > 0) {
        rails.push([]);
        currentRail++;
        currentWidth = 0;
      }

      // Если группа больше рейки — всё равно добавляем (разобьётся дальше)
      if (groupWidth > modulesPerRail) {
        for (const item of group.items) {
          if (currentWidth + item.modules > modulesPerRail) {
            rails.push([]);
            currentRail++;
            currentWidth = 0;
          }
          rails[currentRail].push(item);
          currentWidth += item.modules;
        }
      } else {
        // Нормальная группа — размещаем целиком
        for (const item of group.items) {
          rails[currentRail].push(item);
          currentWidth += item.modules;
        }
      }
    }
    return rails;
  }

  // Fallback: простое размещение по модулям
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


