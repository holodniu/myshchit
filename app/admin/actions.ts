"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UserRole, PriceClass } from "@prisma/client";

// Проверка прав ADMIN
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Требуются права администратора");
  }
  return session;
}

// ═══════════════════════════════════════════════════
// 👤 ПОЛЬЗОВАТЕЛИ
// ═══════════════════════════════════════════════════

export async function updateUserRole(userId: string, role: UserRole) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function deleteUserProjects(userId: string) {
  await requireAdmin();

  await prisma.project.deleteMany({
    where: { userId },
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/projects");
  return { success: true };
}

// ═══════════════════════════════════════════════════
// 🏭 БРЕНДЫ
// ═══════════════════════════════════════════════════

export async function updateBrand(
  id: string,
  data: {
    name?: string;
    country?: string;
    description?: string;
    priceClass?: PriceClass;
    website?: string;
  }
) {
  await requireAdmin();

  await prisma.brand.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/brands");
  return { success: true };
}

export async function deleteBrand(id: string) {
  await requireAdmin();

  // Проверяем, есть ли оборудование у бренда
  const count = await prisma.breaker.count({ where: { brandId: id } });
  if (count > 0) {
    throw new Error(
      `Нельзя удалить: у бренда ${count} автоматов. Сначала удалите их.`
    );
  }

  await prisma.brand.delete({ where: { id } });

  revalidatePath("/admin/brands");
  return { success: true };
}

// ═══════════════════════════════════════════════════
// ⚡ ЦЕНЫ ОБОРУДОВАНИЯ
// ═══════════════════════════════════════════════════

export async function updateBreakerPrice(id: string, priceRub: number) {
  await requireAdmin();

  await prisma.breaker.update({
    where: { id },
    data: { priceRub },
  });

  revalidatePath("/admin/breakers");
  return { success: true };
}

export async function updateRcdPrice(id: string, priceRub: number) {
  await requireAdmin();

  await prisma.rcd.update({
    where: { id },
    data: { priceRub },
  });

  revalidatePath("/admin/rcds");
  return { success: true };
}

export async function updateCablePrice(id: string, pricePerMeter: number) {
  await requireAdmin();

  await prisma.cable.update({
    where: { id },
    data: { pricePerMeter },
  });

  revalidatePath("/admin/cables");
  return { success: true };
}

// ═══════════════════════════════════════════════════
// 🔒 АКТИВАЦИЯ / ДЕАКТИВАЦИЯ ОБОРУДОВАНИЯ
// ═══════════════════════════════════════════════════

export async function toggleBreakerActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.breaker.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/breakers");
  return { success: true };
}

export async function toggleRcdActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.rcd.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/rcds");
  return { success: true };
}

export async function toggleCableActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.cable.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/cables");
  return { success: true };
}
