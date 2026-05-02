"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ProtectionLevel, NetworkType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Требуются права администратора");
  }
  return session;
}

async function getOrCreateSettings() {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: {} });
  }
  return settings;
}

export async function updateSettings(data: {
  lightingDemandFactor?: number;
  socketDemandFactor?: number;
  dedicatedDemandFactor?: number;
  mixedDemandFactor?: number;
  defaultProtectionLevel?: ProtectionLevel;
  defaultNetworkType?: NetworkType;
  defaultCableLength?: number;
  defaultBrandSlug?: string;
  pdfPriceRub?: number;
  subscriptionPriceRub?: number;
  siteTitle?: string;
  siteDescription?: string;
  siteKeywords?: string;
  emailFrom?: string;
  emailWelcomeSubject?: string;
  emailWelcomeBody?: string;
  emailPaymentSubject?: string;
  emailPaymentBody?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactTelegram?: string;
  registrationEnabled?: boolean;
  paymentsEnabled?: boolean;
  maintenanceMode?: boolean;
}) {
  const session = await requireAdmin();
  const settings = await getOrCreateSettings();

  await prisma.siteSettings.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedById: session.user.id,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
