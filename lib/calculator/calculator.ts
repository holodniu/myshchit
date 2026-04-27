/**
 * 🧮 Движок расчёта электрощита
 * Собственные инженерные алгоритмы по ПУЭ
 */

import { ConsumerType, NetworkType } from "@prisma/client";

// ═══════════════════════════════════════════════════
// 📐 ТИПЫ
// ═══════════════════════════════════════════════════

export type InputConsumer = {
  id: string;
  type: ConsumerType;
  name: string;
  power: number;      // Вт
  quantity: number;
  dedicatedLine: boolean;
  voltage: number;    // 220 или 380
  powerFactor: number; // cos φ (0.85–1.0)
  roomId: string;
  roomName: string;
};

export type CalculatedLine = {
  name: string;
  lineType: "LIGHTING" | "SOCKETS" | "DEDICATED" | "MIXED";
  consumers: InputConsumer[];
  // Расчётные параметры
  totalPower: number;        // Вт
  calculatedPower: number;   // с учётом коэфф. одновременности
  calculatedCurrent: number; // А
  voltage: number;
  // Подобранное оборудование
  breaker: {
    current: number;           // номинал, А
    characteristic: "B" | "C" | "D";
    poles: number;
  };
  rcd?: {
    current: number;     // А
    sensitivity: number; // мА
    type: "AC" | "A" | "B";
    poles: number;
  };
  cable: {
    section: number;  // мм²
    cores: number;    // 3 или 5
    maxCurrent: number;
  };
};

export type CalculationResult = {
  networkType: NetworkType;
  totalPower: number;
  calculatedPower: number;
  simultaneityFactor: number;
  inputCurrent: number;
  inputBreaker: {
    current: number;
    poles: number;
  };
  lines: CalculatedLine[];
  warnings: string[];
};

// ═══════════════════════════════════════════════════
// 🔧 СПРАВОЧНЫЕ ДАННЫЕ
// ═══════════════════════════════════════════════════

const BREAKER_CURRENTS = [6, 10, 16, 20, 25, 32, 40, 50, 63] as const;
const RCD_CURRENTS = [25, 40, 63, 80, 100] as const;

// Таблица сечений меди по автомату (ПУЭ, для медной проводки в стене)
const BREAKER_TO_CABLE_SECTION: Record<number, number> = {
  6: 1.5,
  10: 1.5,
  16: 2.5,
  20: 4,
  25: 4,
  32: 6,
  40: 10,
  50: 10,
  63: 16,
};

// Макс. ток по сечению кабеля ВВГнг, медь
const CABLE_MAX_CURRENT: Record<number, number> = {
  1.5: 19,
  2.5: 27,
  4: 38,
  6: 46,
  10: 70,
  16: 85,
};

// Коэффициент одновременности (ПУЭ)
function getSimultaneityFactor(linesCount: number): number {
  if (linesCount <= 3) return 1.0;
  if (linesCount <= 5) return 0.8;
  if (linesCount <= 9) return 0.7;
  return 0.6;
}

// Тип потребителя → нужно ли ставить на отдельную линию (по умолчанию)
const ALWAYS_DEDICATED: ConsumerType[] = [
  "COOKTOP",
  "OVEN",
  "ELECTRIC_BOILER",
  "EV_CHARGER",
  "AIR_CONDITIONER",
  "WATER_HEATER",
  "WASHING_MACHINE",
  "REFRIGERATOR",
  "WARM_FLOOR",
];

// ═══════════════════════════════════════════════════
// ⚡ ОСНОВНЫЕ ФУНКЦИИ
// ═══════════════════════════════════════════════════

/**
 * Подбирает ближайший БОЛЬШИЙ номинал автомата
 * Пример: ток 14.5 А → возвращает 16
 */
export function selectBreakerRating(current: number): number {
  const rating = BREAKER_CURRENTS.find((c) => c >= current);
  if (!rating) {
    throw new Error(
      `Ток ${current.toFixed(1)} А превышает максимальный номинал 63 А. Нужна отдельная трёхфазная линия.`
    );
  }
  return rating;
}

/**
 * Подбирает сечение кабеля по номиналу автомата (ПУЭ)
 */
export function selectCableSection(breakerRating: number): {
  section: number;
  maxCurrent: number;
} {
  const section = BREAKER_TO_CABLE_SECTION[breakerRating];
  const maxCurrent = CABLE_MAX_CURRENT[section];
  return { section, maxCurrent };
}

/**
 * Рассчитывает ток
 * I = P / (U × cos φ × √n)   где n = 1 для 1ф, 3 для 3ф
 */
