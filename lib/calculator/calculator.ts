import { ConsumerType, NetworkType, ProtectionLevel } from "@prisma/client";

// ═══════════════════════════════════════════════════
// 📐 ТИПЫ
// ═══════════════════════════════════════════════════

export type InputConsumer = {
  id: string;
  type: ConsumerType;
  name: string;
  power: number;
  quantity: number;
  dedicatedLine: boolean;
  voltage: number;
  powerFactor: number;
  roomId: string;
  roomName: string;
};

export type Phase = "L1" | "L2" | "L3" | null;

export type BreakerCharacteristic = "B" | "C" | "D";

export type CalculatedLine = {
  name: string;
  lineType: "LIGHTING" | "SOCKETS" | "DEDICATED" | "MIXED";
  consumers: InputConsumer[];
  totalPower: number;
  calculatedPower: number;
  calculatedCurrent: number;
  voltage: number;
  breaker: {
    current: number;
    characteristic: BreakerCharacteristic;
    poles: number;
  };
  rcd?: {
    current: number;
    sensitivity: number;
    type: "AC" | "A" | "B";
    poles: number;
  };
  cable: {
    section: number;
    cores: number;
    maxCurrent: number;
  };
  phase: Phase; // 🆕 фаза для однофазных линий в 3-фазной сети
  characteristicReason?: string; // 🆕 почему выбрана именно эта кривая
  inrushCurrent?: number; // 🆕 пусковой ток (для моторных нагрузок)
};

export type PhaseBalance = {
  L1: { power: number; current: number; lines: number };
  L2: { power: number; current: number; lines: number };
  L3: { power: number; current: number; lines: number };
  imbalance: number; // максимальный разбаланс в %
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
  phaseBalance?: PhaseBalance; // 🆕 баланс фаз (только для 3-фазной сети)
};

// ═══════════════════════════════════════════════════
// 📊 КОНСТАНТЫ
// ═══════════════════════════════════════════════════

const BREAKER_CURRENTS = [6, 10, 16, 20, 25, 32, 40, 50, 63] as const;
const RCD_CURRENTS = [25, 40, 63, 80, 100] as const;

const BREAKER_TO_CABLE_SECTION: Record<number, number> = {
  6: 1.5, 10: 1.5, 16: 2.5, 20: 4, 25: 4, 32: 6, 40: 10, 50: 10, 63: 16,
};

const CABLE_MAX_CURRENT: Record<number, number> = {
  1.5: 19, 2.5: 27, 4: 38, 6: 46, 10: 70, 16: 85,
};

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
  "SMART_RELAY",
  "SMART_DIMMER",
  "SMART_GATEWAY",
];

function getSimultaneityFactor(linesCount: number): number {
  if (linesCount <= 3) return 1.0;
  if (linesCount <= 5) return 0.8;
  if (linesCount <= 9) return 0.7;
  return 0.6;
}

/**
 * 🎯 Выбор кривой срабатывания автомата (B/C/D)
 * с пояснением для пользователя.
 */
