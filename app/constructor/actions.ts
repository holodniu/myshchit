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