export function calculateCurrent(
  power: number,
  voltage: number,
  powerFactor: number = 1.0
): number {
  if (voltage === 380) {
    return power / (voltage * powerFactor * Math.sqrt(3));
  }
  return power / (voltage * powerFactor);
}

/**
 * Определяет параметры УЗО для линии
 */
function selectRcd(line: {
  lineType: string;
  consumers: InputConsumer[];
  calculatedCurrent: number;
}): CalculatedLine["rcd"] | undefined {
  const hasEvCharger = line.consumers.some((c) => c.type === "EV_CHARGER");
  const hasWater = line.consumers.some(
    (c) =>
      c.type === "WATER_HEATER" ||
      c.type === "WASHING_MACHINE" ||
      c.type === "WARM_FLOOR"
  );

  // Зарядка ЭМ — тип B
  if (hasEvCharger) {
    return {
      current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
      sensitivity: 30,
      type: "B",
      poles: 2,
    };
  }

  // Мокрые зоны — УЗО 10 мА, тип A
  if (hasWater) {
    return {
      current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
      sensitivity: 10,
      type: "A",
      poles: 2,
    };
  }

  // Свет — без УЗО (опционально — 30 мА)
  if (line.lineType === "LIGHTING") {
    return undefined;
  }

  // Розетки и смешанные — УЗО 30 мА, тип AC
  return {
    current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
    sensitivity: 30,
    type: "AC",
    poles: 2,
  };
}

function selectNearestRcdCurrent(current: number): number {
  const rating = RCD_CURRENTS.find((c) => c >= current);
  return rating ?? 63;
}

// ═══════════════════════════════════════════════════
// 🏗 ГЛАВНАЯ ФУНКЦИЯ РАСЧЁТА
// ═══════════════════════════════════════════════════

