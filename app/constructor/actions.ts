"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NetworkType, ConsumerType } from "@prisma/client";

// Тип данных от формы
export type CreateProjectInput = {
  name: string;
  description?: string;
  networkType: NetworkType;
  rooms: {
    name: string;
    area?: number;
    consumers: {
      type: ConsumerType;
      name: string;
      power: number;
      quantity: number;
      dedicatedLine: boolean;
    }[];
  }[];
};

// 💾 Создание проекта с комнатами и потребителями
export async function createProject(input: CreateProjectInput) {
  // ⚠️ Пока без авторизации — берём "тестового пользователя"
  // На Этапе 7 (аутентификация) заменим на реального юзера
  let testUser = await prisma.user.findFirst({
    where: { email: "test@myshchit.ru" },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: "test@myshchit.ru",
        name: "Тестовый пользователь",
        role: "USER",
      },
    });
  }

  // Считаем общую мощность
  const totalPower = input.rooms.reduce(
    (sum, room) =>
      sum +
      room.consumers.reduce(
        (s, c) => s + c.power * c.quantity,
        0
      ),
    0
  );

  // Создаём проект + комнаты + потребителей одним запросом
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      networkType: input.networkType,
      totalPower,
      userId: testUser.id,
      rooms: {
        create: input.rooms.map((room, roomIdx) => ({
          name: room.name,
          area: room.area,
          order: roomIdx,
          consumers: {
            create: room.consumers.map((consumer) => ({
              type: consumer.type,
              name: consumer.name,
              power: consumer.power,
              quantity: consumer.quantity,
              dedicatedLine: consumer.dedicatedLine,
            })),
          },
        })),
      },
    },
  });

  // Обновляем кэш страницы /projects
  revalidatePath("/projects");

  // Редирект на страницу проекта
  redirect(`/projects/${project.id}`);
}

// 🗑️ Удаление проекта
export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: { id: projectId },
  });
  revalidatePath("/projects");
}
import { calculatePanel, type InputConsumer } from "@/lib/calculator/calculator";

/**
 * 🧮 Рассчитать проект — подобрать автоматы, УЗО, кабели
 * И сохранить результаты в БД
 */
export async function calculateProject(projectId: string) {
  // Загружаем проект со всеми данными
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      rooms: {
        include: { consumers: true },
      },
    },
  });

  if (!project) {
    throw new Error("Проект не найден");
  }

  // Собираем потребителей для калькулятора
  const inputConsumers: InputConsumer[] = project.rooms.flatMap((room) =>
    room.consumers.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      power: c.power,
      quantity: c.quantity,
      dedicatedLine: c.dedicatedLine,
      voltage: c.voltage,
      powerFactor: c.powerFactor,
      roomId: room.id,
      roomName: room.name,
    }))
  );

  if (inputConsumers.length === 0) {
    throw new Error("В проекте нет потребителей. Добавьте их перед расчётом.");
  }

  // 🧮 Запуск движка
  const result = calculatePanel(inputConsumers, project.networkType);

  // Удаляем старые расчёты (если были)
  await prisma.panel.deleteMany({
    where: { projectId },
  });

  // Создаём новый щит с линиями
  const panel = await prisma.panel.create({
    data: {
      name: "Главный щит",
      projectId,
      lines: {
        create: result.lines.map((line, idx) => ({
          name: line.name,
          order: idx,
          lineType: line.lineType,
          calculatedPower: line.calculatedPower,
          calculatedCurrent: line.calculatedCurrent,
          // Подключение потребителей к линиям
          consumers: {
            connect: line.consumers.map((c) => ({ id: c.id })),
          },
        })),
      },
    },
    include: { lines: true },
  });

  // Обновляем общие параметры проекта
  await prisma.project.update({
    where: { id: projectId },
    data: {
      totalPower: result.totalPower,
      calculatedPower: result.calculatedPower,
      inputCurrent: result.inputCurrent,
      status: "CALCULATED",
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return {
    success: true,
    result,
    panelId: panel.id,
    warnings: result.warnings,
  };
}
import type { CalculationResult } from "@/lib/calculator/calculator";

/**
 * Считает примерную стоимость оборудования по бренду
 */
export async function fetchPriceEstimate(
  result: CalculationResult,
  brandSlug: string
) {
  "use server";

  const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
  if (!brand) {
    return {
      total: 0,
      breakdown: { breakers: 0, rcds: 0, cables: 0, enclosure: 0 },
    };
  }

  // Берём цены по бренду — средняя цена автомата C16
  const sampleBreaker = await prisma.breaker.findFirst({
    where: { brandId: brand.id, current: 16 },
  });
  const breakerPrice = sampleBreaker?.priceRub || 200;

  const sampleRcd = await prisma.rcd.findFirst({
    where: { brandId: brand.id, current: 40 },
  });
  const rcdPrice = sampleRcd?.priceRub || 1500;

  const sampleCable = await prisma.cable.findFirst({
    where: { brandId: brand.id, section: 2.5, cores: 3 },
  });
  const cablePricePerMeter = sampleCable?.pricePerMeter || 70;

  // Подсчёт
  let breakers = breakerPrice; // вводной
  let rcds = 0;
  let cables = 0;

  for (const line of result.lines) {
    // Автомат — масштабируем цену от номинала
    breakers += breakerPrice * (line.breaker.current / 16);

    // УЗО
    if (line.rcd) {
      rcds += rcdPrice * (line.rcd.current / 40);
    }

    // Кабель — средняя длина 15 метров на линию
    cables += cablePricePerMeter * 15 * (line.cable.section / 2.5);
  }

  // Корпус (зависит от количества линий)
  const enclosurePrices: Record<string, number> = {
    "ЩРН-12": 1500,
    "ЩРН-24": 2500,
    "ЩРН-36": 3500,
    "ЩРН-48": 5000,
    "ЩРН-72": 7500,
    "ЩРН-96": 10000,
  };

  // Определяем корпус
  const totalModules =
    result.lines.reduce(
      (s, l) => s + l.breaker.poles + (l.rcd?.poles || 0),
      0
    ) + result.inputBreaker.poles;

  const enclosureName =
    totalModules <= 12
      ? "ЩРН-12"
      : totalModules <= 24
      ? "ЩРН-24"
      : totalModules <= 36
      ? "ЩРН-36"
      : totalModules <= 48
      ? "ЩРН-48"
      : totalModules <= 72
      ? "ЩРН-72"
      : "ЩРН-96";

  const enclosure = enclosurePrices[enclosureName];

  const total = Math.round(breakers + rcds + cables + enclosure);

  return {
    total,
    breakdown: {
      breakers: Math.round(breakers),
      rcds: Math.round(rcds),
      cables: Math.round(cables),
      enclosure,
    },
  };
}