function selectCharacteristic(
  lineType: CalculatedLine["lineType"],
  consumers: InputConsumer[]
): { characteristic: BreakerCharacteristic; reason: string } {
  // Свет — нет пусковых токов
  if (lineType === "LIGHTING") {
    return { characteristic: "B", reason: "Освещение: нет пусковых токов, чувствительная защита" };
  }

  // Проверяем типы потребителей на наличие моторов/компрессоров (пусковые токи 5-10×)
  const hasMotor = consumers.some((c) =>
    c.type === "AIR_CONDITIONER" ||
    c.type === "REFRIGERATOR" ||
    c.type === "WASHING_MACHINE"
  );
  const hasHeating = consumers.some((c) =>
    c.type === "COOKTOP" ||
    c.type === "OVEN" ||
    c.type === "WATER_HEATER" ||
    c.type === "WARM_FLOOR" ||
    c.type === "ELECTRIC_BOILER"
  );
  const hasEvCharger = consumers.some((c) => c.type === "EV_CHARGER");
  const hasWorkshop = consumers.some((c) => c.type === "WORKSHOP");

  if (hasMotor) {
    return { characteristic: "D", reason: "Моторная нагрузка: компрессор/насос с высокими пусковыми токами" };
  }

  if (hasWorkshop) {
    return { characteristic: "D", reason: "Мастерская: электроинструмент с пусковыми токами" };
  }

  const hasSmartHome = consumers.some((c) =>
    c.type === "SMART_RELAY" ||
    c.type === "SMART_DIMMER" ||
    c.type === "SMART_GATEWAY"
  );

  if (hasSmartHome) {
    return { characteristic: "C", reason: "Электроника умного дома: стабильный ток без пусковых бросков" };
  }

  if (hasEvCharger) {
    return { characteristic: "C", reason: "Зарядка ЭМ: стабильный ток без пусковых бросков" };
  }

  if (hasHeating) {
    return { characteristic: "C", reason: "Нагревательная нагрузка: высокий ток без пусковых бросков" };
  }

  // По умолчанию — C (универсальная)
  return { characteristic: "C", reason: "Универсальная кривая: типичные бытовые нагрузки" };
}

// ═══════════════════════════════════════════════════
// ⚡ ФУНКЦИИ ПОДБОРА
// ═══════════════════════════════════════════════════

export function selectBreakerRating(current: number): number {
  const rating = BREAKER_CURRENTS.find((c) => c >= current);
  if (!rating) {
    throw new Error(
      `Ток ${current.toFixed(1)} А превышает максимальный номинал 63 А. Нужна отдельная трёхфазная линия.`
    );
  }
  return rating;
}

export function selectCableSection(breakerRating: number): {
  section: number;
  maxCurrent: number;
} {
  const section = BREAKER_TO_CABLE_SECTION[breakerRating];
  const maxCurrent = CABLE_MAX_CURRENT[section];
  return { section, maxCurrent };
}

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
 * 🛡️ Подбор УЗО с учётом УРОВНЯ ЗАЩИТЫ
 * 
 * MINIMAL  — только мокрые зоны + улица + ЭМ (по ПУЭ минимум)
 * BASIC    — + розетки, смешанные (рекомендуется)
 * MAXIMUM  — УЗО на все линии кроме света
 * PARANOID — УЗО даже на свет
 */