export function calculatePanel(
  consumers: InputConsumer[],
  networkType: NetworkType
): CalculationResult {
  const warnings: string[] = [];
  const lines: CalculatedLine[] = [];

  // ─── 1. Группируем потребителей в линии ───────────
  
  // Потребители с флагом "отдельная линия" или из списка ALWAYS_DEDICATED
  const dedicated = consumers.filter(
    (c) => c.dedicatedLine || ALWAYS_DEDICATED.includes(c.type)
  );

  // Общие (свет и розетки) группируем по комнатам
  const shared = consumers.filter(
    (c) => !c.dedicatedLine && !ALWAYS_DEDICATED.includes(c.type)
  );

  // Группа "Свет" — по комнате
  const lightByRoom = new Map<string, InputConsumer[]>();
  const socketsByRoom = new Map<string, InputConsumer[]>();
  const otherByRoom = new Map<string, InputConsumer[]>();

  for (const c of shared) {
    if (c.type === "LIGHT") {
      if (!lightByRoom.has(c.roomId)) lightByRoom.set(c.roomId, []);
      lightByRoom.get(c.roomId)!.push(c);
    } else if (c.type === "SOCKET") {
      if (!socketsByRoom.has(c.roomId)) socketsByRoom.set(c.roomId, []);
      socketsByRoom.get(c.roomId)!.push(c);
    } else {
      if (!otherByRoom.has(c.roomId)) otherByRoom.set(c.roomId, []);
      otherByRoom.get(c.roomId)!.push(c);
    }
  }

  // ─── 2. Создаём линии освещения ───────────────────
  for (const [, roomConsumers] of lightByRoom) {
    const roomName = roomConsumers[0].roomName;
    const totalPower = roomConsumers.reduce(
      (s, c) => s + c.power * c.quantity,
      0
    );
    const voltage = 220;
    const current = calculateCurrent(totalPower, voltage, 1.0);
    const breakerCurrent = selectBreakerRating(current * 1.1); // запас 10%
    const cable = selectCableSection(breakerCurrent);

    const line: CalculatedLine = {
      name: `Свет — ${roomName}`,
      lineType: "LIGHTING",
      consumers: roomConsumers,
      totalPower,
      calculatedPower: totalPower,
      calculatedCurrent: current,
      voltage,
      breaker: { current: breakerCurrent, characteristic: "B", poles: 1 },
      cable: { section: cable.section, cores: 3, maxCurrent: cable.maxCurrent },
    };
    line.rcd = selectRcd(line);
    lines.push(line);
  }

  // ─── 3. Линии розеток ─────────────────────────────
  for (const [, roomConsumers] of socketsByRoom) {
    const roomName = roomConsumers[0].roomName;
    const totalPower = roomConsumers.reduce(
      (s, c) => s + c.power * c.quantity,
      0
    );
    const voltage = 220;
    const current = calculateCurrent(totalPower, voltage, 1.0);
    const breakerCurrent = selectBreakerRating(current * 1.1);
    const cable = selectCableSection(breakerCurrent);

    const line: CalculatedLine = {
      name: `Розетки — ${roomName}`,
      lineType: "SOCKETS",
      consumers: roomConsumers,
      totalPower,
      calculatedPower: totalPower,
      calculatedCurrent: current,
      voltage,
      breaker: { current: breakerCurrent, characteristic: "C", poles: 1 },
      cable: { section: cable.section, cores: 3, maxCurrent: cable.maxCurrent },
    };
    line.rcd = selectRcd(line);
    lines.push(line);
  }

  // ─── 4. Прочие (смешанные) ───────────────────────
  for (const [, roomConsumers] of otherByRoom) {
    const roomName = roomConsumers[0].roomName;
    const totalPower = roomConsumers.reduce(
      (s, c) => s + c.power * c.quantity,
      0
    );
    const voltage = 220;
    const current = calculateCurrent(totalPower, voltage, 0.95);
    const breakerCurrent = selectBreakerRating(current * 1.1);
    const cable = selectCableSection(breakerCurrent);

    const line: CalculatedLine = {
      name: `Смешанная — ${roomName}`,
      lineType: "MIXED",
      consumers: roomConsumers,
      totalPower,
      calculatedPower: totalPower,
      calculatedCurrent: current,
      voltage,
      breaker: { current: breakerCurrent, characteristic: "C", poles: 1 },
      cable: { section: cable.section, cores: 3, maxCurrent: cable.maxCurrent },
    };
    line.rcd = selectRcd(line);
    lines.push(line);
  }

  // ─── 5. Отдельные линии ──────────────────────────
  for (const c of dedicated) {
    const totalPower = c.power * c.quantity;
    const voltage = c.voltage;
    const pf = c.powerFactor || (c.type === "AIR_CONDITIONER" ? 0.85 : 1.0);

    const current = calculateCurrent(totalPower, voltage, pf);
    let breakerCurrent: number;

    try {
      breakerCurrent = selectBreakerRating(current * 1.1);
    } catch {
      warnings.push(
        `⚠️ ${c.name}: ток ${current.toFixed(1)} А слишком велик для 1-фазной линии. Рекомендуется 3-фазная.`
      );
      breakerCurrent = 63;
    }

    const cable = selectCableSection(breakerCurrent);
    const is3phase = voltage === 380;
    const characteristic: "B" | "C" | "D" =
      c.type === "COOKTOP" || c.type === "OVEN" || c.type === "AIR_CONDITIONER"
        ? "D"
        : "C";

    const line: CalculatedLine = {
      name: c.name,
      lineType: "DEDICATED",
      consumers: [c],
      totalPower,
      calculatedPower: totalPower,
      calculatedCurrent: current,
      voltage,
      breaker: {
        current: breakerCurrent,
        characteristic,
        poles: is3phase ? 3 : 1,
      },
      cable: {
        section: cable.section,
        cores: is3phase ? 5 : 3,
        maxCurrent: cable.maxCurrent,
      },
    };
    line.rcd = selectRcd(line);
    lines.push(line);
  }

  // ─── 6. Итоговый расчёт ──────────────────────────
  const totalPower = lines.reduce((s, l) => s + l.totalPower, 0);
  const simultaneityFactor = getSimultaneityFactor(lines.length);
  const calculatedPower = totalPower * simultaneityFactor;

  const inputVoltage = networkType === "THREE_PHASE" ? 380 : 220;
  const inputCurrent = calculateCurrent(calculatedPower, inputVoltage, 0.95);
  const inputBreakerCurrent = selectBreakerRating(inputCurrent * 1.1);

  // Предупреждения
  if (totalPower > 15000 && networkType === "SINGLE_PHASE") {
    warnings.push(
      "⚠️ Мощность превышает 15 кВт. Рекомендуется 3-фазное подключение."
    );
  }

  if (lines.length > 20) {
    warnings.push(
      "⚠️ Более 20 линий — рассмотрите разделение на несколько щитов."
    );
  }

  return {
    networkType,
    totalPower,
    calculatedPower,
    simultaneityFactor,
    inputCurrent,
    inputBreaker: {
      current: inputBreakerCurrent,
      poles: networkType === "THREE_PHASE" ? 3 : 2,
    },
    lines,
    warnings,
  };
}
