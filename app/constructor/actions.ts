"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NetworkType, ConsumerType } from "@prisma/client";
import { calculatePanel, type InputConsumer, type CalculationResult } from "@/lib/calculator/calculator";

// ═══════════════════════════════════════════════════
// 📝 ТИПЫ
// ═══════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════
// 💾 СОЗДАНИЕ ПРОЕКТА
// ═══════════════════════════════════════════════════

export async function createProject(input: CreateProjectInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Необходимо войти в систему");
  }

  const userId = (session.user as any).id;

  if (!userId) {
    throw new Error("Сессия повреждена. Выйдите и войдите заново.");
  }

  const totalPower = input.rooms.reduce(
    (sum, room) =>
      sum + room.consumers.reduce((s, c) => s + c.power * c.quantity, 0),
    0
  );

  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      networkType: input.networkType,
      totalPower,
      userId,
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

  revalidatePath("/projects");
  return { success: true as const, projectId: project.id };
}

// ═══════════════════════════════════════════════════
// 🗑️ УДАЛЕНИЕ ПРОЕКТА
// ═══════════════════════════════════════════════════

export async function deleteProject(projectId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Необходимо войти в систему");
  }

  const userId = (session.user as any).id;

  // Проверяем, что проект принадлежит пользователю
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project || project.userId !== userId) {
    throw new Error("Проект не найден или нет доступа");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/projects");
}

// ═══════════════════════════════════════════════════
// 🧮 РАСЧЁТ ПРОЕКТА
// ═══════════════════════════════════════════════════

export async function calculateProject(projectId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Необходимо войти в систему");
  }

  const userId = (session.user as any).id;

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

  if (project.userId !== userId) {
    throw new Error("Нет доступа к проекту");
  }

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

  const result = calculatePanel(inputConsumers, project.networkType);

  // Удаляем старые расчёты
  await prisma.panel.deleteMany({
    where: { projectId },
  });

  // Создаём новый щит
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
          consumers: {
            connect: line.consumers.map((c) => ({ id: c.id })),
          },
        })),
      },
    },
    include: { lines: true },
  });

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

// ═══════════════════════════════════════════════════
// 💰 СМЕТА ПО БРЕНДУ
// ═══════════════════════════════════════════════════

export async function fetchPriceEstimate(
  result: CalculationResult,
  brandSlug: string
) {
  const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
  if (!brand) {
    return {
      total: 0,
      breakdown: { breakers: 0, rcds: 0, cables: 0, enclosure: 0 },
    };
  }

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

  let breakers = breakerPrice; // вводной
  let rcds = 0;
  let cables = 0;

  for (const line of result.lines) {
    breakers += breakerPrice * (line.breaker.current / 16);

    if (line.rcd) {
      rcds += rcdPrice * (line.rcd.current / 40);
    }

    cables += cablePricePerMeter * 15 * (line.cable.section / 2.5);
  }

  const enclosurePrices: Record<string, number> = {
    "ЩРН-12": 1500,
    "ЩРН-24": 2500,
    "ЩРН-36": 3500,
    "ЩРН-48": 5000,
    "ЩРН-72": 7500,
    "ЩРН-96": 10000,
  };

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
/**
 * ✏️ Обновление проекта — с правами доступа
 */
export async function updateProject(
  projectId: string,
  input: CreateProjectInput
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Необходимо войти в систему");
  }

  const userId = (session.user as any).id;

  // Проверяем, что проект принадлежит пользователю
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Проект не найден или нет доступа");
  }

  const totalPower = input.rooms.reduce(
    (sum, room) =>
      sum + room.consumers.reduce((s, c) => s + c.power * c.quantity, 0),
    0
  );

  // Транзакция: удаляем старые комнаты + создаём новые
  await prisma.$transaction(async (tx) => {
    // Удаляем старый расчёт (панель и линии), если был
    await tx.panel.deleteMany({ where: { projectId } });

    // Удаляем старые комнаты (каскадно удалятся потребители)
    await tx.room.deleteMany({ where: { projectId } });

    // Обновляем сам проект + создаём новые комнаты
    await tx.project.update({
      where: { id: projectId },
      data: {
        name: input.name,
        description: input.description,
        networkType: input.networkType,
        totalPower,
        status: "DRAFT", // сбрасываем статус, т.к. данные изменились
        calculatedPower: null,
        inputCurrent: null,
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
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");

  return { success: true as const, projectId };
}
