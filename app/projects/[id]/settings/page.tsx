import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) notFound();
  if (project.userId !== userId) redirect("/projects");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-2 text-[#787B86] hover:text-[#D1D4DC] mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к проекту
          </Link>

          <h1 className="text-4xl font-bold text-[#D1D4DC] mb-2">
            Настройки проекта
          </h1>
          <p className="text-[#787B86] mb-8">
            {project.name}
          </p>

          <SettingsForm
            projectId={id}
            initialSettings={{
              protectionLevel: project.protectionLevel,
              address: project.address || "",
              clientName: project.clientName || "",
              clientPhone: project.clientPhone || "",
              installerName: project.installerName || "",
              cableLengthAvg: project.cableLengthAvg,
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