function selectRcd(
  line: {
    lineType: string;
    consumers: InputConsumer[];
    calculatedCurrent: number;
  },
  protectionLevel: ProtectionLevel = "BASIC"
): CalculatedLine["rcd"] | undefined {
  const hasEvCharger = line.consumers.some((c) => c.type === "EV_CHARGER");
  const hasWater = line.consumers.some(
    (c) =>
      c.type === "WATER_HEATER" ||
      c.type === "WASHING_MACHINE" ||
      c.type === "WARM_FLOOR"
  );
  const hasOutdoor = line.consumers.some((c) => c.type === "OUTDOOR");

  // ⚡ ПУЭ-обязательные — всегда, независимо от уровня

  // 🚗 ЭМ — всегда 30мА тип B
  if (hasEvCharger) {
    return {
      current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
      sensitivity: 30,
      type: "B",
      poles: 2,
    };
  }

  // 💧 Мокрые зоны — всегда 10мА
  if (hasWater) {
    return {
      current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
      sensitivity: 10,
      type: "A",
      poles: 2,
    };
  }

  // 🌳 Улица — всегда 30мА по ПУЭ
  if (hasOutdoor) {
    return {
      current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
      sensitivity: 30,
      type: "AC",
      poles: 2,
    };
  }

  // 🎯 ДАЛЬШЕ — логика ЗАВИСИТ ОТ УРОВНЯ ЗАЩИТЫ

  // 💡 Свет — УЗО только на уровне PARANOID
  if (line.lineType === "LIGHTING") {
    if (protectionLevel === "PARANOID") {
      return {
        current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
        sensitivity: 30,
        type: "AC",
        poles: 2,
      };
    }
    return undefined;
  }

  // 🔌 Розетки — УЗО для BASIC/MAXIMUM/PARANOID, нет на MINIMAL
  if (line.lineType === "SOCKETS" || line.lineType === "MIXED") {
    if (protectionLevel === "MINIMAL") return undefined;
    return {
      current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
      sensitivity: 30,
      type: "AC",
      poles: 2,
    };
  }

  // ❄️ Выделенные «сухие» (кондёр, холодильник, варочная, духовка) 
  // — УЗО только на MAXIMUM/PARANOID
  if (line.lineType === "DEDICATED") {
    if (protectionLevel === "MAXIMUM" || protectionLevel === "PARANOID") {
      return {
        current: selectNearestRcdCurrent(line.calculatedCurrent * 1.25),
        sensitivity: 30,
        type: "AC",
        poles: 2,
      };
    }
    return undefined;
  }

  // По умолчанию — 30мА
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
// ⚡ ПРОВЕРКА ПУСКОВЫХ ТОКОВ
// ═══════════════════════════════════════════════════

/**
 * Для моторных нагрузок рассчитывает пусковой ток (~6-7× номинального)
 * и проверяет, не вызовет ли он ложное срабатывание автомата.
 *
 * Пороги срабатывания по IEC 60898:
 *   B — 3×Inom (гарантированно не сработает), 5×Inom (гарантированно сработает)
 *   C — 5×Inom / 10×Inom
 *   D — 10×Inom / 20×Inom
 */
function checkInrushCurrents(
  lines: CalculatedLine[],
  warnings: string[]
): CalculatedLine[] {
  const MOTOR_TYPES: ConsumerType[] = [
    "AIR_CONDITIONER",
    "REFRIGERATOR",
    "WASHING_MACHINE",
  ];

  const INTRUSION_MULTIPLIER = 6.5; // средний пусковой ток бытовых моторов

  const thresholds: Record<BreakerCharacteristic, { safe: number; trip: number }> = {
    B: { safe: 3, trip: 5 },
    C: { safe: 5, trip: 10 },
    D: { safe: 10, trip: 20 },
  };

  return lines.map((line) => {
    const hasMotor = line.consumers.some((c) => MOTOR_TYPES.includes(c.type));
    if (!hasMotor) return line;

    const inrush = line.calculatedCurrent * INTRUSION_MULTIPLIER;
    const threshold = thresholds[line.breaker.characteristic];
    const safeCurrent = line.breaker.current * threshold.safe;
    const tripCurrent = line.breaker.current * threshold.trip;

    if (inrush > tripCurrent) {
      warnings.push(
        `⚡ ${line.name}: пусковой ток ~${inrush.toFixed(0)} А может вызвать ложное срабатывание автомата ${line.breaker.characteristic}${line.breaker.current}A. Рекомендуется кривая D или автомат большего номинала.`
      );
    } else if (inrush > safeCurrent) {
      warnings.push(
        `⚡ ${line.name}: пусковой ток ~${inrush.toFixed(0)} А близок к порогу срабатывания автомата ${line.breaker.characteristic}${line.breaker.current}A (зона неопределённости).`
      );
    }

    return { ...line, inrushCurrent: Math.round(inrush) };
  });
}

// ═══════════════════════════════════════════════════
// ⚖️ БАЛАНСИРОВКА ФАЗ (для 3-фазной сети)
// ═══════════════════════════════════════════════════

/**
 * Распределяет однофазные линии по фазам L1/L2/L3 методом "greedy" —
 * каждую новую линию вешаем на наименее загруженную фазу.
 * Трёхфазные линии (380В) не участвуют — они сами по себе сбалансированы.
 */
function balancePhases(lines: CalculatedLine[]): {
  balancedLines: CalculatedLine[];
  phaseBalance: PhaseBalance;
} {
  const phaseLoads = {
    L1: { power: 0, current: 0, lines: 0 },
    L2: { power: 0, current: 0, lines: 0 },
    L3: { power: 0, current: 0, lines: 0 },
  };

  const balanced = lines.map((line): CalculatedLine => {
    // Трёхфазные линии — без фазы (null)
    if (line.voltage === 380) {
      return { ...line, phase: null };
    }

    // Находим наименее загруженную фазу по мощности
    const phases: ("L1" | "L2" | "L3")[] = ["L1", "L2", "L3"];
    const minPhase = phases.reduce((min, p) =>
      phaseLoads[p].power < phaseLoads[min].power ? p : min,
      "L1"
    );

    phaseLoads[minPhase].power += line.calculatedPower;
    phaseLoads[minPhase].current += line.calculatedCurrent;
    phaseLoads[minPhase].lines += 1;

    return { ...line, phase: minPhase };
  });

  // Расчёт разбаланса (% отклонения от среднего)
  const avgPower =
    (phaseLoads.L1.power + phaseLoads.L2.power + phaseLoads.L3.power) / 3;

  const imbalance = avgPower > 0
    ? Math.max(
        Math.abs(phaseLoads.L1.power - avgPower),
        Math.abs(phaseLoads.L2.power - avgPower),
        Math.abs(phaseLoads.L3.power - avgPower)
      ) / avgPower * 100
    : 0;

  return {
    balancedLines: balanced,
    phaseBalance: {
      L1: phaseLoads.L1,
      L2: phaseLoads.L2,
      L3: phaseLoads.L3,
      imbalance: Math.round(imbalance * 10) / 10,
    },
  };
}

// ═══════════════════════════════════════════════════
// 🧮 ГЛАВНАЯ ФУНКЦИЯ РАСЧЁТА
// ═══════════════════════════════════════════════════

export function calculatePanel(
  consumers: InputConsumer[],
  networkType: NetworkType,
  protectionLevel: ProtectionLevel = "BASIC"
): CalculationResult {
  const warnings: string[] = [];
  let lines: CalculatedLine[] = [];

  const dedicated = consumers.filter(
    (c) => c.dedicatedLine || ALWAYS_DEDICATED.includes(c.type)
  );
  const shared = consumers.filter(
    (c) => !c.dedicatedLine && !ALWAYS_DEDICATED.includes(c.type)
  );

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

  // 💡 Свет
  for (const [, roomConsumers] of lightByRoom) {
    const roomName = roomConsumers[0].roomName;
    const totalPower = roomConsumers.reduce((s, c) => s + c.power * c.quantity, 0);
    const voltage = 220;
    const current = calculateCurrent(totalPower, voltage, 1.0);
    const breakerCurrent = selectBreakerRating(current * 1.1);
    const cable = selectCableSection(breakerCurrent);

    const char = selectCharacteristic("LIGHTING", roomConsumers);
    const line: CalculatedLine = {
      name: `Свет — ${roomName}`,
      lineType: "LIGHTING",
      consumers: roomConsumers,
      totalPower,
      calculatedPower: totalPower,
      calculatedCurrent: current,
      voltage,
      breaker: { current: breakerCurrent, characteristic: char.characteristic, poles: 1 },
      cable: { section: cable.section, cores: 3, maxCurrent: cable.maxCurrent },
      phase: null,
      characteristicReason: char.reason,
    };
    line.rcd = selectRcd(line, protectionLevel);
    lines.push(line);
  }

  // 🔌 Розетки
  for (const [, roomConsumers] of socketsByRoom) {
    const roomName = roomConsumers[0].roomName;
    const totalPower = roomConsumers.reduce((s, c) => s + c.power * c.quantity, 0);
    const voltage = 220;
    const current = calculateCurrent(totalPower, voltage, 1.0);
    const breakerCurrent = selectBreakerRating(current * 1.1);
    const cable = selectCableSection(breakerCurrent);

    const char = selectCharacteristic("SOCKETS", roomConsumers);
    const line: CalculatedLine = {
      name: `Розетки — ${roomName}`,
      lineType: "SOCKETS",
      consumers: roomConsumers,
      totalPower,
      calculatedPower: totalPower,
      calculatedCurrent: current,
      voltage,
      breaker: { current: breakerCurrent, characteristic: char.characteristic, poles: 1 },
      cable: { section: cable.section, cores: 3, maxCurrent: cable.maxCurrent },
      phase: null,
      characteristicReason: char.reason,
    };
    line.rcd = selectRcd(line, protectionLevel);
    lines.push(line);
  }

  // 🔀 Смешанные
  for (const [, roomConsumers] of otherByRoom) {
    const roomName = roomConsumers[0].roomName;
    const totalPower = roomConsumers.reduce((s, c) => s + c.power * c.quantity, 0);
    const voltage = 220;
    const current = calculateCurrent(totalPower, voltage, 0.95);
    const breakerCurrent = selectBreakerRating(current * 1.1);
    const cable = selectCableSection(breakerCurrent);

    const char = selectCharacteristic("MIXED", roomConsumers);
    const line: CalculatedLine = {
      name: `Смешанная — ${roomName}`,
      lineType: "MIXED",
      consumers: roomConsumers,
      totalPower,
      calculatedPower: totalPower,
      calculatedCurrent: current,
      voltage,
      breaker: { current: breakerCurrent, characteristic: char.characteristic, poles: 1 },
      cable: { section: cable.section, cores: 3, maxCurrent: cable.maxCurrent },
      phase: null,
      characteristicReason: char.reason,
    };
    line.rcd = selectRcd(line, protectionLevel);
    lines.push(line);
  }

  // ⚡ Отдельные линии
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
    const char = selectCharacteristic("DEDICATED", [c]);

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
        characteristic: char.characteristic,
        poles: is3phase ? 3 : 1,
      },
      cable: {
        section: cable.section,
        cores: is3phase ? 5 : 3,
        maxCurrent: cable.maxCurrent,
      },
      phase: null,
      characteristicReason: char.reason,
    };
    line.rcd = selectRcd(line, protectionLevel);
    lines.push(line);
  }

  // 🧮 Итоги
  const totalPower = lines.reduce((s, l) => s + l.totalPower, 0);
  const simultaneityFactor = getSimultaneityFactor(lines.length);
  const calculatedPower = totalPower * simultaneityFactor;

  const inputVoltage = networkType === "THREE_PHASE" ? 380 : 220;
  const inputCurrent = calculateCurrent(calculatedPower, inputVoltage, 0.95);
  const inputBreakerCurrent = selectBreakerRating(inputCurrent * 1.1);

  if (totalPower > 15000 && networkType === "SINGLE_PHASE") {
    warnings.push("⚠️ Мощность превышает 15 кВт. Рекомендуется 3-фазное подключение.");
  }
  if (lines.length > 20) {
    warnings.push("⚠️ Более 20 линий — рассмотрите разделение на несколько щитов.");
  }

  // ⚡ Проверка пусковых токов
  lines = checkInrushCurrents(lines, warnings);

  // ⚖️ Балансировка фаз для 3-фазной сети
  let finalLines = lines;
  let phaseBalance: PhaseBalance | undefined;

  if (networkType === "THREE_PHASE") {
    const balance = balancePhases(lines);
    finalLines = balance.balancedLines;
    phaseBalance = balance.phaseBalance;

    if (phaseBalance.imbalance > 15) {
      warnings.push(
        `⚠️ Разбаланс фаз: ${phaseBalance.imbalance.toFixed(1)}%. Рекомендуется перераспределить мощные линии для равномерной загрузки.`
      );
    }
  }

  // 🆕 Проверка загрузки автоматов
  for (const line of finalLines) {
    const loadPercent = (line.calculatedCurrent / line.breaker.current) * 100;
    if (loadPercent > 100) {
      warnings.push(
        `🔴 ${line.name}: ток ${line.calculatedCurrent.toFixed(1)} А превышает номинал автомата ${line.breaker.current} А (${loadPercent.toFixed(0)}%). Увеличьте номинал или разделите линию.`
      );
    } else if (loadPercent > 80) {
      warnings.push(
        `🟡 ${line.name}: загрузка ${loadPercent.toFixed(0)}% — близко к лимиту автомата ${line.breaker.current} А. Рекомендуется запас 20%.`
      );
    }
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
    lines: finalLines,
    warnings,
    phaseBalance,
  };
}


