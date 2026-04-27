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
