import type { CalculationResult } from "@/lib/calculator/calculator";

export type PDFProject = {
  name: string;
  description?: string | null;
  networkType: "SINGLE_PHASE" | "THREE_PHASE";
  createdAt: Date;
  userName: string;
  userEmail: string;
  rooms: Array<{
    name: string;
    area: number | null;
    consumers: Array<{
      type: string;
      name: string;
      power: number;
      quantity: number;
      dedicatedLine: boolean;
    }>;
  }>;
  result: CalculationResult;
  brand: string;
  estimate: {
    total: number;
    breakdown: {
      breakers: number;
      rcds: number;
      cables: number;
      enclosure: number;
    };
  };
  enclosureName: string;
};

export const CONSUMER_LABELS: Record<string, string> = {
  LIGHT: "Свет",
  SOCKET: "Розетки",
  COOKTOP: "Варочная панель",
  OVEN: "Духовой шкаф",
  WATER_HEATER: "Бойлер",
  ELECTRIC_BOILER: "Электрокотёл",
  AIR_CONDITIONER: "Кондиционер",
  REFRIGERATOR: "Холодильник",
  WASHING_MACHINE: "Стиральная машина",
  EV_CHARGER: "Зарядка ЭМ",
  WARM_FLOOR: "Тёплый пол",
  WORKSHOP: "Мастерская",
  OUTDOOR: "Уличная линия",
  OTHER: "Прочее",
};
