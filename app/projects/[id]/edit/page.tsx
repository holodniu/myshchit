import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConstructorForm from "@/app/constructor/ConstructorForm";
import { ArrowLeft } from "lucide-react";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: { order: "asc" },
        include: { consumers: true },
      },
    },
  });

  if (!project) notFound();

  // Проверка доступа
  if (project.userId !== userId) {
    redirect("/projects");
  }

  // Готовим данные для формы
  const initialData = {
    name: project.name,
    networkType: project.networkType as "SINGLE_PHASE" | "THREE_PHASE",
    rooms: project.rooms.map((r) => ({
      name: r.name,
      area: r.area,
      consumers: r.consumers.map((c) => ({
        type: c.type,
        name: c.name,
        power: c.power,
        quantity: c.quantity,
        dedicatedLine: c.dedicatedLine,
      })),
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-2 text-[#787B86] hover:text-[#D1D4DC] mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к проекту
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#D1D4DC] mb-2">
              Редактирование проекта
            </h1>
            <p className="text-[#787B86]">
              Измените комнаты, потребителей и сохраните — щит пересчитается
            </p>
          </div>

          <ConstructorForm
            mode="edit"
            projectId={id}
            initialData={initialData}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
