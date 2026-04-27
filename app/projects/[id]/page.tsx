import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Home, ArrowLeft } from "lucide-react";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const totalPower = project.rooms.reduce(
    (sum, room) =>
      sum + room.consumers.reduce((s, c) => s + c.power * c.quantity, 0),
    0
  );

  const totalConsumers = project.rooms.reduce(
    (sum, r) => sum + r.consumers.length,
    0
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[#787B86] hover:text-[#D1D4DC] mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> К списку проектов
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#D1D4DC] mb-2">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-[#787B86] mb-4">{project.description}</p>
            )}
            <div className="flex gap-4 flex-wrap text-sm">
              <div className="px-3 py-1 bg-[#1E222D] border border-[#363A45] rounded-full text-[#D1D4DC]">
                {project.networkType === "SINGLE_PHASE" ? "220В" : "380В"}
              </div>
              <div className="px-3 py-1 bg-[#1E222D] border border-[#363A45] rounded-full text-[#FF9800]">
                <Zap className="w-4 h-4 inline" />{" "}
                {(totalPower / 1000).toFixed(2)} кВт
              </div>
              <div className="px-3 py-1 bg-[#1E222D] border border-[#363A45] rounded-full text-[#26A69A]">
                <Home className="w-4 h-4 inline" /> {project.rooms.length} комнат
              </div>
              <div className="px-3 py-1 bg-[#1E222D] border border-[#363A45] rounded-full text-[#2962FF]">
                🔌 {totalConsumers} потребителей
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {project.rooms.map((room) => {
              const roomPower = room.consumers.reduce(
                (s, c) => s + c.power * c.quantity,
                0
              );

              return (
                <Card key={room.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{room.name}</CardTitle>
                      <div className="flex gap-2 text-sm">
                        {room.area && (
                          <span className="text-[#787B86]">{room.area} м²</span>
                        )}
                        <span className="text-[#FF9800]">
                          {(roomPower / 1000).toFixed(2)} кВт
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {room.consumers.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between py-2 border-b border-[#363A45] last:border-0"
                        >
                          <div>
                            <span className="text-[#D1D4DC]">{c.name}</span>
                            {c.quantity > 1 && (
                              <span className="ml-2 text-xs text-[#787B86]">
                                × {c.quantity}
                              </span>
                            )}
                            {c.dedicatedLine && (
                              <span className="ml-2 text-xs text-[#2962FF]">
                                ● отдельная линия
                              </span>
                            )}
                          </div>
                          <div className="text-[#787B86]">
                            {c.power * c.quantity} Вт
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-[#FF9800]/10 border-[#FF9800]/30">
            <CardContent className="py-6 text-center">
              <div className="text-[#D1D4DC] mb-2">
                🚧 Расчёт автоматов появится на Этапе 5
              </div>
              <div className="text-sm text-[#787B86]">
                Сейчас проект сохранён в БД. Дальше добавим подбор
                автоматов, УЗО и кабелей.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
